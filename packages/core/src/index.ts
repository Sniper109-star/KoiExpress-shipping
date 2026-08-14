import { z } from "zod"

export const addressSchema = z.object({
  name: z.string().trim().optional(),
  company: z.string().trim().optional(),
  street1: z.string().trim().min(1),
  street2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  phone: z.string().trim().optional().nullable(),
  email: z.string().email().optional().nullable(),
})

export const packageSchema = z.object({
  weightKg: z.number().positive().max(5000),
  dimensions: z.string().max(120).optional(),
  lengthCm: z.number().positive().optional(),
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  itemType: z.string().trim().min(1).max(80),
  declaredValueCents: z.number().int().nonnegative().max(100000000),
})

export const shipmentStatusSchema = z.enum([
  "draft", "pending_payment", "submitted", "approved", "label_created", "picked_up", "in_transit", "out_for_delivery", "delivered", "cancelled", "on_hold", "failed_delivery", "returned",
])
export type ShipmentStatus = z.infer<typeof shipmentStatusSchema>
export type Address = z.infer<typeof addressSchema>
export type PackageDetails = z.infer<typeof packageSchema>

export const rateSchema = z.object({ provider: z.string(), carrier: z.string(), service: z.string(), amountCents: z.number().int().nonnegative(), currency: z.string().length(3), estimatedDays: z.number().int().positive(), metadata: z.record(z.string(), z.string()).optional() })
export type Rate = z.infer<typeof rateSchema>
export type ShipmentDraft = { origin: Address; destination: Address; package: PackageDetails }
export type Label = { trackingNumber: string; labelUrl: string | null; status: "label_created" | "label_pending" }
export type Tracking = { trackingNumber: string; status: ShipmentStatus; location?: string; message?: string }

export type AdapterCapabilities = { rates: boolean; labels: boolean; tracking: boolean; voiding: boolean; addressValidation: boolean }
export interface ShippingAdapter {
  readonly name: string
  readonly capabilities: AdapterCapabilities
  getRates(input: ShipmentDraft): Promise<Rate[]>
  createShipment(input: ShipmentDraft & { rate: Rate; trackingNumber: string }): Promise<Label>
  getTracking(trackingNumber: string): Promise<Tracking | null>
  voidShipment(trackingNumber: string): Promise<{ success: boolean }>
  validateAddress(address: Address): Promise<{ valid: boolean; normalized?: Address }>
}

export const legalTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ["pending_payment", "submitted", "cancelled"], pending_payment: ["submitted", "cancelled"], submitted: ["approved", "on_hold", "cancelled"], approved: ["label_created", "on_hold", "cancelled"], label_created: ["picked_up", "cancelled"], picked_up: ["in_transit", "failed_delivery", "returned"], in_transit: ["out_for_delivery", "failed_delivery", "returned"], out_for_delivery: ["delivered", "failed_delivery", "returned"], delivered: [], cancelled: [], on_hold: ["approved", "cancelled"], failed_delivery: ["returned", "out_for_delivery"], returned: [],
}
export function canTransition(from: ShipmentStatus, to: ShipmentStatus) { return from === to || legalTransitions[from].includes(to) }
export function assertTransition(from: ShipmentStatus, to: ShipmentStatus) { if (!canTransition(from, to)) throw new Error(`Invalid shipment transition: ${from} -> ${to}`) }

export async function quoteShipment(adapter: ShippingAdapter, input: ShipmentDraft) { return adapter.getRates(input) }
export async function createShipment(adapter: ShippingAdapter, input: ShipmentDraft & { rate: Rate; trackingNumber: string }) { return adapter.createShipment(input) }
export async function trackShipment(adapter: ShippingAdapter, trackingNumber: string) { return adapter.getTracking(trackingNumber) }
export async function cancelShipment(adapter: ShippingAdapter, trackingNumber: string) { return adapter.voidShipment(trackingNumber) }
