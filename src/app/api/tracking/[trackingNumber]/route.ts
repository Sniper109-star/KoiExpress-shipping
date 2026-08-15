import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getTracking } from "@/lib/shipping/tracking-service"

export async function GET(_request: Request, { params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params
  const normalized = trackingNumber.trim().toUpperCase()
  if (normalized.length < 3) return NextResponse.json({ error: "Invalid tracking number" }, { status: 400 })
  const supabase = await createClient()
  const { data: shipment } = await supabase.from("shipments").select("*, tracking_events(*)").eq("tracking_number", normalized).maybeSingle()
  if (shipment) {
    const events = (shipment.tracking_events ?? []).sort((a: { occurred_at?: string; created_at?: string }, b: { occurred_at?: string; created_at?: string }) => new Date(a.occurred_at ?? a.created_at ?? 0).getTime() - new Date(b.occurred_at ?? b.created_at ?? 0).getTime())
    return NextResponse.json({ tracking: { trackingNumber: normalized, status: shipment.status, description: shipment.tracking_events?.at(-1)?.description ?? "Shipment status updated", occurredAt: shipment.updated_at }, shipment, events })
  }
  const tracking = await getTracking(normalized)
  return NextResponse.json({ tracking, events: tracking ? [{ ...tracking, status: tracking.status }] : [] })
}
