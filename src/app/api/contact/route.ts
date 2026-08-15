import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your submission." }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Admin notification service is not configured." }, { status: 503 });
  if (request.headers.get("x-resend-dry-run") === "true") {
    return NextResponse.json({ ok: true, dryRun: true, configured: true });
  }
  const resend = new Resend(apiKey);
  const { name, email, subject, message } = parsed.data;
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "UNIFET Support <onboarding@resend.dev>",
    to: [process.env.SUPPORT_EMAIL ?? "Vicities56@gmail.com"],
    replyTo: email,
    subject: `[Support] ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });
  if (result.error) return NextResponse.json({ error: "Unable to send your message." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
