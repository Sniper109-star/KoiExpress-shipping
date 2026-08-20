import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getRates } from "@/lib/shipping/rate-service"
import { addressSchema, packageSchema } from "@/lib/shipping/types"
import { createServiceRoleClient, guestAccessFrom } from "@/lib/guest-shipment-access"

const schema = z.object({
  shipmentId: z.string().uuid().optional(),
  origin: addressSchema,
  destination: addressSchema,
  packages: z.array(packageSchema).min(1).max(50),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Enter valid origin, destination, and package details." }, { status: 400 })
  const sessionSupabase = await createClient()
  const { data: { user } } = await sessionSupabase.auth.getUser()
  const supabase = user ? sessionSupabase : createServiceRoleClient()
  if (!user && parsed.data.shipmentId && !guestAccessFrom(request, parsed.data.shipmentId)) return NextResponse.json({ error: "Shipment access token required." }, { status: 401 })
  try {
    const result = await getRates(parsed.data)
    if (!parsed.data.shipmentId) return NextResponse.json({ ...result, notice: "Rates are from the Unifet test carrier." })
    let shipmentQuery = supabase.from("shipments").select("id").eq("id", parsed.data.shipmentId)
    if (user) shipmentQuery = shipmentQuery.eq("created_by", user.id)
    const { data: shipment } = await shipmentQuery.maybeSingle()
    if (!shipment) return NextResponse.json({ error: "Shipment not found." }, { status: 404 })
    await supabase.from("shipping_rates").delete().eq("shipment_id", shipment.id)
    const rows = result.rates.map((rate) => ({ shipment_id: shipment.id, carrier_code: rate.carrier.toLowerCase().replaceAll(" ", "_"), carrier_name: rate.carrier, service_code: rate.serviceCode, service_name: rate.service, amount: rate.amount, currency: rate.currency, estimated_days: rate.estimatedDays, provider: result.source, provider_payload: rate.metadata ?? {} }))
    const { data: saved, error } = await supabase.from("shipping_rates").insert(rows).select()
    if (error) return NextResponse.json({ error: "Unable to save rates." }, { status: 500 })
    const { error: statusError } = await supabase.from("shipments").update({ status: "quoted", updated_at: new Date().toISOString() }).eq("id", shipment.id).in("status", ["draft", "quoted"])
    if (statusError) return NextResponse.json({ error: "Rates were calculated but the shipment could not be updated." }, { status: 500 })
    await supabase.from("tracking_events").insert({ shipment_id: shipment.id, status: "quoted", description: "Shipping rates calculated", provider: result.source, occurred_at: new Date().toISOString() })
    return NextResponse.json({ rates: saved ?? [], source: result.source, notice: "Test carrier rates; no carrier credentials used." })
  } catch {
    return NextResponse.json({ error: "Shipping rates are temporarily unavailable." }, { status: 503 })
  }
}
