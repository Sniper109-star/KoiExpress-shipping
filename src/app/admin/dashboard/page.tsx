import Link from "next/link"
import { count, desc } from "drizzle-orm"
import { ArrowUpRight, Clock3, PackageCheck, TriangleAlert, UsersRound } from "lucide-react"
import { db } from "@/lib/db"
import { profiles, shipments } from "@/lib/db/schema"

const statuses = ["pending", "confirmed", "processing", "picked_up", "in_transit", "out_for_delivery", "delivered", "delayed", "cancelled"]
const label = (status: string) => status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
const tone = (status: string) => status === "delivered" ? "bg-[#123e31] text-[#8be0ba]" : status === "delayed" || status === "cancelled" ? "bg-[#4a1f28] text-[#ff9b9f]" : "bg-[#173653] text-[#9bc8ee]"

export default async function AdminDashboardPage() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  let rows: { status: string; total: number }[] = []
  let recent: typeof shipments.$inferSelect[] = []
  let customerTotal = 0
  let error = false
  try {
    const [statusRows, recentRows, customers] = await Promise.all([
      db.select({ status: shipments.status, total: count() }).from(shipments).groupBy(shipments.status),
      db.select().from(shipments).orderBy(desc(shipments.updatedAt)).limit(8),
      db.select({ total: count() }).from(profiles),
    ])
    rows = statusRows.map((row) => ({ status: row.status, total: Number(row.total) }))
    recent = recentRows
    customerTotal = Number(customers[0]?.total ?? 0)
  } catch { error = true }
  const total = rows.reduce((sum, row) => sum + row.total, 0)
  const getTotal = (status: string) => rows.find((row) => row.status === status)?.total ?? 0
  const active = total - getTotal("delivered") - getTotal("cancelled")
  const statCards = [
    ["Total shipments", total, "All records", PackageCheck],
    ["Pending shipments", getTotal("pending"), "Needs confirmation", Clock3],
    ["In transit", getTotal("in_transit"), "On the network", ArrowUpRight],
    ["Out for delivery", getTotal("out_for_delivery"), "Final-mile today", TruckIcon],
    ["Delivered", getTotal("delivered"), "Completed shipments", PackageCheck],
    ["Delayed", getTotal("delayed"), "Needs attention", TriangleAlert],
    ["Active customers", customerTotal, "Customer profiles", UsersRound],
  ] as const
  return <section className="flex flex-col gap-8">
    {error ? <div role="alert" className="rounded-2xl border border-[#75404a] bg-[#351a24] px-5 py-4 text-sm text-[#ffb8ba]">Live operational data is temporarily unavailable. The portal is online, but Neon did not return the dashboard query.</div> : null}
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#df3038]">Tuesday, August 14, 2026</p><h1 className="mt-2 max-w-2xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">The network at a glance.</h1><p className="mt-3 max-w-xl leading-6 text-[#9fb4c3]">Monitor every parcel, exception, handoff, and delivery commitment from one operations room.</p></div><Link href="/admin/orders" className="inline-flex items-center gap-2 rounded-xl bg-[#df3038] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#bd252d]">Manage shipments <ArrowUpRight className="size-4" /></Link></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(([title, value, detail, Icon]) => <article key={title} className="rounded-2xl border border-[#1d3548] bg-[#0a1a2b] p-5"><div className="flex items-center justify-between"><p className="text-sm text-[#9fb4c3]">{title}</p><Icon className="size-4 text-[#df3038]" aria-hidden="true" /></div><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-[#6f8797]">{detail}</p></article>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]"><article className="rounded-2xl border border-[#1d3548] bg-[#0a1a2b] p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Shipment status mix</h2><p className="mt-1 text-sm text-[#9fb4c3]">Current workload across the network.</p></div><span className="rounded-full bg-[#112b40] px-3 py-1 text-xs text-[#9bc8ee]">{active} active</span></div><div className="mt-7 flex flex-col gap-4">{statuses.map((status) => { const value = getTotal(status); const width = total ? Math.max(4, Math.round((value / total) * 100)) : 4; return <div key={status}><div className="mb-2 flex justify-between text-xs"><span className="capitalize text-[#c5d3db]">{label(status)}</span><span className="text-[#9fb4c3]">{value}</span></div><div className="h-2 rounded-full bg-[#112b40]"><div className="h-2 rounded-full bg-[#df3038]" style={{ width: `${width}%` }} /></div></div> })}</div></article><article className="rounded-2xl border border-[#1d3548] bg-[#0a1a2b] p-5 md:p-6"><h2 className="text-xl font-semibold">Pending actions</h2><p className="mt-1 text-sm text-[#9fb4c3]">Keep the operation moving.</p><div className="mt-6 flex flex-col gap-3"><Link href="/admin/orders?status=pending" className="flex items-center justify-between rounded-xl border border-[#1d3548] p-4 transition hover:bg-[#112b40]"><span><span className="block text-sm font-medium">Confirm pending shipments</span><span className="mt-1 block text-xs text-[#9fb4c3]">{getTotal("pending")} waiting</span></span><ArrowUpRight className="size-4 text-[#df3038]" /></Link><Link href="/admin/orders?status=delayed" className="flex items-center justify-between rounded-xl border border-[#1d3548] p-4 transition hover:bg-[#112b40]"><span><span className="block text-sm font-medium">Review delayed freight</span><span className="mt-1 block text-xs text-[#9fb4c3]">{getTotal("delayed")} exceptions</span></span><ArrowUpRight className="size-4 text-[#df3038]" /></Link><Link href="/admin/customers" className="flex items-center justify-between rounded-xl border border-[#1d3548] p-4 transition hover:bg-[#112b40]"><span><span className="block text-sm font-medium">Review customer activity</span><span className="mt-1 block text-xs text-[#9fb4c3]">{customerTotal} profiles</span></span><ArrowUpRight className="size-4 text-[#df3038]" /></Link></div></article></div>
    <article className="overflow-hidden rounded-2xl border border-[#1d3548] bg-[#0a1a2b]"><div className="flex items-center justify-between border-b border-[#1d3548] p-5 md:p-6"><div><h2 className="text-xl font-semibold">Recent shipments</h2><p className="mt-1 text-sm text-[#9fb4c3]">Latest updates from the Neon source of truth.</p></div><Link href="/admin/orders" className="text-sm font-semibold text-[#ff8b8f]">View all</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[#1d3548] text-xs uppercase tracking-wider text-[#6f8797]"><tr><th className="px-5 py-4">Tracking</th><th className="px-5 py-4">Route</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Updated</th></tr></thead><tbody>{recent.map((item) => <tr key={item.id} className="border-b border-[#1d3548] last:border-0"><td className="px-5 py-4 font-mono font-semibold text-[#ff8b8f]">{item.trackingNumber}</td><td className="px-5 py-4 text-[#c5d3db]">{item.origin} <span className="text-[#6f8797]">→</span> {item.destination}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${tone(item.status)}`}>{label(item.status)}</span></td><td className="px-5 py-4 text-[#9fb4c3]">{new Date(item.updatedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>{!recent.length ? <p className="p-10 text-center text-sm text-[#9fb4c3]">No shipments yet. Create the first shipment to populate operations data.</p> : null}</article>
  </section>
}

function TruckIcon(props: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className} aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg> }
