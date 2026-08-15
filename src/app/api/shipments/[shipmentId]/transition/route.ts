import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { notifyShipmentLifecycle } from '@/lib/shipment-notifications'

const inputSchema = z.object({
  action: z.enum(['select_service', 'pay', 'create_label', 'advance', 'cancel', 'refund']),
  rate_id: z.string().uuid().optional(),
})

const progression = ['label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'] as const
const descriptions: Record<string, string> = {
  service_selected: 'Carrier service selected',
  paid: 'Payment captured by the internal test provider',
  label_created: 'Shipping label created',
  picked_up: 'Package picked up',
  in_transit: 'Shipment is in transit',
  out_for_delivery: 'Shipment is out for delivery',
  delivered: 'Shipment delivered',
  cancelled: 'Shipment cancelled',
  refunded: 'Shipment payment refunded',
}

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status })
}

export async function POST(request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  if (!z.string().uuid().safeParse(shipmentId).success) return jsonError('Invalid shipment id.', 400)
  const parsed = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Invalid transition request.', 400, parsed.error.flatten())

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonError('Authentication required.', 401)

  const { data: shipment, error: shipmentError } = await supabase
    .from('shipments').select('*, packages(*)').eq('id', shipmentId).eq('created_by', user.id).single()
  if (shipmentError || !shipment) return jsonError('Shipment not found.', 404)

  const current = String(shipment.status)
  if (['delivered', 'cancelled', 'refunded'].includes(current)) return jsonError('This shipment is in a terminal state.', 409)

  let status: string
  let update: Record<string, unknown> = {}
  const { action, rate_id: rateId } = parsed.data

  if (action === 'select_service') {
    if (!rateId) return jsonError('Select a shipping rate.', 422)
    const { data: rate, error } = await supabase.from('shipping_rates').select('*').eq('id', rateId).eq('shipment_id', shipmentId).single()
    if (error || !rate) return jsonError('Rate not found for this shipment.', 404)
    if (!['draft', 'quoted'].includes(current)) return jsonError('A service can only be selected from a quote.', 409)
    status = 'service_selected'
    update = { status, carrier_code: rate.carrier_code, carrier_name: rate.carrier_name, service_code: rate.service_code, service_name: rate.service_name, quoted_amount: rate.amount, shipping_cost: rate.amount, estimated_delivery_at: new Date(Date.now() + Number(rate.estimated_days) * 86400000).toISOString() }
  } else if (action === 'pay') {
    if (!['service_selected', 'payment_pending'].includes(current)) return jsonError('Select a service before payment.', 409)
    const amount = Number(shipment.shipping_cost ?? shipment.quoted_amount)
    if (!Number.isFinite(amount) || amount <= 0) return jsonError('A valid shipping total is required before payment.', 422)
    status = 'paid'
    const payment = await supabase.from('payments').insert({ business_id: shipment.business_id, shipment_id: shipmentId, amount, currency: shipment.currency ?? 'USD', method: 'mock', provider: 'internal-mock', provider_payment_id: `mock_${shipmentId}`, status: 'paid' }).select('id').single()
    if (payment.error && payment.error.code !== '23505') return jsonError('Unable to record payment.', 500)
    update = { status, paid_at: new Date().toISOString() }
  } else if (action === 'create_label') {
    if (current !== 'paid') return jsonError('Payment is required before label creation.', 409)
    status = 'label_created'
    const trackingNumber = shipment.tracking_number ?? `UF${crypto.randomUUID().replaceAll('-', '').slice(0, 14).toUpperCase()}`
    update = { status, tracking_number: trackingNumber }
    for (const pkg of shipment.packages ?? []) {
      const label = await supabase.from('labels').upsert({ shipment_id: shipmentId, package_id: pkg.id, tracking_number: trackingNumber, carrier_code: shipment.carrier_code ?? 'unifet', service_code: shipment.service_code ?? 'ground', barcode_value: trackingNumber, qr_payload: `/track?tracking=${trackingNumber}`, source: 'mock' }, { onConflict: 'tracking_number' }).select('id').single()
      if (label.error) return jsonError('Unable to save shipping label.', 500)
    }
  } else if (action === 'cancel' || action === 'refund') {
    if (action === 'refund' && current !== 'paid') return jsonError('Only paid shipments can be refunded.', 409)
    if (action === 'cancel' && ['picked_up', 'in_transit', 'out_for_delivery'].includes(current)) return jsonError('This shipment cannot be cancelled after pickup.', 409)
    status = action === 'cancel' ? 'cancelled' : 'refunded'
    update = { status, ...(status === 'refunded' ? { refunded_at: new Date().toISOString() } : {}) }
    if (status === 'refunded') {
      const { error } = await supabase.from('payments').update({ status: 'refunded' }).eq('shipment_id', shipmentId).eq('status', 'paid')
      if (error) return jsonError('Unable to record refund.', 500)
    }
  } else {
    const index = progression.indexOf(current as typeof progression[number])
    if (index < 0 || index === progression.length - 1) return jsonError('Shipment cannot advance from its current status.', 409)
    status = progression[index + 1]
    update = { status, ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}) }
  }

  const { error: updateError } = await supabase.from('shipments').update(update).eq('id', shipmentId).eq('status', current)
  if (updateError) return jsonError('Unable to update shipment.', 500)
  const { error: eventError } = await supabase.from('tracking_events').insert({ shipment_id: shipmentId, status, description: descriptions[status] ?? 'Shipment updated', provider: 'unifet', occurred_at: new Date().toISOString() })
  if (eventError) return jsonError('Shipment updated, but tracking event could not be recorded.', 500)
  void notifyShipmentLifecycle(supabase, shipmentId, status).catch(() => undefined)
  return NextResponse.json({ shipment_id: shipmentId, status, source: 'mock' })
}

export async function GET(_request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return jsonError('Authentication required.', 401)
  const { data: shipment } = await supabase.from('shipments').select('id').eq('id', shipmentId).eq('created_by', user.id).maybeSingle()
  if (!shipment) return jsonError('Shipment not found.', 404)
  const { data, error } = await supabase.from('tracking_events').select('*').eq('shipment_id', shipmentId).order('occurred_at', { ascending: true })
  if (error) return jsonError('Unable to load tracking events.', 500)
  return NextResponse.json({ events: data ?? [], source: 'mock' })
}
