import { Resend } from "resend"
import type { SupabaseClient } from "@supabase/supabase-js"

const templates: Record<string, { subject: string; title: string; message: string }> = {
  draft: { subject: "Shipment created", title: "Shipment created", message: "Your shipment request has been created and is ready for service selection." },
  service_selected: { subject: "Shipment service selected", title: "Service selected", message: "Your shipment service has been selected and is ready for confirmation." },
  label_created: { subject: "Your Unifet label is ready", title: "Label created", message: "Your development shipping label and tracking number are ready." },
  picked_up: { subject: "Your shipment was picked up", title: "Picked up", message: "Your shipment has been picked up and is moving through the Unifet network." },
  in_transit: { subject: "Your shipment is in transit", title: "In transit", message: "Your shipment is currently in transit." },
  out_for_delivery: { subject: "Your shipment arrives today", title: "Out for delivery", message: "Your shipment is out for delivery today." },
  delivered: { subject: "Your shipment was delivered", title: "Delivered", message: "Your shipment has been delivered." },
  delayed: { subject: "Shipment delivery update", title: "Delivery delayed", message: "Your shipment has a delivery exception. We will share another update when more information is available." },
  exception: { subject: "Shipment exception update", title: "Shipment exception", message: "Your shipment needs attention due to a delivery exception." },
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
  const { error: recordError } = await supabase.from("notifications").insert({ shipment_id: shipmentId, title: `${template.title} · ${notificationKey}`, message: text, metadata: { channel: "agentmail", event: status, tracking_number: shipment.tracking_number } })
  if (recordError && recordError.code !== "23505") return { skipped: true, reason: "notification_record_failed" }
  const apiKey = process.env.API
  if (!apiKey) return { recorded: true, sent: false, reason: "email_provider_not_configured" }
  const result = await new Resend(apiKey).emails.send({ from: "UNIFET Logistics <onboarding@resend.dev>", to: [email], subject: template.subject, text })
  if (result.error) return { recorded: true, sent: false, reason: "email_send_failed" }
  return { recorded: true, sent: true }
}
