import { supabase } from '@/lib/supabase'

export type TrackingShipment = {
  id: string
  tracking_number: string
  pickup_address: string
  delivery_address: string
  pickup_latitude: number | null
  pickup_longitude: number | null
  delivery_latitude: number | null
  delivery_longitude: number | null
  status: string
  estimated_delivery_at: string | null
  updated_at: string | null
  driver?: { profile?: { full_name: string | null } | null; vehicle?: { make: string; model: string } | null } | null
}

export type TrackingEvent = {
  id: string
  shipment_id: string
  status: string
  location: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
  created_at: string
}

export async function findShipment(trackingNumber: string) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('shipments')
    .select('id, tracking_number, pickup_address, delivery_address, pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, status, estimated_delivery_at, updated_at, driver:drivers(profile:profiles(full_name), vehicle:vehicles(make, model))')
    .eq('tracking_number', trackingNumber.trim())
    .maybeSingle()
  if (error) throw error
  return data as TrackingShipment | null
}

export async function getTrackingEvents(shipmentId: string) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from('tracking_events').select('*').eq('shipment_id', shipmentId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as TrackingEvent[]
}

export function subscribeToShipment(shipmentId: string, onChange: () => void) {
  if (!supabase) return () => undefined
  const channel = supabase.channel(`shipment-${shipmentId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments', filter: `id=eq.${shipmentId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_events', filter: `shipment_id=eq.${shipmentId}` }, onChange)
    .subscribe()
  return () => { void supabase.removeChannel(channel) }
}
