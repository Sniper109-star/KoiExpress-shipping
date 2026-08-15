import type { CarrierAdapter } from "../../carrier"
import type { Address, LabelRequest, RateRequest, TrackingResult } from "../../types"

const stages: TrackingResult["status"][] = ["label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"]

export class CustomMockCarrier implements CarrierAdapter {
  readonly code = "UNIFET_CARRIER"
  readonly name = "Unifet Test Carrier"

  async getRates(request: RateRequest) {
    const totalWeight = request.packages.reduce((sum, parcel) => sum + parcel.weight * (parcel.weightUnit === "lb" ? 0.453592 : 1), 0)
    const international = request.origin.country !== request.destination.country
    const base = (international ? 19 : 12) + totalWeight * 1.15
    const rates = [
      ["Economy", "economy", 0.82, 5],
      ["Standard", "standard", 1, 3],
      ["Priority", "priority", 1.36, 2],
      ["Express", "express", 1.92, 1],
    ].map(([service, serviceCode, factor, days]) => ({
      carrier: this.code,
      service: service as string,
      serviceCode: serviceCode as string,
      amount: Math.round(base * (factor as number) * 100) / 100,
      currency: "USD",
      estimatedDays: (days as number) + (international ? 3 : 0),
      metadata: { adapter: "custom-mock", test: true },
    }))
    return { rates, source: "mock" as const }
  }

  async createLabel(request: LabelRequest) {
    const trackingNumber = `UFTEST${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`
    return { labelId: `LBL-TEST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, trackingNumber, labelUrl: null, labelFormat: "PDF" as const, carrier: request.rate.carrier, service: request.rate.service, isTest: true }
  }

  async cancelLabel(_trackingNumber: string) { return { cancelled: true } }

  async getTracking(trackingNumber: string) {
    if (!trackingNumber.startsWith("UFTEST")) return null
    const stage = stages[Math.min(Math.floor(trackingNumber.charCodeAt(6) / 26 * stages.length), stages.length - 1)]
    return { trackingNumber, status: stage, location: stage === "delivered" ? "Boston, MA" : "Unifet test network", description: `Test shipment ${stage.replaceAll("_", " ")}`, occurredAt: new Date().toISOString(), source: "mock" as const }
  }

  async validateAddress(address: Address) { return { valid: Boolean(address.city && address.postalCode && address.country), normalized: address } }
}

export const customMockCarrier = new CustomMockCarrier()
