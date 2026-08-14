import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { shipments, trackingEvents } from "@/lib/db/schema"
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
  return NextResponse.json({ shipment }, { status: 201 })
}

export async function GET() {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: "Sign in to view shipments." }, { status: 401 })
  const rows = await db.select().from(shipments).where(eq(shipments.createdByUserId, session.user.id))
  return NextResponse.json({ shipments: rows })
}
