import { NextResponse } from "next/server"
import { calculateEngineRates } from "@/lib/shipping-engine"

export async function POST(request: Request) {
  try {
    return NextResponse.json(await calculateEngineRates(await request.json()))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate shipping rates"
    const status = message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
