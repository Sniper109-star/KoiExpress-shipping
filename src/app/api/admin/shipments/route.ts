import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { shipments } from "@/lib/db/schema"
import { getAdminUser } from "@/lib/admin-auth"

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.string().min(1).max(40).optional(),
  driver_name: z.string().max(120).nullable().optional(),
  vehicle: z.string().max(120).nullable().optional(),
  eta: z.string().datetime().nullable().optional(),
  last_update: z.string().max(500).nullable().optional(),
})

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
  return NextResponse.json({ shipment })
}
