import { desc } from "drizzle-orm"
import { Bell, CheckCircle2 } from "lucide-react"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

export default async function NotificationsPage() {
  let rows: typeof notifications.$inferSelect[] = []
  try { rows = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(50) } catch { rows = [] }
  return <section className="flex flex-col gap-6"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#df3038]">Communications / event stream</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Notifications</h1><p className="mt-2 text-[#9fb4c3]">Customer and internal shipment notifications from the operations workflow.</p></div><div className="overflow-hidden rounded-2xl border border-[#1d3548] bg-[#0a1a2b]">{rows.length ? <div className="divide-y divide-[#1d3548]">{rows.map((notification) => <div key={notification.id} className="flex gap-4 p-5"><div className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-full ${notification.read ? "bg-[#112b40] text-[#6f8797]" : "bg-[#4a1f28] text-[#ff9b9f]"}`}>{notification.read ? <CheckCircle2 className="size-4" /> : <Bell className="size-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-3"><p className="font-medium">{notification.title}</p><time className="text-xs text-[#6f8797]">{new Date(notification.createdAt).toLocaleString()}</time></div><p className="mt-1 text-sm text-[#9fb4c3]">{notification.message}</p></div></div>)}</div> : <div className="p-14 text-center"><p className="font-semibold">No notifications.</p><p className="mt-2 text-sm text-[#9fb4c3]">Shipment events and system alerts will appear here.</p></div>}</div></section>
}
