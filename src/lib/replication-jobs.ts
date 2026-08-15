import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

export type ReplicationStatus = "queued" | "processing" | "completed" | "failed";
export type ReplicationJob = { id: string; status: ReplicationStatus; createdAt: string; startedAt?: string; completedAt?: string; failedAt?: string; error?: string };

const jobs = new Map<string, ReplicationJob>();

export function isAllowedRepositoryUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && url.hostname === "github.com" && /^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(url.pathname);
  } catch { return false; }
}

function publicJob(job: ReplicationJob): ReplicationJob { return { ...job, error: job.error ? "Replication failed. Check server logs for details." : undefined }; }
export function getReplicationJob(id: string) { const job = jobs.get(id); return job ? publicJob(job) : null; }

async function run(jobId: string, sourceUrl: string, targetUrl: string) {
  const job = jobs.get(jobId); if (!job) return;
  job.status = "processing"; job.startedAt = new Date().toISOString();
  let directory: string | undefined;
  try {
    directory = await mkdtemp(path.join(tmpdir(), "unifet-replication-"));
    const mirrorPath = path.join(directory, "mirror.git");
    const options = { timeout: 120_000, maxBuffer: 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } };
    await execFileAsync("git", ["clone", "--mirror", sourceUrl, mirrorPath], options);
    await execFileAsync("git", ["push", "--mirror", targetUrl], { ...options, cwd: mirrorPath });
    job.status = "completed"; job.completedAt = new Date().toISOString();
  } catch (error) { job.status = "failed"; job.failedAt = new Date().toISOString(); job.error = error instanceof Error ? error.message : "unknown"; }
  finally { if (directory) await rm(directory, { recursive: true, force: true }).catch(() => undefined); }
}

export function queueReplication(sourceUrl: string, targetUrl: string) {
  const job: ReplicationJob = { id: randomUUID(), status: "queued", createdAt: new Date().toISOString() };
  jobs.set(job.id, job); setImmediate(() => void run(job.id, sourceUrl, targetUrl)); return publicJob(job);
}
