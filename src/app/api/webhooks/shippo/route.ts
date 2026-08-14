import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shipments, trackingEvents, shippoWebhookEvents } from "@/lib/db/schema";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload) return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  const eventId = String(payload.event_id ?? payload.object_id ?? crypto.randomUUID());
  const eventType = String(payload.event ?? payload.type ?? "TRACKING_UPDATED");
  const data = (payload.data ?? payload.object ?? payload) as Record<string, unknown>;
  const trackingNumber = String(data.tracking_number ?? data.trackingNumber ?? "");
  const existing = await db.select({ id: shippoWebhookEvents.id }).from(shippoWebhookEvents).where(eq(shippoWebhookEvents.eventId, eventId)).limit(1);
  if (existing.length) return NextResponse.json({ ok: true, duplicate: true });
  await db.insert(shippoWebhookEvents).values({ eventId, eventType, trackingNumber: trackingNumber || null, payload });
  if (trackingNumber) {
    const shipment = await db.select({ id: shipments.id }).from(shipments).where(eq(shipments.trackingNumber, trackingNumber)).limit(1);
    if (shipment[0]) {
      const status = String(data.status ?? eventType).toLowerCase();
      const location = typeof data.location === "string" ? data.location : null;
      await db.update(shipments).set({ status, lastUpdate: `${eventType}: ${location ?? "carrier update"}`, updatedAt: new Date() }).where(eq(shipments.id, shipment[0].id));
      await db.insert(trackingEvents).values({ shipmentId: shipment[0].id, status, location, message: `Carrier update: ${eventType}` });
    }
  }
  return NextResponse.json({ ok: true });
}
