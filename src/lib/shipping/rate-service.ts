import { getCarrierAdapter } from "./carrier-registry"
import { rateRequestSchema, type RateRequest } from "./types"

export async function getRates(request: RateRequest) {
  return getCarrierAdapter().getRates(rateRequestSchema.parse(request))
}

export const rateCarrier = getCarrierAdapter()
