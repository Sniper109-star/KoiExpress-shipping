import { customMockCarrier } from "./carriers/custom"

export async function getTracking(trackingNumber: string) {
  return customMockCarrier.getTracking(trackingNumber.trim().toUpperCase())
}
