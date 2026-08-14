import { count, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { shipments } from "@/lib/db/schema"

export default async function AnalyticsPage() {
  let total = 0
  let delayed = 0
  let delivered = 0
  let inTransit = 0
  try {
    const rows = await db.select({ status: shipments.status, total: count() }).from(shipments).groupBy(shipments.status)
    total = rows.reduce((sum, row) => sum + Number(row.total), 0)
    delayed = Number(rows.find((row) => row.status === "delayed")?.total ?? 0)
    delivered = Number(rows.find((row) => row.status === "delivered")?.total ?? 0)
    inTransit = Number(rows.find((row) => row.status === "in_transit")?.total ?? 0)
  } catch {}
  const rate = total ? Math.round((delivered / total) * 100) : 0
  return <section className="flex flex-col gap-6"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#df3038]">Performance / network intelligence</p><h1 className="mt-2 text-4xl font-semibold">Analytics</h1><p className="mt-2 text-[#9fb4c3]">Live operational metrics from Neon shipment records.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Shipment volume", total, "all records"], ["Delivery success", `${rate}%`, "delivered / total"], ["Delayed freight", delayed, "needs attention"], ["In transit", inTransit, "active movement"]].map(([title, value, note]) => <article key={title} className="rounded-2xl border border-[#1d3548] bg-[#0a1a2b] p-5"><p className="text-sm text-[#9fb4c3]">{title}</p><p className="mt-3 text-3xl font-semibold">{value}</p><p className="mt-2 text-xs text-[#6f8797]">{note}</p></article>)}</div><div className="rounded-2xl border border-[#1d3548] bg-[#0a1a2b] p-6"><h2 className="text-lg font-semibold">Delivery performance</h2><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#173653]"><div className="h-full rounded-full bg-[#8be0ba]" style={{ width: `${rate}%` }} /></div><div className="mt-3 flex justify-between text-sm text-[#9fb4c3]"><span>{delivered} delivered</span><span>{rate}% success rate</span></div></div></section>
}
