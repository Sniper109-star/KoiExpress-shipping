import { createClient } from "@/lib/supabase/client"

export type RealtimeTable = "shipments" | "tracking_events" | "notifications"
export type ShipmentRealtimeEvent = { type: "ready" | "shipments" | "shipment.updated"; data: any }

let supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (typeof window === "undefined") return null
  supabase ??= createClient()
  return supabase
}

export function subscribeToShipmentStream(onEvent: (event: ShipmentRealtimeEvent) => void, onError?: () => void) {
  const source = new EventSource("/api/shipments/stream")
  const handle = (event: MessageEvent) => { try { onEvent({ type: event.type as ShipmentRealtimeEvent["type"], data: JSON.parse(event.data) }) } catch { onError?.() } }
  for (const type of ["ready", "shipments", "shipment.updated"] as const) source.addEventListener(type, handle)
  source.onerror = () => onError?.()
  return () => source.close()
}

export function subscribeToTable(table: RealtimeTable, onChange: () => void, filter?: string) {
  const client = getSupabase()
  if (!client) return () => undefined
  const channel = client.channel(`unifet:${table}:${filter ?? "all"}`)
  const postgresFilter = filter ? { event: "*" as const, schema: "public", table, filter } : { event: "*" as const, schema: "public", table }
  channel.on("postgres_changes", postgresFilter, () => onChange())
  void channel.subscribe((status) => {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") onChange()
  })
  return () => { void client.removeChannel(channel) }
}

export function subscribeToUserNotifications(userId: string, onChange: () => void) {
  void userId
  return subscribeToTable("notifications", onChange)
}
