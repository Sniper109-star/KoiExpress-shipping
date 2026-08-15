import { customMockCarrier } from "./carriers/custom"
import type { CarrierAdapter } from "./carrier"
import { rateRequestSchema, type RateRequest } from "./types"

const adapter: CarrierAdapter = customMockCarrier

export async function getRates(request: RateRequest) {
  return adapter.getRates(rateRequestSchema.parse(request))
}

export { adapter as rateCarrier }
