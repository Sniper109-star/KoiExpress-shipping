import type { CarrierAdapter } from "../../carrier"
import type { Address, LabelRequest, RateRequest, TrackingResult } from "../../types"

const stages: TrackingResult["status"][] = ["label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"]

function stableToken(value: string) {
  let hash = 2166136261
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase()
}

export class CustomMockCarrier implements CarrierAdapter {
  readonly code = "UNIFET_CARRIER"
  readonly name = "Unifet Test Carrier"

  async getRates(request: RateRequest) {
    const rates = [
      ["Ground", "ground", 8.95, 4, "3–5 days"],
      ["Priority", "priority", 14.5, 3, "2–3 days"],
      ["Express", "express", 24, 2, "1–2 days"],
    ].map(([service, serviceCode, amount, days, deliveryRange]) => ({
      carrier: this.code,
      service: service as string,
      serviceCode: serviceCode as string,
      amount: amount as number,
      currency: "USD",
      estimatedDays: days as number,
      metadata: { adapter: "custom-mock", test: true, deliveryRange },
    }))
    return { rates, source: "mock" as const }
  }

  async createLabel(request: LabelRequest) {
    const fingerprint = stableToken(JSON.stringify({ origin: request.origin, destination: request.destination, rate: request.rate }))
    const trackingNumber = `UFTEST${fingerprint}${stableToken(request.rate.serviceCode)}`
    return { labelId: `LBL-TEST-${fingerprint}`, trackingNumber, labelUrl: null, labelFormat: "PDF" as const, carrier: request.rate.carrier, service: request.rate.service, isTest: true }
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
