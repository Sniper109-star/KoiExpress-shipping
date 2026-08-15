import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), trackingNumber: z.string().trim().min(3), status: z.string().trim().min(2), destination: z.string().trim().min(2), service: z.string().trim().min(2).optional(), eta: z.string().trim().min(2).optional(), trackingUrl: z.string().url().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY ?? process.env.API;
  if (!apiKey) return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  const resend = new Resend(apiKey);
  const { email, trackingNumber, status, destination, service, eta, trackingUrl } = parsed.data;
  const details = [`Your shipment ${trackingNumber} is ${status.replaceAll("_", " ")}.`, `Destination: ${destination}.`, service ? `Service: ${service}.` : "", eta ? `Estimated delivery: ${eta}.` : "", trackingUrl ? `Track your shipment: ${trackingUrl}` : ""].filter(Boolean).join("\n");
  const result = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL ?? "UNIFET Logistics <onboarding@resend.dev>", to: [email], subject: `Shipment ${trackingNumber} update`, text: details });
  if (result.error) return NextResponse.json({ error: "Unable to send notification." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
