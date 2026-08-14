"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Rate = { carrier: string; service: string; amountCents: number; estimatedDays: number }

export function CustomerShipmentForm() {
  const [form, setForm] = useState({ origin: "", destination: "", weightKg: "", dimensions: "", description: "", itemType: "Parcel", declaredValue: "" })
  const [rates, setRates] = useState<Rate[]>([])
  const [selected, setSelected] = useState(0)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function getRates() {
    setBusy(true); setMessage("")
    const response = await fetch("/api/shipments/rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: { city: form.origin, country: "US" }, destination: { city: form.destination, country: "US" }, weightKg: Number(form.weightKg), dimensions: form.dimensions }) })
    const payload = await response.json()
    if (!response.ok) setMessage(payload.error ?? "Unable to get rates")
    else { setRates(payload.rates ?? []); setSelected(0) }
    setBusy(false)
  }
  async function submit() {
    const rate = rates[selected]
    if (!rate) return setMessage("Choose a shipping rate first.")
    setBusy(true); setMessage("")
    const response = await fetch("/api/shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: form.origin, destination: form.destination, packageDetails: { description: form.description, weightKg: Number(form.weightKg), dimensions: form.dimensions, itemType: form.itemType, declaredValueCents: Math.round(Number(form.declaredValue || 0) * 100) }, carrier: rate.carrier, shippingCost: rate.amountCents }) })
    const payload = await response.json()
    setMessage(response.ok ? `Shipment ${payload.shipment.trackingNumber} submitted for review.` : payload.error ?? "Unable to submit shipment")
    setBusy(false)
  }
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      {([["origin", "Sender city"], ["destination", "Receiver city"], ["weightKg", "Weight (kg)"], ["dimensions", "Dimensions (L × W × H)"], ["description", "What are you shipping?"], ["itemType", "Package type"], ["declaredValue", "Declared value (USD)"]] as const).map(([key, label]) => <label key={key} className="space-y-2 text-sm font-medium">{label}<input value={form[key]} onChange={(event) => update(key, event.target.value)} type={key === "weightKg" || key === "declaredValue" ? "number" : "text"} className="h-12 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>)}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row"><Button type="button" onClick={getRates} disabled={busy} className="flex-1">{busy ? "Working…" : "Get shipping rates"}</Button><Link href="/login" className="flex items-center justify-center rounded-lg border px-5 text-sm font-semibold">Sign in</Link></div>
    {rates.length > 0 && <div className="space-y-3"><p className="text-sm font-semibold">Available options</p>{rates.map((rate, index) => <button type="button" key={`${rate.carrier}-${rate.service}`} onClick={() => setSelected(index)} className={`flex w-full items-center justify-between rounded-lg border p-4 text-left ${selected === index ? "border-primary bg-accent" : "border-border"}`}><span><span className="block font-semibold">{rate.carrier} · {rate.service}</span><span className="text-sm text-muted-foreground">Estimated delivery: {rate.estimatedDays} days</span></span><span className="font-semibold">${(rate.amountCents / 100).toFixed(2)}</span></button>)}</div>}
    {rates.length > 0 && <Button type="button" onClick={submit} disabled={busy} className="w-full">Request shipment</Button>}
    {message && <p role="status" className="rounded-lg border bg-accent p-3 text-sm">{message}</p>}
  </div>
}
