export type RealtimeTable = "shipments" | "tracking_events" | "notifications"
export type ShipmentRealtimeEvent = { type: "ready" | "shipments" | "shipment.updated"; data: any }

export function subscribeToShipmentStream(onEvent: (event: ShipmentRealtimeEvent) => void, onError?: () => void) {
  const source = new EventSource("/api/shipments/stream")
  const handle = (event: MessageEvent) => { try { onEvent({ type: event.type as ShipmentRealtimeEvent["type"], data: JSON.parse(event.data) }) } catch { onError?.() } }
  for (const type of ["ready", "shipments", "shipment.updated"] as const) source.addEventListener(type, handle)
  source.onerror = () => onError?.()
  return () => source.close()
}

export function subscribeToTable(_table: RealtimeTable, onChange: () => void, _filter?: string) {
  const unsubscribe = subscribeToShipmentStream(() => onChange(), onChange)
  return unsubscribe
}

export function subscribeToUserNotifications(userId: string, onChange: () => void) {
  void userId
  return subscribeToTable("notifications", onChange)
}
