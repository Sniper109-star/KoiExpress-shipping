import type { Address, LabelRequest, LabelResult, RateRequest, RateResult, TrackingResult } from "./types"

export interface CarrierAdapter {
  readonly code: string
  readonly name: string
  getRates(request: RateRequest): Promise<RateResult>
  createLabel(request: LabelRequest): Promise<LabelResult>
  cancelLabel(trackingNumber: string): Promise<{ cancelled: boolean }>
  getTracking(trackingNumber: string): Promise<TrackingResult | null>
  validateAddress(address: Address): Promise<{ valid: boolean; normalized?: Address }>
}
