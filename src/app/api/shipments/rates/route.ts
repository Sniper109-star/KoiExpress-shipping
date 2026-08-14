import { NextResponse } from "next/server"
import { z } from "zod"
import { getShippingRates } from "@/lib/services/shipping/shipping-service"

const address = z.object({ name: z.string().optional(), street1: z.string().min(1), city: z.string().min(2), state: z.string().optional(), postalCode: z.string().min(1), country: z.string().length(2), phone: z.string().optional(), email: z.string().email().optional() })
const schema = z.object({ origin: address, destination: address, parcels: z.array(z.object({ weightKg: z.number().positive().max(5000), lengthCm: z.number().positive().optional(), widthCm: z.number().positive().optional(), heightCm: z.number().positive().optional(), itemType: z.string().optional() })).min(1) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter complete addresses and valid package details." }, { status: 400 })
  try {
    return NextResponse.json({ rates: await getShippingRates({ origin: parsed.data.origin, destination: parsed.data.destination, package: { ...parsed.data.parcels[0], itemType: parsed.data.parcels[0].itemType ?? "Parcel", declaredValueCents: 0, dimensions: undefined } }) })
  } catch { return NextResponse.json({ error: "Shipping rates are temporarily unavailable." }, { status: 503 }) }
}
