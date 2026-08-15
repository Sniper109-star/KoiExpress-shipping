import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), trackingNumber: z.string().trim().min(3), status: z.string().trim().min(2), destination: z.string().trim().min(2), service: z.string().trim().min(2).optional(), eta: z.string().trim().min(2).optional(), trackingUrl: z.string().url().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  const { email, trackingNumber, status, destination, service, eta, trackingUrl } = parsed.data;
  const details = [`Your shipment ${trackingNumber} is ${status.replaceAll("_", " ")}.`, `Destination: ${destination}.`, service ? `Service: ${service}.` : "", eta ? `Estimated delivery: ${eta}.` : "", trackingUrl ? `Track your shipment: ${trackingUrl}` : ""].filter(Boolean).join("\n");
  if (request.headers.get("x-agentmail-dry-run") === "true") return NextResponse.json({ ok: true, dryRun: true, configured: true, provider: "agentmail" });
  const response = await fetch(`https://api.agentmail.to/v0/inboxes/unifet%40agentmail.to/messages/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `shipment-${trackingNumber}-${status}` },
    body: JSON.stringify({ to: email, subject: `Shipment ${trackingNumber} update`, text: details }),
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Unable to send notification." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
