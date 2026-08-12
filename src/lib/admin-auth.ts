import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_SESSION_COOKIE = "admin_session";

export async function getAdminUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = user.app_metadata?.role ?? user.user_metadata?.role;
  return role === "admin" ? user : null;
}

export function isAdminRole(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin";
}
