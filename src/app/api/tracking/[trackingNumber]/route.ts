import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(_request: Request, { params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params
  const normalized = trackingNumber.trim().toUpperCase()
  if (normalized.length < 3) return NextResponse.json({ error: "Invalid tracking number" }, { status: 400 })
  const supabase = createAdminClient()
  const { data: shipment, error } = await supabase.from("shipments").select("*, tracking_events(*)").eq("tracking_number", normalized).maybeSingle()
  if (error) return NextResponse.json({ error: "Tracking is temporarily unavailable" }, { status: 503 })
  if (!shipment) return NextResponse.json({ tracking: null, shipment: null, events: [] })
  const rawEvents = (Array.isArray(shipment.tracking_events) ? shipment.tracking_events : []) as Array<Record<string, unknown>>
  const events = rawEvents.sort((a, b) => new Date(String(a.occurred_at ?? a.created_at ?? 0)).getTime() - new Date(String(b.occurred_at ?? b.created_at ?? 0)).getTime()).map((event) => ({ ...event, message: event.description ?? "Shipment status updated", created_at: event.occurred_at ?? event.created_at }))
  return NextResponse.json({ tracking: { trackingNumber: normalized, status: shipment.status, description: events.at(-1)?.message ?? "Shipment status updated", occurredAt: shipment.updated_at }, shipment: { ...shipment, origin: shipment.pickup_address, destination: shipment.delivery_address, origin_lat: shipment.pickup_latitude, origin_lng: shipment.pickup_longitude, destination_lat: shipment.delivery_latitude, destination_lng: shipment.delivery_longitude, current_lat: shipment.current_latitude, current_lng: shipment.current_longitude, eta: shipment.estimated_delivery_at, last_update: shipment.updated_at }, events })
}
