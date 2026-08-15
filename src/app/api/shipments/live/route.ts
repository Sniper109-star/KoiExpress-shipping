import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { shipments, trackingEvents } from "@/lib/db/schema";

export async function GET(request: Request) {
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") ?? 8) || 8, 20);
  const rows = await db.select({ id: shipments.id, tracking_number: shipments.trackingNumber, origin: shipments.origin, destination: shipments.destination, origin_lat: shipments.originLat, origin_lng: shipments.originLng, destination_lat: shipments.destinationLat, destination_lng: shipments.destinationLng, status: shipments.status, updated_at: shipments.updatedAt }).from(shipments).orderBy(desc(shipments.updatedAt)).limit(limit);
  const ids = rows.map((row) => row.id);
  const locations = ids.length ? await db.select({ shipmentId: trackingEvents.shipmentId, latitude: trackingEvents.latitude, longitude: trackingEvents.longitude, location: trackingEvents.location, createdAt: trackingEvents.createdAt }).from(trackingEvents).orderBy(desc(trackingEvents.createdAt)).limit(100) : [];
  const latestByShipment = new Map<string, (typeof locations)[number]>();
  for (const location of locations) if (!latestByShipment.has(location.shipmentId)) latestByShipment.set(location.shipmentId, location);
  return NextResponse.json({ shipments: rows.map((row) => ({ ...row, liveLocation: latestByShipment.get(row.id) ?? null })) }, { headers: { "Cache-Control": "no-store" } });
}
