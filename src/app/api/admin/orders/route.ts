import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("shipments").select("*").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load orders" }, { status: 500 });
  return NextResponse.json({ success: true, orders: data });
}
