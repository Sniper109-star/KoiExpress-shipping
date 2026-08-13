import { supabase } from '@/lib/supabase'

export type RealtimeTable = 'shipments' | 'tracking_events' | 'notifications'

export function subscribeToTable(
  table: RealtimeTable,
  onChange: () => void,
  filter?: string,
) {
  const channel = supabase
    .channel(`realtime-${table}-${filter ?? 'all'}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) },
      onChange,
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

export function subscribeToUserNotifications(userId: string, onChange: () => void) {
  return subscribeToTable('notifications', onChange, `user_id=eq.${userId}`)
}
