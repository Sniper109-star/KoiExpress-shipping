import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password })
  if (error || !data.user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle()
  const role = profile?.role ?? data.user.app_metadata?.role
  if (role !== "admin" && role !== "operations") {
    await supabase.auth.signOut()
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 })
  }
  return NextResponse.json({ ok: true, role })
}
