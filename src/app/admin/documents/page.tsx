import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { shipmentDocuments } from "@/lib/db/schema"

export default async function DocumentsPage() {
  let documents: typeof shipmentDocuments.$inferSelect[] = []
  try { documents = await db.select().from(shipmentDocuments).orderBy(desc(shipmentDocuments.createdAt)).limit(50) } catch {}
  return <section className="flex flex-col gap-6"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#df3038]">Records / shipment files</p><h1 className="mt-2 text-4xl font-semibold">Documents</h1><p className="mt-2 text-[#9fb4c3]">Labels, invoices, delivery receipts, and proof of delivery attached to shipments.</p></div><div className="overflow-hidden rounded-2xl border border-[#1d3548] bg-[#0a1a2b]">{documents.length ? <div className="divide-y divide-[#1d3548]">{documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-4 p-5"><div><p className="font-medium">{document.fileName}</p><p className="mt-1 text-xs text-[#9fb4c3]">{document.mimeType ?? "Document"} · shipment {document.shipmentId}</p></div><a href={`/api/documents/file?pathname=${encodeURIComponent(document.storageKey)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-[#1d3548] px-3 py-2 text-xs font-semibold text-[#c5d3db] hover:bg-[#112b40]">View</a></div>)}</div> : <div className="p-14 text-center"><p className="font-semibold">No shipment documents have been uploaded yet.</p><p className="mt-2 text-sm text-[#9fb4c3]">Documents will appear here after they are attached to a shipment.</p></div>}</div></section>
}
