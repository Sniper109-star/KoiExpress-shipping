import { getCarrierAdapter } from "./carrier-registry"

export async function getTracking(trackingNumber: string) {
  return getCarrierAdapter().getTracking(trackingNumber.trim().toUpperCase())
}
