"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Package } from "lucide-react"

export default function CreateShipmentDashboardPage() {
  const [form, setForm] = useState({ customer: "", origin: "", destination: "", weight: "", dimensions: "", carrier: "Unifet Network" })
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); const response = await fetch("/api/admin/shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tracking_number: `UF${Date.now().toString(36).toUpperCase()}`, origin: form.origin, destination: form.destination, carrier: form.carrier, package_details: { description: form.customer ? `Shipment for ${form.customer}` : "Admin-created shipment", weightKg: Number(form.weight), dimensions: form.dimensions, itemType: "Parcel" } }) }); const payload = await response.json(); setMessage(response.ok ? `Shipment ${payload.shipment.trackingNumber} created.` : payload.error ?? "Unable to create shipment."); setBusy(false) }
  return <DashboardLayout><div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Operations</p><h1 className="text-2xl font-bold md:text-3xl">Create Shipment for Customer</h1><p className="text-sm text-muted-foreground md:text-base">Create an offline, phone, warehouse, or business-client shipment and hand it into the review workflow.</p></div><Card variant="default" className="max-w-2xl p-4 md:p-6"><form className="space-y-4" onSubmit={submit}><div className="space-y-2"><Label htmlFor="customer">Customer name or email</Label><Input id="customer" value={form.customer} onChange={(e) => update("customer", e.target.value)} placeholder="Customer record" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="origin">Sender address</Label><Input id="origin" required value={form.origin} onChange={(e) => update("origin", e.target.value)} placeholder="Pickup location" /></div><div className="space-y-2"><Label htmlFor="destination">Receiver address</Label><Input id="destination" required value={form.destination} onChange={(e) => update("destination", e.target.value)} placeholder="Delivery location" /></div><div className="space-y-2"><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" required min="0.1" step="0.1" type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="dimensions">Dimensions</Label><Input id="dimensions" value={form.dimensions} onChange={(e) => update("dimensions", e.target.value)} placeholder="L × W × H" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="carrier">Carrier</Label><Input id="carrier" value={form.carrier} onChange={(e) => update("carrier", e.target.value)} /></div></div><Button type="submit" disabled={busy} className="w-full gap-2"><Package className="size-4" />{busy ? "Creating…" : "Create shipment"}</Button>{message && <p role="status" className="rounded-lg border bg-accent p-3 text-sm">{message}</p>}</form></Card></div></DashboardLayout>
}
