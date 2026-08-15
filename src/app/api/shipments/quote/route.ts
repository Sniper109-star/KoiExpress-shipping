import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ shipment_id: z.string().uuid() })
const carriers = [
  { carrier_code: 'unifet', carrier_name: 'Unifet Network', service_code: 'ground', service_name: 'Ground', amount: 12.5, estimated_days: 3 },
  { carrier_code: 'unifet', carrier_name: 'Unifet Network', service_code: 'express', service_name: 'Express', amount: 24.9, estimated_days: 1 },
  { carrier_code: 'unifet', carrier_name: 'Unifet Network', service_code: 'priority', service_name: 'Priority', amount: 39.0, estimated_days: 1 },
]

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json().catch(() => null))
  if (!input.success) return NextResponse.json({ error: 'Invalid shipment.' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const { data: shipment } = await supabase.from('shipments').select('id,business_id').eq('id', input.data.shipment_id).single()
  if (!shipment) return NextResponse.json({ error: 'Shipment not found.' }, { status: 404 })
  const { data: rates, error } = await supabase.from('shipping_rates').insert(carriers.map((rate) => ({ ...rate, shipment_id: shipment.id, provider: 'internal-mock', currency: 'USD', expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() }))).select()
  if (error) return NextResponse.json({ error: 'Unable to calculate rates.' }, { status: 500 })
  await supabase.from('shipments').update({ status: 'quoted' }).eq('id', shipment.id)
  await supabase.from('tracking_events').insert({ shipment_id: shipment.id, status: 'quoted', description: 'Carrier rates calculated by internal mock provider' })
  return NextResponse.json({ rates })
}
