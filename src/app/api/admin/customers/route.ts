import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const customers = await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  return NextResponse.json({ success: true, customers });
}
