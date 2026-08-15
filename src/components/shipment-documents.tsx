"use client"

const documents = [
  ["shipping_label", "Shipping Label"],
  ["packing_slip", "Packing Slip"],
  ["commercial_invoice", "Commercial Invoice"],
  ["shipment_receipt", "Shipment Receipt"],
  ["bill_of_lading", "Bill of Lading"],
] as const

export function ShipmentDocuments({ shipmentId }: { shipmentId: string }) {
  return <div className="flex flex-wrap gap-2">{documents.map(([type, label]) => <a key={type} className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted" href={`/api/shipments/${shipmentId}/documents?type=${type}`} download>{label}</a>)}</div>
}
