import { NextResponse } from "next/server"
import { z } from "zod"

const statuses = ["submitted", "approved", "label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"] as const
const bodySchema = z.object({ status: z.enum(statuses).optional() })

export async function POST(request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  const body = bodySchema.safeParse(await request.json().catch(() => ({})))
  const requested = body.success ? body.data.status : undefined
  const nextStatus = requested ?? statuses[Math.min(Math.max(shipmentId.length % statuses.length, 0) + 1, statuses.length - 1)]
  return NextResponse.json({ shipmentId, status: nextStatus, message: `Shipment status advanced to ${nextStatus.replaceAll("_", " ")}.`, simulated: true })
}
