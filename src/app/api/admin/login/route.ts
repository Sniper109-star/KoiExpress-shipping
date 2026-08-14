import { NextResponse } from "next/server"
import { z } from "zod"
import { createAdminSession } from "@/lib/admin-session"

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  const adminEmail = process.env.EMAIL_3?.trim()
  const adminPassword = process.env.PASSWORD_3
  const configured = Boolean(adminEmail && adminPassword && !adminEmail.includes("process.env") && !adminPassword.includes("process.env"))
  if (!configured) return NextResponse.json({ error: "Admin credentials are not configured" }, { status: 503 })
  if (parsed.data.email !== adminEmail || parsed.data.password !== adminPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set("admin_session", await createAdminSession(parsed.data.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  })
  return response
}
