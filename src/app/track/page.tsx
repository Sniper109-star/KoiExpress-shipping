"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Search, Truck } from "lucide-react";
import { MapLibreMap } from "@/components/map";
import { Button } from "@/components/ui/button";
import { findShipment, getTrackingStages, subscribeToShipment, TrackingEvent, TrackingShipment } from "@/lib/shipment-tracking";

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(() => searchParams.get("tracking") ?? searchParams.get("tracking_number") ?? "");
  const [shipment, setShipment] = useState<TrackingShipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadShipment(event?: FormEvent) {
    event?.preventDefault();
    if (trackingNumber.trim().length < 3) {
      setShipment(null);
      setEvents([]);
      setError("Enter a valid tracking number.");
      return;
    }
    setLoading(true); setError("");
    try {
      const result = await findShipment(trackingNumber);
      if (!result) { setShipment(null); setEvents([]); setError("We could not find that tracking number."); return; }
      setShipment(result.shipment);
      setEvents(result.events);
      window.history.replaceState(null, "", `/track?tracking=${encodeURIComponent(result.shipment.tracking_number)}`);
    } catch { setError("Tracking is temporarily unavailable. Please try again."); }
    finally { setLoading(false); }
  }

  const shipmentId = shipment?.id;
  const shipmentTrackingNumber = shipment?.tracking_number;

  useEffect(() => {
    const initialTracking = searchParams.get("tracking") ?? searchParams.get("tracking_number");
    const timer = window.setTimeout(() => {
      if (initialTracking?.trim()) void loadShipment();
    }, 0);
    return () => window.clearTimeout(timer);
    // The URL is intentionally read once to support shareable tracking links.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!shipmentId || !shipmentTrackingNumber) return;
    return subscribeToShipment(shipmentId, async () => {
      const result = await findShipment(shipmentTrackingNumber);
      if (result) {
        setShipment(result.shipment);
        setEvents(result.events);
      }
    });
  }, [shipmentId, shipmentTrackingNumber]);

  const markers = useMemo(() => events.filter((event) => event.longitude !== null && event.latitude !== null).map((event) => ({ coordinates: [Number(event.longitude), Number(event.latitude)] as [number, number], label: event.message ?? event.location ?? event.status })), [events]);
  const stages = useMemo(() => shipment ? getTrackingStages(shipment.status, events) : [], [shipment, events]);
  const origin = shipment?.origin_lng != null && shipment.origin_lat != null ? [Number(shipment.origin_lng), Number(shipment.origin_lat)] as [number, number] : undefined;
  const destination = shipment?.destination_lng != null && shipment.destination_lat != null ? [Number(shipment.destination_lng), Number(shipment.destination_lat)] as [number, number] : undefined;
  const currentLocation = markers.at(-1)?.coordinates;
  const route = [origin, currentLocation, destination].filter(Boolean) as [number, number][];

  return <div className="min-h-screen flex flex-col bg-background">
    <header className="border-b border-border"><div className="container mx-auto flex h-16 items-center gap-4 px-4"><Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary"><Image src="/brand/unifet-vehicle-mark.png" alt="Unifet Logistics vehicle mark" width={28} height={28} className="size-7 rounded-full object-cover" /><span>Unifet Logistics</span></Link><Link href="/" className="ml-auto flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Back to Home</Link></div></header>
    <main className="container mx-auto flex-1 px-4 py-8"><div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="border-l-4 border-primary pl-4"><p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-primary">UNIFET / TRACKING CONTROL</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">Track your shipment</h1><p className="mt-2 max-w-xl text-muted-foreground">One shipment record. One live operational view. Follow every handoff from origin to destination.</p></div>
      <form onSubmit={loadShipment} className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-card p-4 shadow-sm sm:flex-row"><div className="flex flex-1 items-center gap-3"><span className="font-mono text-xs font-bold text-primary">UNF</span><input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="h-12 min-w-0 flex-1 bg-transparent px-1 outline-none" aria-label="Tracking number"/></div><Button type="submit" disabled={loading} className="h-12 gap-2"><Search className="size-4" />{loading ? "Searching…" : "Track shipment"}</Button></form>
      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {!shipment && <section className="overflow-hidden rounded-xl border border-primary/30 bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border px-4 py-3"><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">UNIFET ROUTE VIEW</p><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">MapTiler</span></div><MapLibreMap branded origin={[-74.006, 40.7128]} destination={[-73.935, 40.7306]} driverLocation={[-73.98, 40.72]} route={[[-74.006, 40.7128], [-73.98, 40.72], [-73.935, 40.7306]]} className="h-[360px] w-full" /></section>}
      {shipment && <><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border bg-card p-5 md:col-span-2"><p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking number</p><p className="mt-1 font-mono text-xl font-semibold">{shipment.tracking_number}</p><div className="mt-5 flex items-start gap-3"><Truck className="mt-1 size-5 text-primary"/><div><p className="font-semibold capitalize">{shipment.status.replaceAll("_", " ")}</p><p className="text-sm text-muted-foreground">{shipment.origin} to {shipment.destination}</p></div></div></div><div className="rounded-xl border bg-card p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated delivery</p><p className="mt-2 font-semibold">{shipment.eta ? new Date(shipment.eta).toLocaleString() : "Being calculated"}</p></div></div><section className="overflow-hidden rounded-xl border border-primary/30 bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border px-4 py-3"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">LIVE SHIPMENT MAP</p><p className="mt-1 text-xs text-muted-foreground">Origin / current location / destination</p></div><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">MAPTILER</span></div><MapLibreMap branded origin={origin} destination={destination} driverLocation={currentLocation} route={route} markers={markers} className="h-[360px] w-full"/></section><div className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Shipment progress</h2><div className="mt-4 flex flex-col">{stages.map((stage, index) => <div key={stage.status} className="flex gap-3"><div className="flex flex-col items-center"><div className={`flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold ${stage.complete ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"}`}>{stage.complete ? "✓" : index + 1}</div>{index < stages.length - 1 && <div className={`h-10 w-px ${stage.complete ? "bg-primary/40" : "bg-border"}`} />}</div><div className="pb-5"><p className={`font-medium capitalize ${stage.complete ? "text-foreground" : "text-muted-foreground"}`}>{stage.status.replaceAll("_", " ")}</p><p className="text-sm text-muted-foreground">{stage.event?.message ?? (stage.complete ? "Shipment status updated" : "Pending")}</p>{stage.event && <p className="text-xs text-muted-foreground">{new Date(stage.event.created_at).toLocaleString()}</p>}</div></div>)}</div></div></>}
    </div></main>
  </div>;
}

export default function TrackPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background p-8"><div className="mx-auto h-64 max-w-5xl animate-pulse rounded-xl border bg-card" /></main>}><TrackPageContent /></Suspense>;
}
