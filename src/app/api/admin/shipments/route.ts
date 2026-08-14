import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { auditLogs, shipments, trackingEvents } from "@/lib/db/schema"
import { getAdminUser } from "@/lib/admin-auth"

const createSchema = z.object({
  tracking_number: z.string().min(3).max(80),
  origin: z.string().min(2).max(160),
  destination: z.string().min(2).max(160),
  status: z.string().min(1).max(40).optional(),
  eta: z.preprocess((value) => value === "" ? null : value, z.string().datetime().nullable().optional()),
  driver_name: z.string().max(120).nullable().optional(),
})

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.string().min(1).max(40).optional(),
  driver_name: z.string().max(120).nullable().optional(),
  vehicle: z.string().max(120).nullable().optional(),
  eta: z.string().datetime().nullable().optional(),
  last_update: z.string().max(500).nullable().optional(),
})

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid shipment details" }, { status: 400 })
  try {
    const [shipment] = await db.insert(shipments).values({ trackingNumber: parsed.data.tracking_number, origin: parsed.data.origin, destination: parsed.data.destination, status: parsed.data.status ?? "pending", eta: parsed.data.eta ? new Date(parsed.data.eta) : null, driverName: parsed.data.driver_name ?? null }).returning()
    await Promise.all([
      db.insert(trackingEvents).values({ shipmentId: shipment.id, status: shipment.status, location: shipment.origin, message: "Shipment created" }),
      db.insert(auditLogs).values({ userId: admin.email, action: "shipment_created", resource: "shipment", resourceId: shipment.id, description: `Shipment ${shipment.trackingNumber} created` }),
    ])
    return NextResponse.json({ shipment }, { status: 201 })
  } catch { return NextResponse.json({ error: "Unable to create shipment" }, { status: 409 }) }
}

export async function DELETE(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  const id = new URL(request.url).searchParams.get("id")
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid shipment id" }, { status: 400 })
  const [shipment] = await db.update(shipments).set({ status: "cancelled", updatedAt: new Date(), lastUpdate: "Cancelled by administrator" }).where(eq(shipments.id, id)).returning()
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
  await Promise.all([
    db.insert(trackingEvents).values({ shipmentId: shipment.id, status: "cancelled", location: shipment.lastUpdate, message: "Shipment cancelled by administrator" }),
    db.insert(auditLogs).values({ userId: admin.email, action: "shipment_cancelled", resource: "shipment", resourceId: shipment.id, description: `Shipment ${shipment.trackingNumber} cancelled` }),
  ])
  return NextResponse.json({ shipment })
}

export async function PATCH(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid shipment update" }, { status: 400 })
  const { id, status, driver_name, vehicle, eta, last_update } = parsed.data
  const [shipment] = await db.update(shipments).set({
    ...(status === undefined ? {} : { status }),
    ...(driver_name === undefined ? {} : { driverName: driver_name }),
    ...(vehicle === undefined ? {} : { vehicle }),
    ...(eta === undefined ? {} : { eta: eta ? new Date(eta) : null }),
    ...(last_update === undefined ? {} : { lastUpdate: last_update }),
    updatedAt: new Date(),
  }).where(eq(shipments.id, id)).returning()
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
  if (status !== undefined) {
    await Promise.all([
      db.insert(trackingEvents).values({ shipmentId: shipment.id, status: shipment.status, location: shipment.lastUpdate, message: last_update ?? `Status changed from ${shipment.status} to ${status}` }),
      db.insert(auditLogs).values({ userId: (await getAdminUser())?.email, action: "shipment_status_changed", resource: "shipment", resourceId: shipment.id, description: `Shipment ${shipment.trackingNumber} status changed to ${status}` }),
    ])
  }
  return NextResponse.json({ shipment })
}
