"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FlaskConical, ExternalLink } from "lucide-react"

export function CreateTestShipmentButton() {
  const [busy, setBusy] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  async function createTestShipment() {
    setBusy(true); setMessage("")
    try {
      const response = await fetch("/api/dev/test-shipment", { method: "POST" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Unable to create test shipment")
      setTrackingUrl(payload.trackingUrl)
      setMessage(`Created ${payload.trackingNumber}`)
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create test shipment") } finally { setBusy(false) }
  }
  return <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => void createTestShipment()} disabled={busy} className="gap-2"><FlaskConical className="size-4" />{busy ? "Creating test shipment…" : "Create test shipment"}</Button>{trackingUrl && <Link href={trackingUrl} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Open tracking <ExternalLink className="size-3" /></Link>}{message && <span className="text-xs text-muted-foreground" role="status">{message}</span>}</div>
}
