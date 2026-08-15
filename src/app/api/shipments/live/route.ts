import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") ?? 100) || 100, 100)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ shipments: [] }, { headers: { "Cache-Control": "no-store" } })
  const { data: shipments, error } = await supabase.from("shipments").select("*, sender:addresses!sender_address_id(*), recipient:addresses!recipient_address_id(*), labels(*), tracking_events(*)").eq("created_by", user.id).order("created_at", { ascending: false }).limit(limit)
  if (error) return NextResponse.json({ error: "Unable to load shipments" }, { status: 500 })
  return NextResponse.json({ shipments: (shipments ?? []).map((shipment) => ({ ...shipment, tracking_number: shipment.tracking_number, origin: shipment.sender?.line1 ?? "", destination: shipment.recipient?.line1 ?? "", customer: shipment.recipient?.name ?? "", service: shipment.service_name ?? "Unselected", price: shipment.shipping_cost ?? shipment.quoted_amount ?? 0, label: shipment.labels?.[0] ?? null, tracking: shipment.tracking_events ?? [] })) }, { headers: { "Cache-Control": "no-store" } })
}
