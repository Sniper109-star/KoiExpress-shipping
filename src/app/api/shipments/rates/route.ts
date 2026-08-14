import { NextResponse } from "next/server"
import { z } from "zod"
import { getShippingRates } from "@/lib/services/shipping/shipping-service"

const schema = z.object({ origin: z.object({ city: z.string().min(2), state: z.string().optional(), postalCode: z.string().optional(), country: z.string().min(2) }), destination: z.object({ city: z.string().min(2), state: z.string().optional(), postalCode: z.string().optional(), country: z.string().min(2) }), weightKg: z.number().positive().max(5000), dimensions: z.string().max(120).optional(), service: z.string().optional() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter valid shipment and package details." }, { status: 400 })
  try { return NextResponse.json({ rates: await getShippingRates({ origin: parsed.data.origin, destination: parsed.data.destination, package: { weightKg: parsed.data.weightKg, dimensions: parsed.data.dimensions, itemType: "parcel", declaredValueCents: 0 } }) }) } catch { return NextResponse.json({ error: "Shipping rates are temporarily unavailable." }, { status: 503 }) }
}
