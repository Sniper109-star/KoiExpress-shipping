import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { shipments, trackingEvents, shippingShipments, shippingEvents, shippingParcels } from "@/lib/db/schema"
import { headers } from "next/headers"

const schema = z.object({ origin: z.string().min(2).max(160), destination: z.string().min(2).max(160), packageDetails: z.object({ description: z.string().min(2).max(240), weightKg: z.number().positive().max(5000), dimensions: z.string().max(120).optional(), itemType: z.string().max(80), declaredValueCents: z.number().int().nonnegative().max(100000000) }), carrier: z.string().min(2).max(120), shippingCost: z.number().int().positive().max(100000000), paymentStatus: z.enum(["unpaid", "awaiting_payment", "paid"]).default("unpaid") })

async function getSession() { return auth.api.getSession({ headers: await headers() }) }

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: "Sign in to create a shipment." }, { status: 401 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter valid shipment details." }, { status: 400 })
  const trackingNumber = `UF${Date.now().toString(36).toUpperCase()}`
  const [shipment] = await db.insert(shipments).values({ trackingNumber, origin: parsed.data.origin, destination: parsed.data.destination, status: parsed.data.paymentStatus === "awaiting_payment" ? "pending_payment" : "submitted", packageDetails: parsed.data.packageDetails, carrier: parsed.data.carrier, shippingCost: parsed.data.shippingCost, paymentStatus: parsed.data.paymentStatus, customerId: session.user.id, createdByUserId: session.user.id, createdByRole: "customer" }).returning()
  await db.insert(trackingEvents).values({ shipmentId: shipment.id, status: shipment.status, location: shipment.origin, message: "Shipment request submitted by customer" })
  try {
    const [engineShipment] = await db.insert(shippingShipments).values({ userId: session.user.id, publicId: trackingNumber, status: shipment.status, origin: { address: shipment.origin }, destination: { address: shipment.destination }, currency: "USD", shippingCostCents: shipment.shippingCost }).onConflictDoNothing().returning()
    if (engineShipment) {
      await db.insert(shippingParcels).values({ shipmentId: engineShipment.id, userId: session.user.id, weight: parsed.data.packageDetails.weightKg, weightUnit: "kg", packageType: parsed.data.packageDetails.itemType, declaredValueCents: parsed.data.packageDetails.declaredValueCents, description: parsed.data.packageDetails.description })
      await db.insert(shippingEvents).values({ shipmentId: engineShipment.id, userId: session.user.id, eventType: "shipment.created.legacy", idempotencyKey: `legacy:${shipment.id}`, payload: { legacyShipmentId: shipment.id, trackingNumber } }).onConflictDoNothing()
    }
  } catch (error) {
    console.error("[v0] Legacy shipment bridge unavailable", error)
  }
  return NextResponse.json({ shipment }, { status: 201 })
}

export async function GET() {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: "Sign in to view shipments." }, { status: 401 })
  const rows = await db.select().from(shipments).where(eq(shipments.createdByUserId, session.user.id))
  return NextResponse.json({ shipments: rows })
}
