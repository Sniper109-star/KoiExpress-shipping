import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";

export async function GET(request: Request) {
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") ?? 8) || 8, 20);
  const rows = await db.select({ id: shipments.id, tracking_number: shipments.trackingNumber, destination: shipments.destination, status: shipments.status, updated_at: shipments.updatedAt }).from(shipments).orderBy(desc(shipments.updatedAt)).limit(limit);
  return NextResponse.json({ shipments: rows }, { headers: { "Cache-Control": "no-store" } });
}
