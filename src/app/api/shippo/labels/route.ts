import { NextResponse } from "next/server";
import { z } from "zod";
import { getShippoClient } from "@/lib/shippo";

const schema = z.object({ shipment: z.string().min(1), rate: z.string().min(1), labelFileType: z.enum(["PDF", "PNG", "ZPLII"]).default("PDF"), async: z.boolean().default(false) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid label request" }, { status: 400 });
  try {
    const transaction = await getShippoClient().transactions.create({ rate: parsed.data.rate, labelFileType: parsed.data.labelFileType, async: parsed.data.async });
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("[v0] Shippo label creation failed", error);
    return NextResponse.json({ error: "Unable to create shipping label" }, { status: 502 });
  }
}
