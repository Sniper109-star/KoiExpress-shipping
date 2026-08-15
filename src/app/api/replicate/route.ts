import { NextResponse } from "next/server";
import { getReplicationJob, isAllowedRepositoryUrl, queueReplication } from "@/lib/replication-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { sourceUrl?: unknown; targetUrl?: unknown } | null;
  if (!body || !isAllowedRepositoryUrl(body.sourceUrl) || !isAllowedRepositoryUrl(body.targetUrl)) {
    return NextResponse.json({ error: "Use HTTPS GitHub repository URLs ending in .git." }, { status: 400 });
  }
  const job = queueReplication(body.sourceUrl.trim(), body.targetUrl.trim());
  return NextResponse.json({ success: true, message: "Replication job accepted and queued.", jobId: job.id, statusUrl: `/api/replicate/status/${job.id}` }, { status: 202 });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("jobId");
  if (!id) return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  const job = getReplicationJob(id);
  return job ? NextResponse.json({ jobId: id, ...job }) : NextResponse.json({ error: "Job not found" }, { status: 404 });
}
