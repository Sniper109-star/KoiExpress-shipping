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
    const rawEvents = Array.isArray(shipment.tracking_events) ? shipment.tracking_events : []
    const events = rawEvents
      .sort((a: { created_at?: string }, b: { created_at?: string }) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime())
      .map((event: Record<string, unknown>) => ({
        ...event,
        message: event.description ?? "Shipment status updated",
        created_at: event.created_at ?? shipment.updated_at,
      }))
    const normalizedShipment = {
      ...shipment,
      origin: shipment.pickup_address,
      destination: shipment.delivery_address,
      origin_lat: shipment.pickup_latitude,
      origin_lng: shipment.pickup_longitude,
      destination_lat: shipment.delivery_latitude,
      destination_lng: shipment.delivery_longitude,
      eta: shipment.estimated_delivery_at,
      driver_name: null,
      vehicle: null,
      last_update: shipment.updated_at,
    }
    return NextResponse.json({ tracking: { trackingNumber: normalized, status: shipment.status, description: events.at(-1)?.message ?? "Shipment status updated", occurredAt: shipment.updated_at }, shipment: normalizedShipment, events })
  }
  const tracking = await getTracking(normalized)
  return NextResponse.json({ tracking, events: tracking ? [{ ...tracking, status: tracking.status }] : [] })
}
