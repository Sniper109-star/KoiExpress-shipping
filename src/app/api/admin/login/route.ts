import { NextResponse } from "next/server"
import { z } from "zod"
import { createAdminSession } from "@/lib/admin-session"

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  if (!process.env.EMAIL_2 || !process.env.PASSWORD_2 || parsed.data.email !== process.env.EMAIL_2 || parsed.data.password !== process.env.PASSWORD_2) {
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
