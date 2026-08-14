import "server-only"

export type ShippingAddress = { city: string; state?: string; postalCode?: string; country: string }
export type RateRequest = { origin: ShippingAddress; destination: ShippingAddress; weightKg: number; dimensions?: string; service?: string }
export type ShippingRate = { provider: "karrio-compatible"; carrier: string; service: string; amountCents: number; currency: string; estimatedDays: number }

const KARRIO_URL = process.env.KARRIO_URL?.replace(/\/$/, "")

function localRate(request: RateRequest): ShippingRate[] {
  const weight = Math.max(request.weightKg, 0.1)
  const factor = request.service === "express" ? 1.8 : request.service === "priority" ? 1.35 : 1
  const international = request.origin.country.toLowerCase() !== request.destination.country.toLowerCase()
  const base = (international ? 3200 : 1400) + Math.round(weight * 650)
  return [
    { provider: "karrio-compatible", carrier: "Unifet Network", service: "Standard", amountCents: Math.round(base * factor), currency: "USD", estimatedDays: international ? 7 : 3 },
    { provider: "karrio-compatible", carrier: "Unifet Express", service: "Express", amountCents: Math.round(base * 1.8), currency: "USD", estimatedDays: international ? 3 : 1 },
  ]
}

export async function getShippingRates(request: RateRequest): Promise<ShippingRate[]> {
  if (!KARRIO_URL) return localRate(request)
  const response = await fetch(`${KARRIO_URL}/v1/shipping/rates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shipper: request.origin, consignee: request.destination, parcels: [{ weight: request.weightKg, weight_unit: "KG", dimensions: request.dimensions }] }), cache: "no-store" })
  if (!response.ok) throw new Error("Shipping rates unavailable")
  const payload = await response.json() as { rates?: Array<{ carrier_name?: string; service?: string; price?: number; currency?: string; delivery_days?: number }> }
  return (payload.rates ?? []).map((rate) => ({ provider: "karrio-compatible", carrier: rate.carrier_name ?? "Carrier", service: rate.service ?? "Standard", amountCents: Math.round((rate.price ?? 0) * 100), currency: rate.currency ?? "USD", estimatedDays: rate.delivery_days ?? 5 }))
}

export async function createShippingLabel(input: { trackingNumber: string; origin: ShippingAddress; destination: ShippingAddress; weightKg: number; service: string }) {
  if (!KARRIO_URL) return { provider: "karrio-compatible" as const, trackingNumber: input.trackingNumber, labelUrl: null, status: "label_pending" as const }
  const response = await fetch(`${KARRIO_URL}/v1/shipping/labels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" })
  if (!response.ok) throw new Error("Shipping label unavailable")
  return response.json() as Promise<{ provider: "karrio-compatible"; trackingNumber: string; labelUrl?: string; status: string }>
}

export async function trackWithShippingProvider(trackingNumber: string) {
  if (!KARRIO_URL) return null
  const response = await fetch(`${KARRIO_URL}/v1/shipping/tracking/${encodeURIComponent(trackingNumber)}`, { cache: "no-store" })
  if (!response.ok) return null
  return response.json()
}
