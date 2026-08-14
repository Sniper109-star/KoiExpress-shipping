import { desc } from "drizzle-orm"
import { ClipboardList } from "lucide-react"
import { db } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"

export default async function ActivityPage() {
  let logs: typeof auditLogs.$inferSelect[] = []
  try { logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(50) } catch { logs = [] }
  return <section className="flex flex-col gap-6"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#df3038]">Governance / audit trail</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Activity logs</h1><p className="mt-2 text-[#9fb4c3]">A searchable record of operational changes and staff actions.</p></div><div className="overflow-hidden rounded-2xl border border-[#1d3548] bg-[#0a1a2b]"><div className="flex items-center gap-3 border-b border-[#1d3548] p-5"><ClipboardList className="size-5 text-[#df3038]" /><span className="text-sm text-[#9fb4c3]">Latest 50 events</span></div>{logs.length ? <div className="divide-y divide-[#1d3548]">{logs.map((log) => <div key={log.id} className="flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-medium">{log.description}</p><p className="mt-1 text-xs text-[#9fb4c3]">{log.action} · {log.resource}{log.resourceId ? ` · ${log.resourceId}` : ""}</p></div><time className="text-xs text-[#6f8797]">{new Date(log.createdAt).toLocaleString()}</time></div>)}</div> : <div className="p-14 text-center"><p className="font-semibold">No activity recorded yet.</p><p className="mt-2 text-sm text-[#9fb4c3]">Admin actions will appear here as the operations workflow is used.</p></div>}</div></section>
}
