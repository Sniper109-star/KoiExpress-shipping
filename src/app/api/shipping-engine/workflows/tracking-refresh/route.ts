import { Receiver } from "@upstash/qstash"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { shippingEvents, shippingShipments, shippingTrackingEvents } from "@/lib/db/schema"
import { qstashReceiver } from "@/lib/qstash-workflow"

const status = "in_transit"

export async function POST(request: Request) {
  const keys = qstashReceiver()
  if (!keys) return NextResponse.json({ error: "Workflow signing keys are not configured" }, { status: 503 })

  const body = await request.text()
  const receiver = new Receiver(keys)
  const signature = request.headers.get("upstash-signature")
  if (!signature || !(await receiver.verify({ signature, body }))) return NextResponse.json({ error: "Invalid workflow signature" }, { status: 401 })

  const payload = JSON.parse(body) as { shipmentId?: string; trackingNumber?: string }
  if (!payload.shipmentId || !payload.trackingNumber) return NextResponse.json({ error: "Invalid workflow payload" }, { status: 400 })

  const shipment = await db.select({ userId: shippingShipments.userId }).from(shippingShipments).where(and(eq(shippingShipments.id, payload.shipmentId), eq(shippingShipments.trackingNumber, payload.trackingNumber))).limit(1)
  if (!shipment[0]) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })

  await db.update(shippingShipments).set({ status, updatedAt: new Date() }).where(eq(shippingShipments.id, payload.shipmentId))
  await db.insert(shippingTrackingEvents).values({ shipmentId: payload.shipmentId, userId: shipment[0].userId, eventKey: `qstash:${payload.shipmentId}:in_transit`, status, message: "Shipment entered transit after scheduled carrier refresh" }).onConflictDoNothing()
  await db.insert(shippingEvents).values({ shipmentId: payload.shipmentId, userId: shipment[0].userId, eventType: "shipment.in_transit", idempotencyKey: `qstash:${payload.shipmentId}:in_transit`, payload: { source: "upstash-qstash", trackingNumber: payload.trackingNumber } }).onConflictDoNothing()

  return NextResponse.json({ ok: true, shipmentId: payload.shipmentId, status })
}
