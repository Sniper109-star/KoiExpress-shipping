import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { shippingEvents, shippingShipments, shippingTrackingEvents } from "@/lib/db/schema"

const eventStatus: Record<string, string> = {
  "shipment.created": "submitted",
  "shipment.label_purchased": "label_created",
  "shipment.picked_up": "picked_up",
  "shipment.in_transit": "in_transit",
  "shipment.out_for_delivery": "out_for_delivery",
  "shipment.delivered": "delivered",
  "shipment.exception": "on_hold",
  "shipment.cancelled": "cancelled",
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-unifet-webhook-secret")
  if (process.env.SHIPPING_WEBHOOK_SECRET && secret !== process.env.SHIPPING_WEBHOOK_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json() as { idempotencyKey?: string; eventType?: string; shipmentId?: string; trackingNumber?: string; location?: string; latitude?: number; longitude?: number; message?: string; payload?: Record<string, unknown> }
    if (!body.idempotencyKey || !body.eventType || !body.shipmentId || !eventStatus[body.eventType]) return NextResponse.json({ error: "Invalid shipping event" }, { status: 400 })
    const existing = await db.select({ id: shippingEvents.id }).from(shippingEvents).where(eq(shippingEvents.idempotencyKey, body.idempotencyKey)).limit(1)
    if (existing[0]) return NextResponse.json({ accepted: true, duplicate: true })
    const shipment = await db.select({ userId: shippingShipments.userId }).from(shippingShipments).where(eq(shippingShipments.id, body.shipmentId)).limit(1)
    if (!shipment[0]) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    const status = eventStatus[body.eventType]
    await db.insert(shippingEvents).values({ shipmentId: body.shipmentId, userId: shipment[0].userId, eventType: body.eventType, idempotencyKey: body.idempotencyKey, payload: body.payload ?? body })
    await db.update(shippingShipments).set({ status, trackingNumber: body.trackingNumber, updatedAt: new Date() }).where(eq(shippingShipments.id, body.shipmentId))
    await db.insert(shippingTrackingEvents).values({ shipmentId: body.shipmentId, userId: shipment[0].userId, eventKey: body.idempotencyKey, status, location: body.location, latitude: body.latitude, longitude: body.longitude, message: body.message ?? `Shipment status updated to ${status}` }).onConflictDoNothing()
    return NextResponse.json({ accepted: true, status })
  } catch {
    return NextResponse.json({ error: "Unable to process shipping event" }, { status: 400 })
  }
}
