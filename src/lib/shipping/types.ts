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
  weight: z.number().positive().max(5000),
  weightUnit: z.enum(["kg", "lb"]).default("kg"),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  dimensionUnit: z.enum(["cm", "in"]).default("cm"),
  packageType: z.string().trim().default("parcel"),
})

export const rateRequestSchema = z.object({
  origin: addressSchema,
  destination: addressSchema,
  packages: z.array(packageSchema).min(1).max(50),
})

export const labelRequestSchema = rateRequestSchema.extend({
  rate: z.object({
    carrier: z.string(),
    service: z.string(),
    serviceCode: z.string(),
    amount: z.number().nonnegative(),
    currency: z.string().length(3),
  }),
})

export type Address = z.infer<typeof addressSchema>
export type ShippingPackage = z.infer<typeof packageSchema>
export type RateRequest = z.infer<typeof rateRequestSchema>
export type LabelRequest = z.infer<typeof labelRequestSchema>

export type Rate = {
  carrier: string
  service: string
  serviceCode: string
  amount: number
  currency: string
  estimatedDays: number
  metadata?: Record<string, unknown>
}

export type RateResult = { rates: Rate[]; source: "mock" | "carrier" }
export type LabelResult = {
  labelId: string
  trackingNumber: string
  labelUrl: string | null
  labelFormat: "PDF" | "ZPL"
  carrier: string
  service: string
  isTest: boolean
}
export type TrackingResult = {
  trackingNumber: string
  status: "label_created" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "exception"
  location?: string
  description: string
  occurredAt: string
  source: "mock" | "carrier"
}
