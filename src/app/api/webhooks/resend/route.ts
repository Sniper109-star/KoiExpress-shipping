import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const payload = await request.text();
  if (!secret) return NextResponse.json({ error: "Resend webhook secret is not configured" }, { status: 503 });
  const signature = request.headers.get("x-resend-signing-secret") ?? request.headers.get("svix-signature");
  if (!signature || !signature.includes(secret)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  try {
    const event = JSON.parse(payload) as Record<string, unknown>;
    console.info("[v0] Resend webhook received", String(event.type ?? "unknown"));
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
