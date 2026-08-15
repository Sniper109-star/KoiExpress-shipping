import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const steps = [
  { status: "picked_up", location: "Origin facility", latitudeOffset: 0.08, longitudeOffset: 0.08, description: "Shipment picked up" },
  { status: "in_transit", location: "Regional hub", latitudeOffset: 0.3, longitudeOffset: 0.28, description: "Shipment is in transit" },
  { status: "in_transit", location: "Route checkpoint A", latitudeOffset: 0.52, longitudeOffset: 0.5, description: "Shipment passed location A" },
  { status: "in_transit", location: "Route checkpoint B", latitudeOffset: 0.7, longitudeOffset: 0.68, description: "Shipment passed location B" },
  { status: "in_transit", location: "Route checkpoint C", latitudeOffset: 0.84, longitudeOffset: 0.82, description: "Shipment passed location C" },
  { status: "out_for_delivery", location: "Local delivery depot", latitudeOffset: 0.94, longitudeOffset: 0.94, description: "Shipment is out for delivery" },
  { status: "delivered", location: "Destination", latitudeOffset: 1, longitudeOffset: 1, description: "Shipment delivered" },
] as const

const bodySchema = z.object({ step: z.number().int().min(0).max(steps.length - 1).optional() })

export async function POST(request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: "Invalid simulator step" }, { status: 400 })
  const { data: shipment } = await supabase.from("shipments").select("id, pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, business_id").eq("id", shipmentId).maybeSingle()
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
  const { data: member } = await supabase.from("business_members").select("business_id").eq("business_id", shipment.business_id).eq("user_id", user.id).maybeSingle()
  if (!member) return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  const { count } = await supabase.from("tracking_events").select("id", { count: "exact", head: true }).eq("shipment_id", shipmentId).eq("provider", "unifet-mock")
  const step = parsed.data.step ?? Math.min(count ?? 0, steps.length - 1)
  const point = steps[step]
  const originLat = Number(shipment.pickup_latitude ?? 40.7128), originLng = Number(shipment.pickup_longitude ?? -74.006)
  const destinationLat = Number(shipment.delivery_latitude ?? 40.7306), destinationLng = Number(shipment.delivery_longitude ?? -73.935)
  const latitude = originLat + (destinationLat - originLat) * point.latitudeOffset
  const longitude = originLng + (destinationLng - originLng) * point.longitudeOffset
  const now = new Date().toISOString()
  const event = await supabase.from("tracking_events").insert({ shipment_id: shipmentId, status: point.status, location: point.location, description: point.description, latitude, longitude, provider: "unifet-mock", provider_event_id: `mock-${shipmentId}-${step}`, occurred_at: now }).select().single()
  if (event.error) return NextResponse.json({ error: "Unable to write tracking event" }, { status: 500 })
  const remainingMinutes = Math.max(0, Math.round((1 - point.latitudeOffset) * 240))
  const update = await supabase.from("shipments").update({ status: point.status, current_latitude: latitude, current_longitude: longitude, estimated_delivery_at: new Date(Date.now() + remainingMinutes * 60 * 1000).toISOString(), updated_at: now, ...(point.status === "delivered" ? { delivered_at: now } : {}) }).eq("id", shipmentId)
  if (update.error) return NextResponse.json({ error: "Unable to update shipment" }, { status: 500 })
  return NextResponse.json({ step, totalSteps: steps.length, status: point.status, latitude, longitude, event: event.data })
}
