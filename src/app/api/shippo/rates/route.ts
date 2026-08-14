import { NextResponse } from "next/server";
import { z } from "zod";
import { getShippoClient } from "@/lib/shippo";

const address = z.object({ name: z.string().min(1), street1: z.string().min(1), city: z.string().min(1), state: z.string().optional(), zip: z.string().optional(), country: z.string().length(2) });
const schema = z.object({ addressFrom: address, addressTo: address, parcel: z.object({ length: z.string(), width: z.string(), height: z.string(), distanceUnit: z.enum(["in", "cm"]).default("in"), weight: z.string(), massUnit: z.enum(["lb", "kg"]).default("lb") }), shipmentId: z.string().uuid().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid rate request", details: parsed.error.flatten() }, { status: 400 });
  try {
    const shipment = await getShippoClient().shipments.create({ addressFrom: parsed.data.addressFrom, addressTo: parsed.data.addressTo, parcels: [parsed.data.parcel], async: false });
    const rates = (shipment.rates ?? []).map((rate: { objectId?: string; provider?: string; servicelevel?: { name?: string }; amount?: string; currency?: string; estimatedDays?: number; durationTerms?: string }) => ({ objectId: rate.objectId, provider: rate.provider, serviceLevel: rate.servicelevel?.name, amount: rate.amount, currency: rate.currency, estimatedDays: rate.estimatedDays, durationTerms: rate.durationTerms })).sort((a: { amount?: string }, b: { amount?: string }) => Number(a.amount) - Number(b.amount));
    return NextResponse.json({ shipmentId: shipment.objectId, rates });
  } catch (error) {
    console.error("[v0] Shippo rate shopping failed", error);
    return NextResponse.json({ error: "Shippo rate shopping unavailable" }, { status: 502 });
  }
}
