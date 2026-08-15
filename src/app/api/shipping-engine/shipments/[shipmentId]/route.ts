import { NextResponse } from "next/server"
import { cancelEngineShipment, getEngineTracking } from "@/lib/shipping-engine"

export async function GET(_request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  try {
    return NextResponse.json(await getEngineTracking((await params).shipmentId))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load shipment"
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 404 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  try {
    return NextResponse.json(await cancelEngineShipment((await params).shipmentId))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to cancel shipment"
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 })
  }
}
