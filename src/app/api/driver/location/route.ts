import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { shipments, trackingEvents } from "@/lib/db/schema"
import { headers } from "next/headers"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  try {
    const body = await request.json() as { shipmentId?: string; latitude?: number; longitude?: number; speed?: number; heading?: number; message?: string }
    const { shipmentId, latitude, longitude } = body
    if (!shipmentId || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude as number) > 90 || Math.abs(longitude as number) > 180) return NextResponse.json({ error: "shipmentId, latitude, and longitude are required" }, { status: 400 })
    const [shipment] = await db.select({ id: shipments.id }).from(shipments).where(eq(shipments.id, shipmentId)).limit(1)
    if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    const [event] = await db.insert(trackingEvents).values({ shipmentId, status: "in_transit", location: body.message ?? "Driver location update", latitude, longitude, message: body.message ?? `GPS update${body.speed != null ? ` · ${body.speed} km/h` : ""}` }).returning()
    await db.update(shipments).set({ status: "in_transit", lastUpdate: new Date().toISOString(), updatedAt: new Date() }).where(eq(shipments.id, shipmentId))
    return NextResponse.json({ ok: true, event }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unable to record location" }, { status: 500 })
  }
}
