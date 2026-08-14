import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { shippingEvents, shippingLabels, shippingParcels, shippingRates, shippingShipments, shippingTrackingEvents } from "@/lib/db/schema"
import { getShippingRates, createShippingLabel, trackWithShippingProvider, voidShippingLabel } from "@/lib/services/shipping/shipping-service"
import { scheduleShipmentTrackingRefresh } from "@/lib/qstash-workflow"
import type { Rate, ShipmentDraft } from "../../packages/core/src"

export const shippingEngineInput = z.object({
  origin: z.record(z.string(), z.unknown()),
  destination: z.record(z.string(), z.unknown()),
  parcels: z.array(z.object({ weight: z.number().positive(), weightUnit: z.string().default("kg"), length: z.number().positive().optional(), width: z.number().positive().optional(), height: z.number().positive().optional(), dimensionUnit: z.string().default("cm"), packageType: z.string().default("parcel"), description: z.string().optional(), quantity: z.number().int().positive().default(1), declaredValueCents: z.number().int().nonnegative().default(0) })).min(1),
  referenceNumber: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
  insuranceCents: z.number().int().nonnegative().default(0),
  signatureRequired: z.boolean().default(false),
})

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

function toDraft(input: z.infer<typeof shippingEngineInput>): ShipmentDraft {
  return {
    origin: input.origin as ShipmentDraft["origin"],
    destination: input.destination as ShipmentDraft["destination"],
    package: { weightKg: input.parcels.reduce((total, parcel) => total + parcel.weight * parcel.quantity, 0), itemType: input.parcels[0]?.packageType ?? "parcel", declaredValueCents: input.parcels.reduce((total, parcel) => total + parcel.declaredValueCents * parcel.quantity, 0) },
  }
}

export async function calculateEngineRates(raw: unknown) {
  const userId = await requireUserId()
  const input = shippingEngineInput.parse(raw)
  const rates = await getShippingRates(toDraft(input))
  const shipment = await db.insert(shippingShipments).values({ userId, publicId: `UF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, origin: input.origin, destination: input.destination, referenceNumber: input.referenceNumber, notes: input.notes, insuranceCents: input.insuranceCents, signatureRequired: input.signatureRequired }).returning({ id: shippingShipments.id, publicId: shippingShipments.publicId })
  const created = shipment[0]
  if (!created) throw new Error("Unable to create shipment draft")
  await db.insert(shippingParcels).values(input.parcels.map((parcel) => ({ shipmentId: created.id, userId, weight: parcel.weight, weightUnit: parcel.weightUnit, length: parcel.length, width: parcel.width, height: parcel.height, dimensionUnit: parcel.dimensionUnit, packageType: parcel.packageType, description: parcel.description, quantity: parcel.quantity, declaredValueCents: parcel.declaredValueCents })))
  const persisted = await db.insert(shippingRates).values(rates.map((rate) => ({ shipmentId: created.id, userId, carrierCode: rate.carrier.toLowerCase().replaceAll(" ", "-"), carrierName: rate.carrier, serviceName: rate.service, serviceCode: rate.service.toLowerCase(), amountCents: rate.amountCents, currency: rate.currency, estimatedDays: rate.estimatedDays ?? null, totalCents: rate.amountCents, raw: rate }))).returning()
  return { shipment: created, rates: persisted }
}

export async function purchaseEngineLabel(shipmentId: string, rateId: string) {
  const userId = await requireUserId()
  const [shipment, rate] = await Promise.all([db.select().from(shippingShipments).where(and(eq(shippingShipments.id, shipmentId), eq(shippingShipments.userId, userId))).limit(1), db.select().from(shippingRates).where(and(eq(shippingRates.id, rateId), eq(shippingRates.shipmentId, shipmentId), eq(shippingRates.userId, userId))).limit(1)])
  if (!shipment[0] || !rate[0]) throw new Error("Shipment or rate not found")
  const record = shipment[0]
  const selected = rate[0]
  const result = await createShippingLabel({ origin: record.origin as ShipmentDraft["origin"], destination: record.destination as ShipmentDraft["destination"], package: { weightKg: 1, itemType: "parcel", declaredValueCents: 0 }, rate: selected as unknown as Rate, trackingNumber: `UF${Date.now().toString().slice(-9)}` })
  const trackingNumber = result.trackingNumber
  const labelId = `LBL-${crypto.randomUUID().slice(0, 12).toUpperCase()}`
  await db.update(shippingShipments).set({ status: "label_purchased", carrierCode: selected.carrierCode, serviceCode: selected.serviceCode, shippingCostCents: selected.totalCents, trackingNumber, updatedAt: new Date() }).where(and(eq(shippingShipments.id, shipmentId), eq(shippingShipments.userId, userId)))
  const label = await db.insert(shippingLabels).values({ shipmentId, userId, labelId, trackingNumber, carrierCode: selected.carrierCode, serviceCode: selected.serviceCode, labelFormat: "SVG", labelUrl: result.labelUrl }).returning()
  await db.insert(shippingEvents).values({ shipmentId, userId, eventType: "shipment.label_purchased", idempotencyKey: `label:${shipmentId}:${labelId}`, payload: { trackingNumber, rateId, labelId } }).onConflictDoNothing()
  const workflow = await scheduleShipmentTrackingRefresh({ shipmentId, trackingNumber })
  return { shipmentId, trackingNumber, label: label[0], workflow }
}

export async function getEngineTracking(shipmentId: string) {
  const userId = await requireUserId()
  const shipment = await db.select().from(shippingShipments).where(and(eq(shippingShipments.id, shipmentId), eq(shippingShipments.userId, userId))).limit(1)
  if (!shipment[0]) throw new Error("Shipment not found")
  const events = await db.select().from(shippingTrackingEvents).where(and(eq(shippingTrackingEvents.shipmentId, shipmentId), eq(shippingTrackingEvents.userId, userId))).orderBy(desc(shippingTrackingEvents.occurredAt))
  return { shipment: shipment[0], events }
}

export async function cancelEngineShipment(shipmentId: string) {
  const userId = await requireUserId()
  const shipment = await db.select().from(shippingShipments).where(and(eq(shippingShipments.id, shipmentId), eq(shippingShipments.userId, userId))).limit(1)
  if (!shipment[0]) throw new Error("Shipment not found")
  if (shipment[0].trackingNumber) await voidShippingLabel(shipment[0].trackingNumber)
  await db.update(shippingShipments).set({ status: "cancelled", updatedAt: new Date() }).where(and(eq(shippingShipments.id, shipmentId), eq(shippingShipments.userId, userId)))
  await db.insert(shippingEvents).values({ shipmentId, userId, eventType: "shipment.cancelled", idempotencyKey: `cancel:${shipmentId}`, payload: {} }).onConflictDoNothing()
  return { shipmentId, status: "cancelled" }
}

export { trackWithShippingProvider }
