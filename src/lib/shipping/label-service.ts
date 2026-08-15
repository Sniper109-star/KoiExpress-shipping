import { customMockCarrier } from "./carriers/custom"
import { labelRequestSchema, type LabelRequest } from "./types"

export async function createLabel(request: LabelRequest) {
  return customMockCarrier.createLabel(labelRequestSchema.parse(request))
}

export async function cancelLabel(trackingNumber: string) {
  return customMockCarrier.cancelLabel(trackingNumber)
}
