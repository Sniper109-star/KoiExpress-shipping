'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTestShipmentButton } from '@/components/create-test-shipment-button'
import { MockSimulatorButton } from '@/components/mock-simulator-button'
import { subscribeToTable } from '@/lib/realtime'
import { ArrowRight, CheckCircle2, Clock3, FileText, MapPin, Package, Plus, Printer, Radio, TriangleAlert } from 'lucide-react'

type Address = { name?: string; city?: string; state?: string; country_code?: string }
type Shipment = { id: string; tracking_number?: string | null; reference_number?: string | null; origin?: string | null; destination?: string | null; status: string; created_at: string; service?: string | null; shipping_method?: string | null; estimated_delivery_date?: string | null; eta?: string | null; total_cost?: number | null; cost?: number | null; sender?: Address; recipient?: Address }

type View = 'all' | 'active' | 'delivered' | 'exceptions'
const terminal = ['delivered', 'cancelled', 'returned']
const exceptions = ['exception', 'delayed', 'failed_delivery']

function statusLabel(status: string) { return status.replaceAll('_', ' ') }
function statusClass(status: string) { if (status === 'delivered') return 'border-success/30 bg-success/10 text-success'; if (exceptions.includes(status)) return 'border-destructive/30 bg-destructive/10 text-destructive'; if (terminal.includes(status)) return 'border-muted bg-muted text-muted-foreground'; return 'border-primary/30 bg-primary/10 text-primary' }
function addressLabel(address?: Address, fallback?: string | null) { return fallback ?? ([address?.city, address?.state, address?.country_code].filter(Boolean).join(', ') || '—') }
function money(value?: number | null) { return typeof value === 'number' ? `$${value.toFixed(2)}` : '—' }
function dateLabel(value?: string | null) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }

function ShipmentRow({ shipment }: { shipment: Shipment }) {
  const tracking = shipment.tracking_number ?? shipment.reference_number ?? shipment.id.slice(0, 8).toUpperCase()
  const origin = addressLabel(shipment.sender, shipment.origin)
  const destination = addressLabel(shipment.recipient, shipment.destination)
  const service = shipment.service ?? shipment.shipping_method ?? 'Unifet Standard'
  return <Card className="overflow-hidden p-0">
    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-semibold text-foreground">{tracking}</span><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(shipment.status)}`}>{statusLabel(shipment.status)}</span></div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span>{origin}</span><ArrowRight className="size-3" /><span>{destination}</span></div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>{service}</span><span>{money(shipment.total_cost ?? shipment.cost)}</span><span>Created {dateLabel(shipment.created_at)}</span></div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end"><span className="mr-2 text-xs text-muted-foreground">ETA {dateLabel(shipment.estimated_delivery_date ?? shipment.eta)}</span><Button asChild variant="outline" size="sm"><Link href={`/track?tracking=${encodeURIComponent(tracking)}`}><MapPin className="mr-1.5 size-3.5" />Track</Link></Button><Button asChild variant="ghost" size="sm"><Link href={`/api/shipments/${shipment.id}/documents?type=shipping_label`} target="_blank" rel="noreferrer"><FileText className="mr-1.5 size-3.5" />View label</Link></Button><Button asChild variant="ghost" size="sm"><Link href={`/api/shipments/${shipment.id}/documents?type=shipping_label&print=1`} target="_blank" rel="noreferrer"><Printer className="mr-1.5 size-3.5" />Print label</Link></Button></div>
    </div>
  </Card>
}

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [view, setView] = useState<View>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadShipments = useCallback(async () => { try { const response = await fetch('/api/shipments', { cache: 'no-store' }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? 'Unable to load shipments'); setShipments(payload.shipments ?? []); setError(null) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load shipments') } finally { setLoading(false) } }, [])
  useEffect(() => { const timer = window.setTimeout(() => void loadShipments(), 0); const unsubscribe = subscribeToTable('shipments', () => void loadShipments()); return () => { window.clearTimeout(timer); unsubscribe() } }, [loadShipments])
  const counts = useMemo(() => ({ active: shipments.filter((item) => !terminal.includes(item.status) && !exceptions.includes(item.status)).length, delivered: shipments.filter((item) => item.status === 'delivered').length, exceptions: shipments.filter((item) => exceptions.includes(item.status)).length }), [shipments])
  const visible = shipments.filter((item) => view === 'all' || (view === 'active' ? !terminal.includes(item.status) && !exceptions.includes(item.status) : view === 'delivered' ? item.status === 'delivered' : exceptions.includes(item.status)))
  const tabs: { key: View; label: string; count?: number }[] = [{ key: 'all', label: 'Shipment history', count: shipments.length }, { key: 'active', label: 'Active shipments', count: counts.active }, { key: 'delivered', label: 'Delivered', count: counts.delivered }, { key: 'exceptions', label: 'Exceptions', count: counts.exceptions }]
  return <DashboardLayout><main className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="mb-2 flex items-center gap-2"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">UNIFET / CUSTOMER OPERATIONS</p><span className="inline-flex items-center gap-1 text-xs text-success"><Radio className="size-3" /> Live</span></div><h1 className="text-balance text-3xl font-bold tracking-tight">Your shipments, in one view.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Create, rate, track, and manage every delivery from origin to doorstep.</p></div><Button asChild className="gap-2"><Link href="/dashboard/create"><Plus className="size-4" />New shipment</Link></Button></div>
    <div className="grid gap-3 sm:grid-cols-3"><Card className="p-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Active shipments</span><Package className="size-4 text-primary" /></div><p className="mt-2 text-2xl font-semibold">{counts.active}</p><p className="mt-1 text-xs text-muted-foreground">Moving through the network</p></Card><Card className="p-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Delivered</span><CheckCircle2 className="size-4 text-success" /></div><p className="mt-2 text-2xl font-semibold">{counts.delivered}</p><p className="mt-1 text-xs text-muted-foreground">Completed deliveries</p></Card><Card className="p-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Exceptions</span><TriangleAlert className="size-4 text-destructive" /></div><p className="mt-2 text-2xl font-semibold">{counts.exceptions}</p><p className="mt-1 text-xs text-muted-foreground">Needs attention</p></Card></div>
    <Card className="border-primary/20 bg-primary/[0.03] p-4 md:p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><Clock3 className="size-4 text-primary" /><h2 className="font-semibold">Test the complete delivery loop</h2></div><p className="mt-1 text-sm leading-6 text-muted-foreground">Create a test shipment, advance it through live tracking, and verify the delivered notification.</p></div><CreateTestShipmentButton /></div>{shipments.filter((item) => !terminal.includes(item.status)).slice(0, 2).map((item) => <div key={item.id} className="mt-3 flex flex-col gap-2 rounded-md border bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between"><div><span className="font-mono text-xs font-semibold">{item.tracking_number ?? item.reference_number ?? item.id.slice(0, 8)}</span><span className="ml-2 text-xs text-muted-foreground">{statusLabel(item.status)}</span></div><MockSimulatorButton shipmentId={item.id} trackingNumber={item.tracking_number ?? item.reference_number ?? item.id.slice(0, 8)} onAdvanced={() => void loadShipments()} /></div>)}</Card>
    <div className="flex gap-1 overflow-x-auto border-b pb-px">{tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setView(tab.key)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${view === tab.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab.label}<span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{tab.count}</span></button>)}</div>
    {error ? <Card className="border-destructive/30 p-5 text-sm text-destructive">{error}</Card> : loading ? <Card className="p-8 text-center text-sm text-muted-foreground">Loading your shipments…</Card> : visible.length ? <div className="space-y-3">{visible.map((shipment) => <ShipmentRow key={shipment.id} shipment={shipment} />)}</div> : <Card className="p-10 text-center"><Package className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">No shipments in this view</h2><p className="mt-1 text-sm text-muted-foreground">Create your first shipment to start tracking its journey.</p><Button asChild className="mt-4"><Link href="/dashboard/create">Create shipment</Link></Button></Card>}
  </main></DashboardLayout>
}
