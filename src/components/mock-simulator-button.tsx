"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Radio } from "lucide-react"

export function MockSimulatorButton({ shipmentId, trackingNumber, onAdvanced }: { shipmentId: string; trackingNumber: string; onAdvanced?: () => void }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [running, setRunning] = useState(false)
  async function advance() {
    setBusy(true)
    try {
      const response = await fetch(`/api/mock/simulate/${shipmentId}`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Unable to advance simulation")
      setMessage(`${trackingNumber}: ${String(payload.status).replaceAll("_", " ")}`)
      if (payload.status === "delivered") setRunning(false)
      onAdvanced?.()
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to advance simulation"); setRunning(false) } finally { setBusy(false) }
  }
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => void advance(), 5000)
    return () => window.clearInterval(timer)
    // The interval intentionally captures the current shipment action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, shipmentId])
  return <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" onClick={() => void advance()} disabled={busy || !shipmentId} className="gap-2"><Radio className="size-3.5" />{busy ? "Advancing…" : "Advance mock GPS"}</Button><Button size="sm" variant={running ? "secondary" : "default"} onClick={() => setRunning((value) => !value)} disabled={busy || !shipmentId}>{running ? "Pause simulation" : "Run every 5s"}</Button>{message && <span className="text-xs text-muted-foreground" role="status">{message}</span>}</div>
}
