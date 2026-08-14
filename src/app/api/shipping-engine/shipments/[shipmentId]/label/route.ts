import { NextResponse } from "next/server"
import { purchaseEngineLabel } from "@/lib/shipping-engine"

export async function POST(request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  try {
    const { shipmentId } = await params
    const { rateId } = await request.json()
    return NextResponse.json(await purchaseEngineLabel(shipmentId, rateId))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to purchase label"
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 })
  }
}
