import { subscribeToTable } from "@/lib/realtime"

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
    status: String(row.status ?? "pending"), location: (row.location as string | null) ?? null,
    latitude: row.latitude == null ? null : Number(row.latitude), longitude: row.longitude == null ? null : Number(row.longitude),
    message: String(row.message ?? row.description ?? "Shipment updated"), created_at: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
  }
}

function toShipment(row: Record<string, unknown>): TrackingShipment {
  return {
    id: String(row.id), tracking_number: String(row.trackingNumber ?? row.tracking_number),
    origin: String(row.origin ?? row.pickup_address ?? "Origin pending"), destination: String(row.destination ?? row.delivery_address ?? "Destination pending"),
    origin_lat: row.originLat != null ? Number(row.originLat) : row.origin_lat != null ? Number(row.origin_lat) : row.pickup_latitude != null ? Number(row.pickup_latitude) : null,
    origin_lng: row.originLng != null ? Number(row.originLng) : row.origin_lng != null ? Number(row.origin_lng) : row.pickup_longitude != null ? Number(row.pickup_longitude) : null,
    destination_lat: row.destinationLat != null ? Number(row.destinationLat) : row.destination_lat != null ? Number(row.destination_lat) : row.delivery_latitude != null ? Number(row.delivery_latitude) : null,
    destination_lng: row.destinationLng != null ? Number(row.destinationLng) : row.destination_lng != null ? Number(row.destination_lng) : row.delivery_longitude != null ? Number(row.delivery_longitude) : null,
    status: String(row.status ?? "pending"), eta: row.eta ? String(row.eta) : row.estimated_delivery_at ? String(row.estimated_delivery_at) : null,
    driver_name: (row.driverName ?? row.driver_name) as string | null,
    vehicle: row.vehicle as string | null, updated_at: row.updatedAt ? String(row.updatedAt) : null,
    last_update: (row.lastUpdate ?? row.last_update) as string | null,
  }
}

export async function findShipment(trackingNumber: string) {
  const normalized = trackingNumber.trim().toUpperCase()
  if (normalized.length < 3) return null
  const response = await fetch(`/api/tracking/${encodeURIComponent(normalized)}`, { cache: "no-store" })
  if (!response.ok) throw new Error("Unable to load shipment")
  const result = await response.json() as { shipment: Record<string, unknown> | null; events?: Record<string, unknown>[] }
  return result.shipment ? { shipment: toShipment(result.shipment), events: (result.events ?? []).map(toEvent) } : null
}

export async function getTrackingEvents(shipmentId: string) {
  const response = await fetch(`/api/shipments/${encodeURIComponent(shipmentId)}/events`, { cache: "no-store" })
  if (!response.ok) throw new Error("Unable to load tracking events")
  const result = await response.json() as { events?: Record<string, unknown>[] }
  return (result.events ?? []).map(toEvent)
}

const trackingStages = ["pending", "label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"] as const

export function getTrackingStages(status: string, events: TrackingEvent[]) {
  const currentIndex = Math.max(trackingStages.indexOf(status as (typeof trackingStages)[number]), 0)
  return trackingStages.map((stage, index) => ({
    status: stage,
    complete: index <= currentIndex,
    event: [...events].reverse().find((event) => event.status === stage) ?? null,
  }))
}

export function subscribeToShipment(shipmentId: string, onChange: () => void) {
  const unsubscribeShipment = subscribeToTable("shipments", onChange, `id=eq.${shipmentId}`)
  const unsubscribeEvents = subscribeToTable("tracking_events", onChange, `shipment_id=eq.${shipmentId}`)
  return () => { unsubscribeShipment(); unsubscribeEvents() }
}
