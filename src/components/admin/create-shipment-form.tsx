"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

export function CreateShipmentForm() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(formData: FormData) {
    setBusy(true)
    setMessage("")
    const raw = Object.fromEntries(formData)
    const response = await fetch("/api/admin/shipments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...raw,
        package_details: {
          source: "admin_dashboard",
          packageType: raw.package_type,
          weight: raw.weight,
          dimensions: `${raw.length} × ${raw.width} × ${raw.height}`,
          numberOfPackages: raw.number_of_packages,
          description: raw.package_description,
          declaredValue: raw.declared_value,
        },
      }),
    })
    const payload = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) {
      setMessage(payload.error ?? "Unable to create shipment. Check the details and try again.")
      return
    }
    setMessage("Shipment created successfully.")
    window.setTimeout(() => window.location.reload(), 700)
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus data-icon="inline-start" /> Create shipment</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
      <form action={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Operations</p><h2 className="mt-1 text-2xl font-semibold">Create shipment</h2><p className="mt-1 text-sm text-muted-foreground">Enter the route and package details to create a tracked shipment.</p></div><button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X /></button></div>
        <div className="mt-6 grid gap-5">
          <section className="grid gap-4"><h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Shipment route</h3><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm sm:col-span-2">Tracking number<input required name="tracking_number" placeholder="UNI-2048-ORANGE" className="rounded-xl border border-input bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring" /></label><label className="grid gap-2 text-sm">Sender / origin<input required name="origin" placeholder="New York, USA" className="rounded-xl border border-input bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring" /></label><label className="grid gap-2 text-sm">Recipient / destination<input required name="destination" placeholder="Berlin, Germany" className="rounded-xl border border-input bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring" /></label></div></section>
          <section className="grid gap-4"><h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Package</h3><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Package type<select name="package_type" className="rounded-xl border border-input bg-background px-3 py-3"><option>Parcel</option><option>Document</option><option>Freight</option></select></label><label className="grid gap-2 text-sm">Service<select name="carrier" className="rounded-xl border border-input bg-background px-3 py-3"><option>Standard</option><option>Ground</option><option>Priority</option><option>Express</option><option>Same Day</option><option>Freight</option></select></label><label className="grid gap-2 text-sm">Weight (kg)<input required min="0.1" step="0.1" type="number" name="weight" className="rounded-xl border border-input bg-background px-3 py-3" /></label><label className="grid gap-2 text-sm">Number of packages<input min="1" step="1" type="number" name="number_of_packages" defaultValue="1" className="rounded-xl border border-input bg-background px-3 py-3" /></label><label className="grid gap-2 text-sm">Length<input min="0" step="0.1" type="number" name="length" placeholder="cm" className="rounded-xl border border-input bg-background px-3 py-3" /></label><label className="grid gap-2 text-sm">Width<input min="0" step="0.1" type="number" name="width" placeholder="cm" className="rounded-xl border border-input bg-background px-3 py-3" /></label><label className="grid gap-2 text-sm">Height<input min="0" step="0.1" type="number" name="height" placeholder="cm" className="rounded-xl border border-input bg-background px-3 py-3" /></label><label className="grid gap-2 text-sm">Declared value<input min="0" step="0.01" type="number" name="declared_value" placeholder="USD" className="rounded-xl border border-input bg-background px-3 py-3" /></label><label className="grid gap-2 text-sm sm:col-span-2">Description<input name="package_description" placeholder="Shipment contents" className="rounded-xl border border-input bg-background px-3 py-3" /></label></div></section>
          <label className="grid gap-2 text-sm">Estimated delivery<input type="date" name="eta" className="rounded-xl border border-input bg-background px-3 py-3" /></label>
        </div>
        {message ? <p role="status" className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{message}</p> : null}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted">Cancel</button><button disabled={busy} type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Creating…" : "Create shipment"}</button></div>
      </form>
    </div> : null}
  </>
}
