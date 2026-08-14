"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Check, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Address = { name: string; street1: string; city: string; state: string; postalCode: string; country: string }
type Parcel = { weightKg: string; lengthCm: string; widthCm: string; heightCm: string; itemType: string }
type Rate = { id: string; carrier: string; carrierLogoUrl?: string; service: string; amountCents: number; currency: string; estimatedDays: number }

const emptyAddress = { name: "", street1: "", city: "", state: "", postalCode: "", country: "US" }
const emptyParcel = { weightKg: "", lengthCm: "", widthCm: "", heightCm: "", itemType: "Parcel" }

export function CustomerShipmentForm() {
  const [from, setFrom] = useState<Address>({ ...emptyAddress })
  const [to, setTo] = useState<Address>({ ...emptyAddress })
  const [parcels, setParcels] = useState<Parcel[]>([{ ...emptyParcel }])
  const [declaredValue, setDeclaredValue] = useState("")
  const [rates, setRates] = useState<Rate[]>([])
  const [selected, setSelected] = useState(0)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const updateAddress = (side: "from" | "to", key: keyof Address, value: string) => (side === "from" ? setFrom((current) => ({ ...current, [key]: value })) : setTo((current) => ({ ...current, [key]: value })))
  const updateParcel = (index: number, key: keyof Parcel, value: string) => setParcels((current) => current.map((parcel, parcelIndex) => parcelIndex === index ? { ...parcel, [key]: value } : parcel))
  const validate = () => { if (!from.street1 || !from.city || !from.postalCode || !to.street1 || !to.city || !to.postalCode) return "Add complete sender and receiver addresses."; if (parcels.some((parcel) => !Number(parcel.weightKg) || Number(parcel.weightKg) <= 0)) return "Enter a weight for every parcel."; return "" }
  async function getRates() {
    const error = validate(); if (error) return setMessage(error)
    setBusy(true); setMessage("")
    const response = await fetch("/api/shipments/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: from,
        destination: to,
        parcels: parcels.map((parcel) => ({
          ...parcel,
          weightKg: Number(parcel.weightKg),
          lengthCm: Number(parcel.lengthCm) || undefined,
          widthCm: Number(parcel.widthCm) || undefined,
          heightCm: Number(parcel.heightCm) || undefined,
        })),
      }),
    })
    const payload = await response.json(); setBusy(false)
    if (!response.ok) setMessage(payload.error ?? "Unable to get rates"); else { setRates(payload.rates ?? []); setSelected(0) }
  }
  async function submit() {
    const rate = rates[selected]; if (!rate) return setMessage("Choose a delivery option first.")
    setBusy(true); setMessage("")
    const response = await fetch("/api/shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: `${from.street1}, ${from.city}, ${from.country}`, destination: `${to.street1}, ${to.city}, ${to.country}`, packageDetails: { parcels, itemType: parcels[0].itemType, declaredValueCents: Math.round(Number(declaredValue || 0) * 100), weightKg: parcels.reduce((sum, parcel) => sum + Number(parcel.weightKg || 0), 0) }, carrier: rate.carrier, shippingCost: rate.amountCents }) })
    const payload = await response.json(); setBusy(false); setMessage(response.ok ? `Shipment ${payload.shipment.trackingNumber} submitted for review.` : payload.error ?? "Unable to submit shipment")
  }
  const addressFields = (side: "from" | "to", value: Address) => <div className="grid gap-3 sm:grid-cols-2">{(["name", "street1", "city", "state", "postalCode", "country"] as const).map((key) => <label key={key} className="flex flex-col gap-1 text-sm font-medium sm:col-span-{key === 'street1' ? 2 : 1}">{key === "street1" ? "Street address" : key === "postalCode" ? "Postal code" : key[0].toUpperCase() + key.slice(1)}<input required={key === "street1" || key === "city" || key === "postalCode"} value={value[key]} onChange={(event) => updateAddress(side, key, event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none focus:border-primary" /></label>)}</div>
  return <div className="flex flex-col gap-7">
    <section className="flex flex-col gap-4"><div><h2 className="text-lg font-semibold">Route details</h2><p className="text-sm text-muted-foreground">Where should we collect and deliver your shipment?</p></div><div className="grid gap-5 lg:grid-cols-2"><div className="flex flex-col gap-3 rounded-xl border p-4"><p className="font-semibold">Sender</p>{addressFields("from", from)}</div><div className="flex flex-col gap-3 rounded-xl border p-4"><p className="font-semibold">Receiver</p>{addressFields("to", to)}</div></div></section>
    <section className="flex flex-col gap-4"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Packages</h2><p className="text-sm text-muted-foreground">Add weight and dimensions for each parcel.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setParcels((current) => [...current, { ...emptyParcel }])}><Plus data-icon="inline-start" />Add parcel</Button></div>{parcels.map((parcel, index) => <div key={index} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-5"><label className="flex flex-col gap-1 text-sm font-medium">Weight kg<input required type="number" min="0.1" step="0.1" value={parcel.weightKg} onChange={(event) => updateParcel(index, "weightKg", event.target.value)} className="h-11 rounded-lg border bg-background px-3 font-normal" /></label>{(["lengthCm", "widthCm", "heightCm"] as const).map((key) => <label key={key} className="flex flex-col gap-1 text-sm font-medium">{key.replace("Cm", " cm")}<input type="number" min="1" value={parcel[key]} onChange={(event) => updateParcel(index, key, event.target.value)} className="h-11 rounded-lg border bg-background px-3 font-normal" /></label>)}<label className="flex flex-col gap-1 text-sm font-medium">Item type<input value={parcel.itemType} onChange={(event) => updateParcel(index, "itemType", event.target.value)} className="h-11 rounded-lg border bg-background px-3 font-normal" /></label>{parcels.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => setParcels((current) => current.filter((_, parcelIndex) => parcelIndex !== index))} aria-label="Remove parcel"><Trash2 data-icon="inline-start" />Remove</Button>}</div>)}<label className="flex max-w-xs flex-col gap-1 text-sm font-medium">Declared value (USD)<input type="number" min="0" step="0.01" value={declaredValue} onChange={(event) => setDeclaredValue(event.target.value)} className="h-11 rounded-lg border bg-background px-3 font-normal" /></label></section>
    <div className="flex flex-col gap-3 sm:flex-row"><Button type="button" onClick={getRates} disabled={busy} className="flex-1">{busy ? "Calculating…" : "Compare delivery options"}<ArrowRight data-icon="inline-end" /></Button><Link href="/login" className="flex items-center justify-center rounded-lg border px-5 text-sm font-semibold">Sign in</Link></div>
    {rates.length > 0 && <section className="flex flex-col gap-3"><div><h2 className="font-semibold">Recommended delivery options</h2><p className="text-sm text-muted-foreground">Rates are estimates and will be confirmed before dispatch.</p></div>{rates.map((rate, index) => <button type="button" key={rate.id} onClick={() => setSelected(index)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${selected === index ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"}`}><span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-muted">{rate.carrierLogoUrl ? <img src={rate.carrierLogoUrl} alt="" className="size-8 object-cover" /> : <Check className="size-4" />}</span><span className="flex-1"><span className="block font-semibold">{rate.carrier} · {rate.service}</span><span className="text-sm text-muted-foreground">Estimated delivery in {rate.estimatedDays} business days</span></span><span className="font-semibold">${(rate.amountCents / 100).toFixed(2)}</span></button>)}<Button type="button" onClick={submit} disabled={busy} className="w-full">Request this shipment</Button></section>}
    {message && <p role="status" className="rounded-lg border bg-accent p-3 text-sm">{message}</p>}
  </div>
}
