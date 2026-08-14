export type RealtimeTable = "shipments" | "tracking_events" | "notifications"

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

function toEvent(row: Record<string, unknown>): TrackingEvent {
  return {
    id: String(row.id), shipment_id: String(row.shipmentId ?? row.shipment_id),
    status: String(row.status), location: (row.location as string | null) ?? null,
    latitude: (row.latitude as number | null) ?? null, longitude: (row.longitude as number | null) ?? null,
    message: String(row.message ?? "Shipment updated"), created_at: String(row.createdAt ?? row.created_at),
  }
}

function toShipment(row: Record<string, unknown>): TrackingShipment {
  return {
    id: String(row.id), tracking_number: String(row.trackingNumber ?? row.tracking_number),
    origin: String(row.origin), destination: String(row.destination),
    origin_lat: (row.originLat ?? row.origin_lat) as number | null,
    origin_lng: (row.originLng ?? row.origin_lng) as number | null,
    destination_lat: (row.destinationLat ?? row.destination_lat) as number | null,
    destination_lng: (row.destinationLng ?? row.destination_lng) as number | null,
    status: String(row.status), eta: row.eta ? String(row.eta) : null,
    driver_name: (row.driverName ?? row.driver_name) as string | null,
    vehicle: row.vehicle as string | null, updated_at: row.updatedAt ? String(row.updatedAt) : null,
    last_update: (row.lastUpdate ?? row.last_update) as string | null,
  }
}

export async function findShipment(trackingNumber: string) {
  const normalized = trackingNumber.trim().toUpperCase()
  if (normalized.length < 3) return null
  const response = await fetch(`/api/track/${encodeURIComponent(normalized)}`, { cache: "no-store" })
  if (!response.ok) throw new Error("Unable to load shipment")
  const result = await response.json() as { shipment: Record<string, unknown> | null; events?: Record<string, unknown>[] }
  return result.shipment ? { shipment: toShipment(result.shipment), events: (result.events ?? []).map(toEvent) } : null
}

export async function getTrackingEvents(shipmentId: string) {
  return [] as TrackingEvent[]
}

export function subscribeToShipment(_shipmentId: string, onChange: () => void) {
  const interval = window.setInterval(onChange, 15000)
  return () => window.clearInterval(interval)
}
