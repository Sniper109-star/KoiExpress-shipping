import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-session";

export const ADMIN_SESSION_COOKIE = "admin_session";

export async function getAdminUser() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function isAdminRole(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin";
}
