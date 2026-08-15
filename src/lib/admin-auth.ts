import { createClient } from "@/lib/supabase/server"

export type AdminUser = { id: string; email: string; role: string }

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null
  const role = typeof user.app_metadata?.role === "string" ? user.app_metadata.role : null
  if (role === "admin" || role === "operations") return { id: user.id, email: user.email, role }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role === "admin" || profile?.role === "operations") return { id: user.id, email: user.email, role: profile.role }
  return null
}

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
