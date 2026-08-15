"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReplicationPanel() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [message, setMessage] = useState("Use HTTPS GitHub repository URLs. Credentials must never be included in URLs.");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setMessage("Queueing secure repository replication…");
    try {
      const response = await fetch("/api/replicate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceUrl, targetUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to queue replication");
      setMessage(`Queued job ${data.jobId}. Poll ${data.statusUrl} for status.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to queue replication"); }
    finally { setBusy(false); }
  }

  return <Card>
    <CardHeader><CardTitle>Repository replication</CardTitle><CardDescription>Queue a secure mirror operation between approved GitHub repositories.</CardDescription></CardHeader>
    <CardContent className="flex flex-col gap-4">
      <div className="flex flex-col gap-2"><Label htmlFor="replication-source">Source repository</Label><Input id="replication-source" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://github.com/org/source.git" /></div>
      <div className="flex flex-col gap-2"><Label htmlFor="replication-target">Target repository</Label><Input id="replication-target" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="https://github.com/org/target.git" /></div>
      <Button onClick={() => void submit()} disabled={busy || !sourceUrl || !targetUrl}>{busy ? "Queueing…" : "Queue replication"}</Button>
      <p className="text-xs text-muted-foreground">{message}</p>
    </CardContent>
  </Card>;
}
