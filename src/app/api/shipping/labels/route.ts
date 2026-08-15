import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createLabel } from "@/lib/shipping/label-service"
import { labelRequestSchema } from "@/lib/shipping/types"
import { notifyShipmentLifecycle } from "@/lib/shipment-notifications"

const schema = labelRequestSchema.extend({ shipmentId: z.string().uuid() })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid shipment and selected rate." }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in before creating a label." }, { status: 401 })
  const { data: shipment } = await supabase.from("shipments").select("id").eq("id", parsed.data.shipmentId).eq("created_by", user.id).maybeSingle()
  if (!shipment) return NextResponse.json({ error: "Shipment not found." }, { status: 404 })
  try {
    const label = await createLabel(parsed.data)
    const labelUrl = `/api/shipments/${shipment.id}/documents?type=shipping_label`
    const { data: saved, error } = await supabase.from("labels").upsert({ shipment_id: shipment.id, tracking_number: label.trackingNumber, carrier_code: label.carrier.toLowerCase().replaceAll(" ", "_"), service_code: label.service, format: label.labelFormat, document_url: labelUrl, barcode_value: label.trackingNumber, qr_payload: `/track?tracking=${label.trackingNumber}`, source: "mock" }, { onConflict: "tracking_number" }).select().single()
    if (error) return NextResponse.json({ error: "Unable to save label." }, { status: 500 })
    await supabase.from("shipments").update({ status: "label_created", tracking_number: label.trackingNumber, carrier_name: label.carrier, service_name: label.service, updated_at: new Date().toISOString() }).eq("id", shipment.id).in("status", ["paid", "label_created"])
    await supabase.from("tracking_events").upsert({ shipment_id: shipment.id, status: "label_created", description: "Test shipping label created", provider: "custom_mock", provider_event_id: label.labelId, occurred_at: new Date().toISOString() }, { onConflict: "provider_event_id" })
    void notifyShipmentLifecycle(supabase, shipment.id, "label_created").catch(() => undefined)
    return NextResponse.json({ label: { ...label, labelUrl, databaseId: saved.id }, notice: "Test adapter label. No production carrier charge or label was created." }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unable to create shipping label." }, { status: 503 })
  }
}
