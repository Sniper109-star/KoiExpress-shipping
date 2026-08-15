import type { SupabaseClient } from "@supabase/supabase-js"

const AGENTMAIL_INBOX = "unifet@agentmail.to"

async function sendAgentMail(input: { to: string; subject: string; text: string; idempotencyKey: string }) {
  const apiKey = process.env.AGENTMAIL_API_KEY
  if (!apiKey) return { ok: false as const, reason: "email_provider_not_configured" }
  const response = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(AGENTMAIL_INBOX)}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({ to: input.to, subject: input.subject, text: input.text }),
    cache: "no-store",
  })
  if (!response.ok) return { ok: false as const, reason: "email_send_failed" }
  return { ok: true as const }
}

const templates: Record<string, { subject: string; title: string; message: string }> = {
  draft: { subject: "Your Unifet shipment is confirmed", title: "Shipment created", message: "Your Unifet shipment has been created." },
  out_for_delivery: { subject: "Your Unifet shipment arrives today", title: "Out for delivery", message: "Your shipment is out for delivery today." },
  delivered: { subject: "Your Unifet shipment was delivered", title: "Delivered", message: "Your shipment has been delivered." },
}

export async function notifyShipmentLifecycle(supabase: SupabaseClient, shipmentId: string, status: string) {
  const template = templates[status]
  if (!template) return { skipped: true, reason: "unsupported_status" }
  const { data: shipment } = await supabase.from("shipments").select("id, tracking_number, status, estimated_delivery_at, shipping_cost, service_name, reference_number, recipient:addresses!recipient_address_id(email, name, city, state)").eq("id", shipmentId).maybeSingle()
  if (!shipment) return { skipped: true, reason: "shipment_not_found" }
  const recipient = Array.isArray(shipment.recipient) ? shipment.recipient[0] : shipment.recipient
  const email = recipient?.email
  if (!email || !shipment.tracking_number) return { skipped: true, reason: "missing_customer_email_or_tracking" }
  const notificationKey = `lifecycle:${status}`
  const { data: existing } = await supabase.from("notifications").select("id").eq("shipment_id", shipmentId).eq("title", `${template.title} · ${notificationKey}`).maybeSingle()
  if (existing) return { skipped: true, reason: "already_sent" }
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/track/${shipment.tracking_number}`
  const eta = shipment.estimated_delivery_at ? new Date(shipment.estimated_delivery_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined
  const text = [template.message, `Tracking number: ${shipment.tracking_number}`, recipient?.city ? `Destination: ${recipient.city}, ${recipient.state ?? ""}` : "", shipment.service_name ? `Service: ${shipment.service_name}` : "", eta ? `Estimated delivery: ${eta}` : "", `Track your shipment: ${trackingUrl}`].filter(Boolean).join("\n")
  const result = await sendAgentMail({ to: email, subject: template.subject, text, idempotencyKey: `shipment-${shipmentId}-${status}` })
  if (!result.ok) return { recorded: false, sent: false, reason: result.reason }
  const { error: recordError } = await supabase.from("notifications").insert({ shipment_id: shipmentId, title: `${template.title} · ${notificationKey}`, message: text, metadata: { channel: "agentmail", event: status, tracking_number: shipment.tracking_number, provider: "agentmail", inbox: AGENTMAIL_INBOX } })
  if (recordError && recordError.code !== "23505") return { sent: true, recorded: false, reason: "notification_record_failed" }
  return { recorded: true, sent: true }
}
