import "server-only"
import { getShippingRates, createShippingLabel, type RateRequest } from "./karrio-client"

export async function quoteShipment(request: RateRequest) {
  return getShippingRates(request)
}

export async function bookShipment(input: RateRequest & { trackingNumber: string; service: string }) {
  return createShippingLabel(input)
}
