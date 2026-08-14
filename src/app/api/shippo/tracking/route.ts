import { NextResponse } from "next/server";
import { z } from "zod";
import { getShippoClient } from "@/lib/shippo";

const schema = z.object({ carrier: z.string().min(1), trackingNumber: z.string().min(1), metadata: z.string().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tracking request" }, { status: 400 });
  try {
    const tracking = await getShippoClient().trackingStatus.create({ carrier: parsed.data.carrier, trackingNumber: parsed.data.trackingNumber, metadata: parsed.data.metadata });
    return NextResponse.json({ tracking });
  } catch (error) {
    console.error("[v0] Shippo tracking registration failed", error);
    return NextResponse.json({ error: "Unable to register Shippo tracking" }, { status: 502 });
  }
}
