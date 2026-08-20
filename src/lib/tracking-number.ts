import { randomInt } from "node:crypto"

const TRACKING_DIGITS = 9
const MIN_TRACKING_VALUE = 10 ** (TRACKING_DIGITS - 1)
const MAX_TRACKING_VALUE = 10 ** TRACKING_DIGITS

export function generateTrackingNumber() {
  return `UNF${randomInt(MIN_TRACKING_VALUE, MAX_TRACKING_VALUE)}`
}

export function trackingUrl(trackingNumber: string) {
  return `/track/${encodeURIComponent(trackingNumber)}`
}
