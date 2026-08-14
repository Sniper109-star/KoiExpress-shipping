import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { shipments, trackingEvents } from "@/lib/db/schema"

export async function GET(_request: Request, { params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params
  const normalized = trackingNumber.trim().toUpperCase()
  if (normalized.length < 3) return NextResponse.json({ error: "Invalid tracking number" }, { status: 400 })

  const [shipment] = await db.select().from(shipments).where(eq(shipments.trackingNumber, normalized)).limit(1)
  if (!shipment) return NextResponse.json({ shipment: null, events: [] }, { status: 200 })

  const events = await db.select().from(trackingEvents).where(eq(trackingEvents.shipmentId, shipment.id)).orderBy(desc(trackingEvents.createdAt))
  return NextResponse.json({ shipment, events })
}
