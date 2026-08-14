import Link from "next/link";
import { desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, shipments } from "@/lib/db/schema";

export default async function AdminDashboardPage() {
  let shipmentCount = [{ value: 0 }];
  let customerCount = [{ value: 0 }];
  let recent: typeof shipments.$inferSelect[] = [];
  let dataUnavailable = false;
  try {
    [shipmentCount, customerCount, recent] = await Promise.all([
      db.select({ value: count() }).from(shipments),
      db.select({ value: count() }).from(profiles),
      db.select().from(shipments).orderBy(desc(shipments.updatedAt)).limit(6),
    ]);
  } catch {
    dataUnavailable = true;
  }
  const active = recent.filter((item) => !["delivered", "cancelled"].includes(item.status.toLowerCase())).length;
  return <section className="flex flex-col gap-8">{dataUnavailable ? <p role="status" className="rounded-xl border border-[#d9c9a2] bg-[#fff5d6] px-4 py-3 text-sm text-[#67040b]">Shipment data is temporarily unavailable. Your admin session is active; reconnect the database to restore live metrics.</p> : null}<div><p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8a1018]">Tuesday, operations brief</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">Good morning, captain.</h1><p className="mt-2 text-[#6d5e5a]">One view for every parcel, customer, and delivery exception.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Total shipments", shipmentCount[0]?.value ?? 0], ["Active routes", active], ["Customers", customerCount[0]?.value ?? 0], ["On-time target", "98.4%"]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-[#d9c9a2] bg-[#fffdf7] p-5"><p className="text-sm text-[#6d5e5a]">{label}</p><p className="mt-3 font-serif text-3xl font-bold text-[#67040b]">{value}</p></div>)}</div><div className="rounded-2xl border border-[#d9c9a2] bg-[#fffdf7] p-5"><div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold">Latest shipments</h2><p className="text-sm text-[#6d5e5a]">Most recently updated in Neon.</p></div><Link href="/admin/orders" className="text-sm font-semibold text-[#8a1018]">View all</Link></div><div className="mt-5 flex flex-col gap-3">{recent.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eadfc5] p-4"><div><p className="font-mono text-sm font-bold">{item.trackingNumber}</p><p className="text-sm text-[#6d5e5a]">{item.origin} → {item.destination}</p></div><span className="rounded-full bg-[#f1ead9] px-3 py-1 text-xs font-semibold capitalize text-[#67040b]">{item.status.replaceAll("_", " ")}</span></div>)}{!recent.length ? <p className="py-8 text-center text-sm text-[#6d5e5a]">No shipments have been created yet.</p> : null}</div></div></section>;
}
