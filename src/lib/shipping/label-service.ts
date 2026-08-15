import { getCarrierAdapter } from "./carrier-registry"
import { labelRequestSchema, type LabelRequest } from "./types"

export async function createLabel(request: LabelRequest) {
  return getCarrierAdapter().createLabel(labelRequestSchema.parse(request))
}

export async function cancelLabel(trackingNumber: string) {
  return getCarrierAdapter().cancelLabel(trackingNumber.trim().toUpperCase())
}
