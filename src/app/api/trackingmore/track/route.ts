import { NextResponse } from "next/server";
import { z } from "zod";

const trackSchema = z.object({
  tracking_number: z.string().trim().min(3).max(100),
  courier_code: z.string().trim().min(2).max(100),
});

export async function POST(request: Request) {
  const apiKey = process.env.TRACKINGMORE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Tracking service is not configured." }, { status: 503 });

  const parsed = trackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tracking number and courier code are required." }, { status: 400 });

  try {
    const response = await fetch("https://api.trackingmore.com/v4/trackings/get", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "Tracking-Api-Key": apiKey },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return NextResponse.json({ error: "Tracking provider rejected the request." }, { status: response.status >= 400 && response.status < 500 ? response.status : 502 });
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Tracking provider is temporarily unavailable." }, { status: 502 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
