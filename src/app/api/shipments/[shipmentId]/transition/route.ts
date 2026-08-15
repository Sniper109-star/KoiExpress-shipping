import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const inputSchema = z.object({
  action: z.enum(['select_service', 'pay', 'create_label', 'advance', 'cancel', 'refund']),
  rate_id: z.string().uuid().optional(),
})

const nextStatus: Record<string, string> = {
  select_service: 'service_selected',
  pay: 'paid',
  create_label: 'label_created',
  picked_up: 'picked_up',
  in_transit: 'in_transit',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
}

const trackingDescriptions: Record<string, string> = {
  service_selected: 'Carrier service selected',
  paid: 'Payment captured by internal test provider',
  label_created: 'Shipping label created',
  picked_up: 'Package picked up',
  in_transit: 'Shipment is in transit',
  out_for_delivery: 'Shipment is out for delivery',
  delivered: 'Shipment delivered',
  cancelled: 'Shipment cancelled',
  refunded: 'Shipment payment refunded',
}

export async function POST(request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  const parsed = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid transition.' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { data: shipment, error: shipmentError } = await supabase.from('shipments').select('*, packages(*)').eq('id', shipmentId).single()
  if (shipmentError || !shipment) return NextResponse.json({ error: 'Shipment not found.' }, { status: 404 })

  let status = shipment.status as string
  if (parsed.data.action === 'select_service') {
    if (!parsed.data.rate_id) return NextResponse.json({ error: 'Select a shipping rate.' }, { status: 400 })
    const { data: rate } = await supabase.from('shipping_rates').select('*').eq('id', parsed.data.rate_id).eq('shipment_id', shipmentId).single()
    if (!rate) return NextResponse.json({ error: 'Rate not found.' }, { status: 404 })
    status = nextStatus.select_service
    await supabase.from('shipments').update({ status, carrier_code: rate.carrier_code, carrier_name: rate.carrier_name, service_code: rate.service_code, service_name: rate.service_name, quoted_amount: rate.amount, shipping_cost: rate.amount, estimated_delivery_at: new Date(Date.now() + rate.estimated_days * 86400000).toISOString() }).eq('id', shipmentId)
  } else if (parsed.data.action === 'pay') {
    if (!['service_selected', 'payment_pending'].includes(shipment.status)) return NextResponse.json({ error: 'Select a service before payment.' }, { status: 409 })
    status = 'paid'
    await supabase.from('payments').insert({ business_id: shipment.business_id, shipment_id: shipmentId, amount: shipment.shipping_cost ?? shipment.quoted_amount ?? 0.01, currency: shipment.currency, method: 'mock', provider: 'internal-mock', provider_payment_id: `mock_${crypto.randomUUID()}`, status: 'paid' })
    await supabase.from('shipments').update({ status, paid_at: new Date().toISOString() }).eq('id', shipmentId)
  } else if (parsed.data.action === 'create_label') {
    if (shipment.status !== 'paid') return NextResponse.json({ error: 'Payment is required before label creation.' }, { status: 409 })
    status = 'label_created'
    const trackingNumber = `UF${Date.now().toString(36).toUpperCase()}`
    await supabase.from('shipments').update({ status, tracking_number: trackingNumber }).eq('id', shipmentId)
    for (const pkg of shipment.packages ?? []) {
      await supabase.from('labels').insert({ shipment_id: shipmentId, package_id: pkg.id, tracking_number: trackingNumber, carrier_code: shipment.carrier_code ?? 'unifet', service_code: shipment.service_code ?? 'ground', barcode_value: trackingNumber, qr_payload: `/track?tracking=${trackingNumber}` })
    }
  } else if (parsed.data.action === 'cancel' || parsed.data.action === 'refund') {
    status = parsed.data.action === 'cancel' ? 'cancelled' : 'refunded'
    await supabase.from('shipments').update({ status }).eq('id', shipmentId)
    if (status === 'refunded') await supabase.from('payments').update({ status: 'refunded' }).eq('shipment_id', shipmentId).eq('status', 'paid')
  } else {
    const currentIndex = ['label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].indexOf(shipment.status)
    const statuses = ['label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']
    if (currentIndex < 0 || currentIndex >= statuses.length - 1) return NextResponse.json({ error: 'Shipment cannot advance from its current status.' }, { status: 409 })
    status = statuses[currentIndex + 1]
    await supabase.from('shipments').update({ status, ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}) }).eq('id', shipmentId)
  }

  await supabase.from('tracking_events').insert({ shipment_id: shipmentId, status, description: trackingDescriptions[status] ?? 'Shipment updated' })
  return NextResponse.json({ shipment_id: shipmentId, status })
}
