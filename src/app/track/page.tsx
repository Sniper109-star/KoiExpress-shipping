"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Search, Truck } from "lucide-react";
import { MapLibreMap } from "@/components/map";
import { Button } from "@/components/ui/button";
import { findShipment, subscribeToShipment, TrackingEvent, TrackingShipment } from "@/lib/shipment-tracking";

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
    if (initialTracking?.trim()) void loadShipment();
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
  const origin = shipment?.origin_lng != null && shipment.origin_lat != null ? [Number(shipment.origin_lng), Number(shipment.origin_lat)] as [number, number] : undefined;
  const destination = shipment?.destination_lng != null && shipment.destination_lat != null ? [Number(shipment.destination_lng), Number(shipment.destination_lat)] as [number, number] : undefined;

  return <div className="min-h-screen flex flex-col bg-background">
    <header className="border-b border-border"><div className="container mx-auto flex h-16 items-center gap-4 px-4"><Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary"><Image src="/brand/unifet-vehicle-mark.png" alt="Unifet Logistics vehicle mark" width={28} height={28} className="size-7 rounded-full object-cover" /><span>Unifet Logistics</span></Link><Link href="/" className="ml-auto flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Back to Home</Link></div></header>
    <main className="container mx-auto flex-1 px-4 py-8"><div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Track your shipment</h1><p className="text-muted-foreground">Live updates powered by Unifet Logistics and MapTiler.</p></div>
      <form onSubmit={loadShipment} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row"><input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="h-12 flex-1 rounded-md border bg-background px-3" aria-label="Tracking number"/><Button type="submit" disabled={loading} className="h-12 gap-2"><Search className="size-4" />{loading ? "Searching…" : "Track"}</Button></form>
      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {!shipment && <MapLibreMap origin={[-74.006, 40.7128]} destination={[-73.935, 40.7306]} driverLocation={[-73.98, 40.72]} route={[[-74.006, 40.7128], [-73.98, 40.72], [-73.935, 40.7306]]} className="h-[360px] w-full rounded-xl border shadow-sm" />}
      {shipment && <><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border bg-card p-5 md:col-span-2"><p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking number</p><p className="mt-1 font-mono text-xl font-semibold">{shipment.tracking_number}</p><div className="mt-5 flex items-start gap-3"><Truck className="mt-1 size-5 text-primary"/><div><p className="font-semibold capitalize">{shipment.status.replaceAll("_", " ")}</p><p className="text-sm text-muted-foreground">{shipment.origin} to {shipment.destination}</p></div></div></div><div className="rounded-xl border bg-card p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated delivery</p><p className="mt-2 font-semibold">{shipment.eta ? new Date(shipment.eta).toLocaleString() : "Being calculated"}</p></div></div><MapLibreMap origin={origin} destination={destination} markers={markers} className="h-[360px] w-full rounded-xl border shadow-sm"/><div className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Tracking history</h2><div className="mt-4 flex flex-col gap-4">{events.length ? events.map((event) => <div key={event.id} className="flex gap-3 border-l-2 border-primary/30 pl-4"><div><p className="font-medium capitalize">{event.status.replaceAll("_", " ")}</p><p className="text-sm text-muted-foreground">{event.message ?? event.location ?? "Shipment updated"}</p><p className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</p></div></div>) : <p className="text-sm text-muted-foreground">No tracking events yet.</p>}</div></div></>}
    </div></main>
  </div>;
}

export default function TrackPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background p-8"><div className="mx-auto h-64 max-w-5xl animate-pulse rounded-xl border bg-card" /></main>}><TrackPageContent /></Suspense>;
}
