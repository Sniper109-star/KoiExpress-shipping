import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Development action unavailable in production." }, { status: 404 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  const { data: member } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle()
  if (!member?.business_id) return NextResponse.json({ error: "Create or join a business before shipping." }, { status: 409 })

  const reference = `DEV-${Date.now().toString(36).toUpperCase()}`
  const trackingNumber = `UNF${Math.floor(100000000 + Math.random() * 899999999)}`
  const origin = { name: "Unifet Test Origin", line1: "1 Hudson Street", city: "New York", state: "NY", postal_code: "10013", country_code: "US" }
  const destination = { name: "Unifet Test Destination", line1: "1 Atlantic Avenue", city: "Boston", state: "MA", postal_code: "02110", country_code: "US" }
  const addresses = await supabase.from("addresses").insert([{ ...origin, business_id: member.business_id }, { ...destination, business_id: member.business_id }]).select("id")
  if (addresses.error || !addresses.data || addresses.data.length !== 2) return NextResponse.json({ error: "Unable to create test addresses." }, { status: 500 })
  const { data: shipment, error } = await supabase.from("shipments").insert({ business_id: member.business_id, reference_number: reference, tracking_number: trackingNumber, sender_address_id: addresses.data[0].id, recipient_address_id: addresses.data[1].id, created_by: user.id, idempotency_key: `dev-${crypto.randomUUID()}`, status: "label_created", pickup_address: "New York, NY", delivery_address: "Boston, MA", pickup_latitude: 40.7128, pickup_longitude: -74.006, delivery_latitude: 42.3601, delivery_longitude: -71.0589, current_latitude: 40.7128, current_longitude: -74.006, estimated_delivery_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() }).select("id, tracking_number").single()
  if (error || !shipment) return NextResponse.json({ error: "Unable to create test shipment." }, { status: 500 })
  await supabase.from("tracking_events").insert({ shipment_id: shipment.id, status: "label_created", description: "Test label created", provider: "unifet-mock", occurred_at: new Date().toISOString(), latitude: 40.7128, longitude: -74.006 })
  return NextResponse.json({ shipmentId: shipment.id, trackingNumber: shipment.tracking_number, trackingUrl: `/track/${shipment.tracking_number}` }, { status: 201 })
}
