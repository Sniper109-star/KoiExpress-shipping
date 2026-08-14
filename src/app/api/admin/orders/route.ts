import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const orders = await db.select().from(shipments).orderBy(desc(shipments.updatedAt));
  return NextResponse.json({ success: true, orders });
}
