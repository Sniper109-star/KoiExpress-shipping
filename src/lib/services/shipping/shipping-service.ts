import "server-only"
import { cancelShipment, createShipment, quoteShipment, trackShipment, type ShipmentDraft, type Rate } from "../../../../packages/core/src"
import { shippingAdapter } from "./karrio-client"

export const adapterCapabilities = shippingAdapter.capabilities
export async function getShippingRates(input: ShipmentDraft) { return quoteShipment(shippingAdapter, input) }
export async function createShippingLabel(input: ShipmentDraft & { rate: Rate; trackingNumber: string }) { return createShipment(shippingAdapter, input) }
export async function trackWithShippingProvider(trackingNumber: string) { return trackShipment(shippingAdapter, trackingNumber) }
export async function voidShippingLabel(trackingNumber: string) { return cancelShipment(shippingAdapter, trackingNumber) }
