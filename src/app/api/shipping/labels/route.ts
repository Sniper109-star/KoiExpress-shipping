import { NextResponse } from "next/server"
import { createLabel } from "@/lib/shipping/label-service"
import { labelRequestSchema } from "@/lib/shipping/types"

export async function POST(request: Request) {
  const parsed = labelRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid shipment and selected rate." }, { status: 400 })
  try {
    const label = await createLabel(parsed.data)
    return NextResponse.json({ label, notice: "Test adapter label. No production carrier charge or label was created." }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unable to create shipping label." }, { status: 503 })
  }
}
