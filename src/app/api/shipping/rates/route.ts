import { NextResponse } from "next/server"
import { getRates } from "@/lib/shipping/rate-service"
import { rateRequestSchema } from "@/lib/shipping/types"

export async function POST(request: Request) {
  const parsed = rateRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter complete addresses and valid package details." }, { status: 400 })
  try {
    return NextResponse.json(await getRates(parsed.data))
  } catch {
    return NextResponse.json({ error: "Shipping rates are temporarily unavailable." }, { status: 503 })
  }
}
