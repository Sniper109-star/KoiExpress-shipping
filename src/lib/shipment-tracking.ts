import { supabase } from '@/lib/supabase'

export type TrackingShipment = {
  id: string
  tracking_number: string
  origin: string
  destination: string
  origin_lat: number | null
  origin_lng: number | null
  destination_lat: number | null
  destination_lng: number | null
  status: string
  eta: string | null
  driver_name: string | null
  vehicle: string | null
  updated_at: string | null
  last_update: string | null
}

export type TrackingEvent = {
  id: string
  shipment_id: string
  status: string
  location: string | null
  latitude: number | null
  longitude: number | null
  message: string
  created_at: string
}

export async function findShipment(trackingNumber: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select('id, tracking_number, origin, destination, origin_lat, origin_lng, destination_lat, destination_lng, status, eta, driver_name, vehicle, updated_at, last_update')
    .eq('tracking_number', trackingNumber.trim())
    .maybeSingle()
  if (error) throw error
  return data as TrackingShipment | null
}

export async function getTrackingEvents(shipmentId: string) {
  const { data, error } = await supabase.from('tracking_events').select('*').eq('shipment_id', shipmentId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as TrackingEvent[]
}

export function subscribeToShipment(shipmentId: string, onChange: () => void) {
  const channel = supabase.channel(`shipment-${shipmentId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments', filter: `id=eq.${shipmentId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_events', filter: `shipment_id=eq.${shipmentId}` }, onChange)
    .subscribe()
  return () => { void supabase.removeChannel(channel) }
}
