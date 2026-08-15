"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Radio } from "lucide-react"

export function MockSimulatorButton({ shipmentId, trackingNumber, onAdvanced }: { shipmentId: string; trackingNumber: string; onAdvanced?: () => void }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  async function advance() {
    setBusy(true)
    try {
      const response = await fetch(`/api/mock/simulate/${shipmentId}`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Unable to advance simulation")
      setMessage(`${trackingNumber}: ${String(payload.status).replaceAll("_", " ")}`)
      onAdvanced?.()
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to advance simulation") } finally { setBusy(false) }
  }
  return <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" onClick={() => void advance()} disabled={busy || !shipmentId} className="gap-2"><Radio className="size-3.5" />{busy ? "Advancing…" : "Advance mock GPS"}</Button>{message && <span className="text-xs text-muted-foreground" role="status">{message}</span>}</div>
}
