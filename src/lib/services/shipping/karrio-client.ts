import "server-only"
import type { AdapterCapabilities, Address, Label, Rate, ShipmentDraft, ShippingAdapter, Tracking } from "../../../../packages/core/src"

const ADAPTER_MODE = process.env.ADAPTER_MODE ?? "mock"
const KARRIO_URL = process.env.KARRIO_URL?.replace(/\/$/, "")

function localRates(input: ShipmentDraft): Rate[] {
  const international = input.origin.country !== input.destination.country
  const base = (international ? 3200 : 1400) + Math.round(input.package.weightKg * 650)
  return [
    { provider: "mock", carrier: "Unifet Network", service: "Standard", amountCents: base, currency: "USD", estimatedDays: international ? 7 : 3 },
    { provider: "mock", carrier: "Unifet Express", service: "Express", amountCents: Math.round(base * 1.8), currency: "USD", estimatedDays: international ? 3 : 1 },
  ]
}

export class KarrioCompatibleAdapter implements ShippingAdapter {
  readonly name = "karrio-compatible"
  readonly capabilities: AdapterCapabilities = { rates: true, labels: Boolean(KARRIO_URL), tracking: Boolean(KARRIO_URL), voiding: Boolean(KARRIO_URL), addressValidation: Boolean(KARRIO_URL) }
  async getRates(input: ShipmentDraft): Promise<Rate[]> {
    if (!KARRIO_URL) return localRates(input).map((rate) => ({ ...rate, provider: this.name }))
    const response = await fetch(`${KARRIO_URL}/v1/shipping/rates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shipper: input.origin, consignee: input.destination, parcels: [{ weight: input.package.weightKg, weight_unit: "KG", dimensions: input.package.dimensions }] }), cache: "no-store" })
    if (!response.ok) throw new Error("Shipping rates unavailable")
    const payload = await response.json() as { rates?: Array<{ carrier_name?: string; service?: string; price?: number; currency?: string; delivery_days?: number }> }
    return (payload.rates ?? []).map((rate) => ({ provider: this.name, carrier: rate.carrier_name ?? "Carrier", service: rate.service ?? "Standard", amountCents: Math.round((rate.price ?? 0) * 100), currency: rate.currency ?? "USD", estimatedDays: rate.delivery_days ?? 5 }))
  }
  async createShipment(input: ShipmentDraft & { rate: Rate; trackingNumber: string }): Promise<Label> {
    if (!KARRIO_URL) return { trackingNumber: input.trackingNumber, labelUrl: null, status: "label_pending" }
    const response = await fetch(`${KARRIO_URL}/v1/shipping/labels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" })
    if (!response.ok) throw new Error("Shipping label unavailable")
    return response.json() as Promise<Label>
  }
  async getTracking(trackingNumber: string): Promise<Tracking | null> {
    if (!KARRIO_URL) return null
    const response = await fetch(`${KARRIO_URL}/v1/shipping/tracking/${encodeURIComponent(trackingNumber)}`, { cache: "no-store" })
    return response.ok ? await response.json() as Tracking : null
  }
  async voidShipment(trackingNumber: string) { if (!KARRIO_URL) return { success: true }; const response = await fetch(`${KARRIO_URL}/v1/shipping/labels/${encodeURIComponent(trackingNumber)}`, { method: "DELETE", cache: "no-store" }); return { success: response.ok } }
  async validateAddress(address: Address) { return { valid: Boolean(address.city && address.country), normalized: address } }
}

if (ADAPTER_MODE !== "mock" && ADAPTER_MODE !== "karrio") throw new Error(`Unsupported ADAPTER_MODE: ${ADAPTER_MODE}`)
export const shippingAdapter: ShippingAdapter = new KarrioCompatibleAdapter()
