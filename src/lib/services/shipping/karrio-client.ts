import "server-only"
import type { AdapterCapabilities, Address, Label, Rate, ShipmentDraft, ShippingAdapter, Tracking } from "../../../../packages/core/src"

const ADAPTER_MODE = process.env.ADAPTER_MODE ?? "mock"
const KARRIO_URL = process.env.KARRIO_URL?.replace(/\/$/, "")

function localRates(input: ShipmentDraft): Rate[] {
  const international = input.origin.country !== input.destination.country
  const base = (international ? 3200 : 1400) + Math.round(input.package.weightKg * 650)
  const carriers = [
    ["Unifet Network", 1, 3], ["Northstar Parcel", 1.06, 4], ["Atlas Freight", 1.12, 5], ["Cedar Express", 1.18, 2],
    ["HarborLine", 1.24, 6], ["Summit Logistics", 1.3, 4], ["BlueRoute", 1.36, 3], ["MetroSprint", 1.42, 2],
    ["Pioneer Cargo", 1.5, 7], ["AeroBridge", 1.62, 3], ["Coastlink", 1.7, 5], ["Evergreen Parcel", 1.78, 6],
  ] as const
  const services = [["Economy", 0.82, 2], ["Standard", 1, 0], ["Priority", 1.34, -1], ["Express", 1.86, -2]] as const
  return carriers.flatMap(([carrier, carrierFactor, carrierDays]) => services.map(([service, serviceFactor, serviceDays], index) => ({
    provider: "unifet",
    carrier,
    service,
    amountCents: Math.round(base * carrierFactor * serviceFactor),
    currency: "USD",
    estimatedDays: Math.max(1, (international ? 6 : 3) + carrierDays + serviceDays),
    metadata: { networkIndex: String(index), coverage: "40+ global carriers" },
  }))).sort((a, b) => a.amountCents - b.amountCents)
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
