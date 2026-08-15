import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  if (!z.string().uuid().safeParse(shipmentId).success) return NextResponse.json({ error: 'Invalid shipment id' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const { data: shipment } = await supabase.from('shipments').select('id').eq('id', shipmentId).eq('created_by', user.id).maybeSingle()
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
  const { data, error } = await supabase.from('tracking_events').select('*').eq('shipment_id', shipmentId).order('occurred_at', { ascending: true }).order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: 'Unable to load tracking events' }, { status: 500 })
  return NextResponse.json({ events: data ?? [], source: 'supabase' }, { headers: { 'Cache-Control': 'no-store' } })
}
