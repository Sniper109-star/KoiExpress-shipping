"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Truck, User, Clock, Radio } from "lucide-react";
import { MapLibreMap } from "@/components/map";
import { findShipment, subscribeToShipment, type TrackingEvent, type TrackingShipment } from "@/lib/shipment-tracking";

function TrackingContent() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") ?? "");
  const [shipment, setShipment] = useState<TrackingShipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShipment = useCallback(async (number: string) => {
    if (!number.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await findShipment(number);
      const nextShipment = result?.shipment ?? null;
      setShipment(nextShipment);
      setEvents(result?.events ?? []);
      if (!nextShipment) setError("Shipment not found.");
    } catch {
      setError("Unable to load live tracking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trackingId) void loadShipment(trackingId);
  }, [loadShipment, trackingId]);

  useEffect(() => {
    if (!shipment) return;
    return subscribeToShipment(shipment.id, () => void loadShipment(shipment.tracking_number));
  }, [loadShipment, shipment]);

  return <DashboardLayout><div className="space-y-6"><div><div className="flex items-center gap-2"><h1 className="text-2xl md:text-3xl font-bold text-dark">Live Tracking</h1><span className="inline-flex items-center gap-1 text-xs text-success"><Radio className="size-3" /> Realtime</span></div><p className="text-muted-foreground text-sm md:text-base">Monitor live shipment updates from Unifet Logistics.</p></div><Card variant="default" className="p-4 md:p-6"><form className="flex flex-col sm:flex-row gap-3" onSubmit={(event) => { event.preventDefault(); void loadShipment(trackingId); }}><Input placeholder="Enter tracking number..." value={trackingId} onChange={(event) => setTrackingId(event.target.value)} className="flex-1" /><Button type="submit" className="gap-2"><Search className="h-4 w-4" />Track</Button></form></Card>{error && <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}{shipment && <div className="grid gap-6 lg:grid-cols-3"><div className="lg:col-span-2"><Card variant="default" className="p-0 overflow-hidden"><MapLibreMap className="h-[300px] md:h-[400px]" origin={shipment.origin_lat && shipment.origin_lng ? [shipment.origin_lng, shipment.origin_lat] : undefined} destination={shipment.destination_lat && shipment.destination_lng ? [shipment.destination_lng, shipment.destination_lat] : undefined} driverLocation={events.find((event) => event.latitude && event.longitude) ? [events.find((event) => event.latitude && event.longitude)!.longitude!, events.find((event) => event.latitude && event.longitude)!.latitude!] : undefined} markers={events.filter((event) => event.latitude && event.longitude).map((event) => ({ coordinates: [event.longitude!, event.latitude!] as [number, number], label: event.message, status: event.status, timestamp: new Date(event.created_at).toLocaleString() }))} /></Card></div><div className="space-y-4"><Card variant="default" className="p-4 md:p-6"><div className="flex items-center gap-3 mb-4"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Truck className="h-5 w-5 text-primary" /></div><div><h3 className="font-semibold text-dark">Shipment Status</h3><p className="text-sm text-muted-foreground">{shipment.status.replaceAll("_", " ")}</p></div></div><div className="space-y-3 text-sm"><div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><span>{shipment.driver_name ?? "Driver not assigned"}</span></div><div className="flex items-center gap-3"><Truck className="h-4 w-4 text-muted-foreground" /><span>{shipment.vehicle ?? "Vehicle not assigned"}</span></div><div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /><span>ETA: {shipment.eta ? new Date(shipment.eta).toLocaleString() : "Pending"}</span></div></div></Card><Card variant="default" className="p-4 md:p-6"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tracking Events</p><div className="mt-4 space-y-3">{events.length === 0 ? <p className="text-sm text-muted-foreground">No tracking events yet.</p> : events.map((event) => <div key={event.id} className="border-l-2 border-primary pl-3"><p className="text-sm font-medium">{event.message}</p><p className="text-xs text-muted-foreground">{event.location ?? "Location pending"} · {new Date(event.created_at).toLocaleString()}</p></div>)}</div></Card></div></div>}{loading && <p className="text-sm text-muted-foreground">Refreshing live tracking...</p>}</div></DashboardLayout>;
}

export default function TrackingPage() {
  return <Suspense fallback={<div className="p-6"><Card className="h-64 animate-pulse" /></div>}><TrackingContent /></Suspense>
}
