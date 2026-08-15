import { NextResponse } from "next/server"
import { getTracking } from "@/lib/shipping/tracking-service"

export async function GET(_request: Request, { params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params
  if (trackingNumber.trim().length < 3) return NextResponse.json({ error: "Invalid tracking number" }, { status: 400 })
  const tracking = await getTracking(trackingNumber)
  return NextResponse.json({ tracking, events: tracking ? [{ ...tracking, status: tracking.status }] : [] })
}
