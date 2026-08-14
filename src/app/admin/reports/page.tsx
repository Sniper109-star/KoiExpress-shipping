import Link from "next/link"

const reports = [
  ["Shipment report", "All shipment records and current statuses", "/admin/orders"],
  ["Delayed shipment report", "Shipments requiring operations attention", "/admin/orders?status=delayed"],
  ["Delivery report", "Delivered, in transit, and failed delivery activity", "/admin/deliveries"],
  ["Operations activity", "Recent admin actions and audit history", "/admin/activity"],
]

export default function ReportsPage() {
  return <section className="flex flex-col gap-6"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#df3038]">Exports / operational reporting</p><h1 className="mt-2 text-4xl font-semibold">Reports</h1><p className="mt-2 max-w-xl text-[#9fb4c3]">Choose a report view and export the underlying operational records.</p></div><div className="grid gap-4 md:grid-cols-2">{reports.map(([title, description, href]) => <article key={title} className="rounded-2xl border border-[#1d3548] bg-[#0a1a2b] p-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[#9fb4c3]">{description}</p><Link href={href} className="mt-5 inline-flex rounded-xl bg-[#df3038] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#bd252d]">Open report</Link></article>)}</div></section>
}
