import "server-only"

import { Client } from "@upstash/qstash"

const qstash = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null

function appOrigin() {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? process.env.V0_DEV_APP_URL
  return origin ? (origin.startsWith("http") ? origin : `https://${origin}`) : null
}

export async function scheduleShipmentTrackingRefresh(payload: { shipmentId: string; trackingNumber: string }) {
  const origin = appOrigin()
  if (!qstash || !origin) return { scheduled: false as const, reason: "QStash or app origin is not configured" }

  const response = await qstash.publishJSON({
    url: `${origin}/api/shipping-engine/workflows/tracking-refresh`,
    body: payload,
    delay: "15m",
    deduplicationId: `tracking-refresh:${payload.shipmentId}`,
    retries: 3,
    headers: { "x-unifet-workflow": "tracking-refresh" },
  })

  return { scheduled: true as const, messageId: response.messageId }
}

export function qstashReceiver() {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY
  if (!currentSigningKey || !nextSigningKey) return null
  return { currentSigningKey, nextSigningKey }
}
