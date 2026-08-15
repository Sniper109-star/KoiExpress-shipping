"use client"

import { useEffect, useState } from "react"
import { Activity, MapPin, RefreshCw, Truck } from "lucide-react"
import { Card } from "@/components/ui/card"

type LiveItem = { device: { id: number; name: string; status?: string }; position: { latitude: number; longitude: number; address?: string; speed?: number } | null }
export function TraccarLivePanel() {
  const [items, setItems] = useState<LiveItem[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  async function refresh() { setLoading(true); try { const response = await fetch("/api/traccar/live", { cache: "no-store" }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setItems(payload.data ?? []); setError("") } catch (value) { setError(value instanceof Error ? value.message : "Traccar is unavailable") } finally { setLoading(false) } }
  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(), 15000); return () => window.clearInterval(timer) }, [])
  return <Card variant="default" className="overflow-hidden"><div className="flex items-center justify-between border-b p-4"><div><div className="flex items-center gap-2"><Activity className="size-4 text-success" /><h2 className="font-semibold">Traccar live fleet</h2></div><p className="mt-1 text-xs text-muted-foreground">GPS devices synced every 15 seconds</p></div><button aria-label="Refresh Traccar fleet" onClick={() => void refresh()} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button></div>{error ? <div className="p-5 text-sm text-muted-foreground">{error}. Connect a Traccar device to begin live tracking.</div> : items.length === 0 ? <div className="p-5 text-sm text-muted-foreground">No Traccar devices found yet.</div> : <div className="divide-y">{items.map(({ device, position }) => <div key={device.id} className="flex items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Truck className="size-5" /></div><div className="min-w-0"><p className="truncate font-medium">{device.name}</p><p className="truncate text-xs text-muted-foreground">{position?.address ?? (position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : "Awaiting GPS")}</p></div></div><div className="shrink-0 text-right text-xs"><p className="flex items-center justify-end gap-1 text-success"><MapPin className="size-3" />{position ? `${Math.round((position.speed ?? 0) * 1.852)} km/h` : "Offline"}</p><p className="mt-1 capitalize text-muted-foreground">{device.status ?? "unknown"}</p></div></div>)}</div>}</Card>
}
