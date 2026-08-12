import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(), trackingNumber: z.string().trim().min(3),
  status: z.string().trim().min(2), destination: z.string().trim().min(2),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, trackingNumber, status, destination } = parsed.data;
  const result = await resend.emails.send({
    from: "KoiExpress Updates <onboarding@resend.dev>", to: [email],
    subject: `Shipment ${trackingNumber} update`,
    text: `Your shipment ${trackingNumber} is ${status.replaceAll("_", " ")}. Destination: ${destination}.`,
  });
  if (result.error) return NextResponse.json({ error: "Unable to send notification." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
