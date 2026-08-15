import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCarrierAdapter } from '@/lib/shipping/carrier-registry'
import { notifyShipmentLifecycle } from '@/lib/shipment-notifications'

const addressSchema = z.object({
  name: z.string().min(2).max(120),
  line1: z.string().min(2).max(160),
  city: z.string().min(2).max(80),
  state: z.string().max(80).optional(),
  postal_code: z.string().min(2).max(20),
  country_code: z.string().length(2).default('US'),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional(),
})

const schema = z.object({
  reference_number: z.string().min(2).max(80),
  sender: addressSchema,
  recipient: addressSchema,
  package: z.object({ weight_kg: z.number().positive().max(5000), length_cm: z.number().positive(), width_cm: z.number().positive(), height_cm: z.number().positive(), declared_value: z.number().nonnegative().default(0) }),
  item: z.object({ name: z.string().min(2).max(160), quantity: z.number().int().positive().default(1), sku: z.string().max(80).optional(), unit_price: z.number().nonnegative().default(0) }),
  idempotency_key: z.string().max(120).optional(),
})

async function context() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, businessId: null }
  const { data } = await supabase.from('business_members').select('business_id').eq('user_id', user.id).limit(1).maybeSingle()
  return { supabase, user, businessId: data?.business_id ?? null }
}

export async function GET() {
  const { supabase, user, businessId } = await context()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!businessId) return NextResponse.json({ shipments: [] })
  const { data, error } = await supabase.from('shipments').select('*, sender:addresses!sender_address_id(*), recipient:addresses!recipient_address_id(*), tracking_events(*)').eq('business_id', businessId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load shipments' }, { status: 500 })
  return NextResponse.json({ shipments: data ?? [] })
}

export async function POST(request: Request) {
  const { supabase, user, businessId } = await context()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!businessId) return NextResponse.json({ error: 'Create or join a business before shipping.' }, { status: 409 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter valid shipment details.', issues: parsed.error.flatten() }, { status: 400 })
  const input = parsed.data
  const adapter = getCarrierAdapter()
  const toCarrierAddress = (address: typeof input.sender) => ({ name: address.name, street1: address.line1, city: address.city, state: address.state, postalCode: address.postal_code, country: address.country_code, phone: address.phone ?? null, email: address.email ?? null })
  const [senderValidation, recipientValidation] = await Promise.all([adapter.validateAddress(toCarrierAddress(input.sender)), adapter.validateAddress(toCarrierAddress(input.recipient))])
  if (!senderValidation.valid || !recipientValidation.valid) return NextResponse.json({ error: 'Check the sender and recipient addresses.', issues: { sender: senderValidation.valid ? undefined : ['Enter a valid city, postal code, and country.'], recipient: recipientValidation.valid ? undefined : ['Enter a valid city, postal code, and country.'] } }, { status: 422 })
  if (input.idempotency_key) {
    const { data: existing } = await supabase.from('shipments').select('*').eq('business_id', businessId).eq('idempotency_key', input.idempotency_key).maybeSingle()
    if (existing) return NextResponse.json({ shipment: existing, next_step: existing.status === 'draft' ? 'quote' : 'continue', idempotent: true }, { status: 200 })
  }
  const addresses = await supabase.from('addresses').insert([{ ...input.sender, business_id: businessId }, { ...input.recipient, business_id: businessId }]).select('id')
  if (addresses.error || !addresses.data || addresses.data.length !== 2) return NextResponse.json({ error: 'Unable to save shipment addresses.' }, { status: 400 })
  const { data: shipment, error } = await supabase.from('shipments').insert({ business_id: businessId, reference_number: input.reference_number, sender_address_id: addresses.data[0].id, recipient_address_id: addresses.data[1].id, created_by: user.id, idempotency_key: input.idempotency_key ?? crypto.randomUUID(), status: 'draft' }).select().single()
  if (error || !shipment) return NextResponse.json({ error: error?.code === '23505' ? 'A shipment with this reference already exists.' : 'Unable to create shipment.' }, { status: 409 })
  const packageInsert = await supabase.from('packages').insert({ shipment_id: shipment.id, weight_kg: input.package.weight_kg, length_cm: input.package.length_cm, width_cm: input.package.width_cm, height_cm: input.package.height_cm, declared_value: input.package.declared_value })
  const itemInsert = await supabase.from('shipment_items').insert({ shipment_id: shipment.id, name: input.item.name, quantity: input.item.quantity, sku: input.item.sku, unit_price: input.item.unit_price })
  const eventInsert = await supabase.from('tracking_events').insert({ shipment_id: shipment.id, status: 'draft', description: 'Shipment created', provider: 'unifet', occurred_at: new Date().toISOString() })
  if (packageInsert.error || itemInsert.error || eventInsert.error) {
    await supabase.from('shipments').delete().eq('id', shipment.id)
    return NextResponse.json({ error: 'Unable to persist the complete shipment record.' }, { status: 500 })
  }
  void notifyShipmentLifecycle(supabase, shipment.id, 'draft').catch(() => undefined)
  return NextResponse.json({ shipment, next_step: 'quote' }, { status: 201 })
}
