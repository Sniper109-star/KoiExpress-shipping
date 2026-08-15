import { NextResponse } from "next/server"
import { z } from "zod"
import { getRates } from "@/lib/shipping/rate-service"
import { addressSchema } from "@/lib/shipping/types"

const parcel = z.object({ weightKg: z.number().positive().max(5000), lengthCm: z.number().positive().optional(), widthCm: z.number().positive().optional(), heightCm: z.number().positive().optional(), itemType: z.string().optional() })
const schema = z.object({ origin: addressSchema, destination: addressSchema, parcels: z.array(parcel).min(1) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter complete addresses and valid package details." }, { status: 400 })
  try {
    const result = await getRates({ origin: parsed.data.origin, destination: parsed.data.destination, packages: parsed.data.parcels.map((item) => ({ weight: item.weightKg, weightUnit: "kg", length: item.lengthCm, width: item.widthCm, height: item.heightCm, dimensionUnit: "cm", packageType: item.itemType ?? "parcel" })) })
    return NextResponse.json({ rates: result.rates, source: result.source })
  } catch { return NextResponse.json({ error: "Shipping rates are temporarily unavailable." }, { status: 503 }) }
}
