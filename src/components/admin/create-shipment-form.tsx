"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

export function CreateShipmentForm() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  async function submit(formData: FormData) {
    setBusy(true); setMessage("")
    const response = await fetch("/api/admin/shipments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) })
    setBusy(false)
    if (!response.ok) { setMessage("Unable to create shipment. Check the details and try again."); return }
    setMessage("Shipment created."); setTimeout(() => window.location.reload(), 700)
  }
  return <><button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#df3038] px-4 py-3 text-sm font-semibold text-white hover:bg-[#bd252d]"><Plus className="size-4" /> Create shipment</button>{open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020812]/80 p-5"><form action={submit} className="w-full max-w-lg rounded-2xl border border-[#1d3548] bg-[#0a1a2b] p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.22em] text-[#df3038]">New record</p><h2 className="mt-1 text-2xl font-semibold">Create shipment</h2></div><button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-lg p-2 text-[#9fb4c3] hover:bg-[#112b40]"><X className="size-5" /></button></div><div className="mt-6 grid gap-4"><label className="grid gap-2 text-sm">Tracking number<input required name="tracking_number" placeholder="UNI-2048-ORANGE" className="rounded-xl border border-[#1d3548] bg-[#071321] px-3 py-3 text-white outline-none focus:ring-2 focus:ring-[#df3038]" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Origin<input required name="origin" placeholder="Lagos" className="rounded-xl border border-[#1d3548] bg-[#071321] px-3 py-3 text-white outline-none focus:ring-2 focus:ring-[#df3038]" /></label><label className="grid gap-2 text-sm">Destination<input required name="destination" placeholder="London" className="rounded-xl border border-[#1d3548] bg-[#071321] px-3 py-3 text-white outline-none focus:ring-2 focus:ring-[#df3038]" /></label></div><label className="grid gap-2 text-sm">Estimated delivery<input type="date" name="eta" className="rounded-xl border border-[#1d3548] bg-[#071321] px-3 py-3 text-white outline-none focus:ring-2 focus:ring-[#df3038]" /></label></div>{message ? <p role="status" className="mt-4 text-sm text-[#ffb8ba]">{message}</p> : null}<button disabled={busy} className="mt-6 w-full rounded-xl bg-[#df3038] px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Creating..." : "Create shipment"}</button></form></div> : null}</>
}
