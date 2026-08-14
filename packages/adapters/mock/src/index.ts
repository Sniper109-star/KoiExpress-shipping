import type { AdapterCapabilities, Address, Label, Rate, ShipmentDraft, ShippingAdapter, Tracking } from "../../../core/src"

export class MockShippingAdapter implements ShippingAdapter {
  readonly name = "mock"
  readonly capabilities: AdapterCapabilities = { rates: true, labels: true, tracking: true, voiding: true, addressValidation: true }
  async getRates(input: ShipmentDraft): Promise<Rate[]> { const international = input.origin.country !== input.destination.country; const base = (international ? 3200 : 1400) + Math.round(input.package.weightKg * 650); return [{ provider: this.name, carrier: "Unifet Network", service: "Standard", amountCents: base, currency: "USD", estimatedDays: international ? 7 : 3 }, { provider: this.name, carrier: "Unifet Express", service: "Express", amountCents: Math.round(base * 1.8), currency: "USD", estimatedDays: international ? 3 : 1 }] }
  async createShipment(input: ShipmentDraft & { rate: Rate; trackingNumber: string }): Promise<Label> { return { trackingNumber: input.trackingNumber, labelUrl: null, status: "label_pending" } }
  async getTracking(trackingNumber: string): Promise<Tracking> { return { trackingNumber, status: "submitted", message: "Shipment request received" } }
  async voidShipment() { return { success: true } }
  async validateAddress(address: Address) { return { valid: Boolean(address.city && address.country), normalized: address } }
}
