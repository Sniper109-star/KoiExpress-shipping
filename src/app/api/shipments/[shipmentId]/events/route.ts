import { NextResponse } from "next/server"
import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { shippingEvents, trackingEvents } from "@/lib/db/schema"

export async function GET(_request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  if (!shipmentId || shipmentId.length > 128) return NextResponse.json({ error: "Invalid shipment id" }, { status: 400 })
  const legacy = await db.select().from(trackingEvents).where(eq(trackingEvents.shipmentId, shipmentId)).orderBy(asc(trackingEvents.createdAt))
  const engine = await db.select().from(shippingEvents).where(eq(shippingEvents.shipmentId, shipmentId)).orderBy(asc(shippingEvents.createdAt))
  const events = [...legacy.map((event) => ({ ...event, shipment_id: event.shipmentId, created_at: event.createdAt })), ...engine.map((event) => ({ id: event.id, shipment_id: event.shipmentId, status: event.eventType, location: null, latitude: null, longitude: null, message: event.eventType, created_at: event.createdAt }))]
  return NextResponse.json({ events }, { headers: { "Cache-Control": "no-store" } })
}
