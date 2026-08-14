export type RealtimeTable = "shipments" | "tracking_events" | "notifications"

export function subscribeToTable(_table: RealtimeTable, onChange: () => void, _filter?: string) {
  const interval = window.setInterval(onChange, 15000)
  return () => window.clearInterval(interval)
}

export function subscribeToUserNotifications(userId: string, onChange: () => void) {
  return subscribeToTable("notifications", onChange, `user_id=${userId}`)
}
