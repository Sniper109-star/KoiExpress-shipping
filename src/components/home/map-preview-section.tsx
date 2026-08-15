"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, MapPin, PackageCheck } from "lucide-react";
import { MapLibreMap } from "@/components/map";
import { subscribeToShipmentStream } from "@/lib/realtime";

type LiveShipment = {
  id: string;
  tracking_number?: string;
  origin?: string;
  destination?: string;
  status?: string;
  origin_lat?: number | null;
  origin_lng?: number | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  liveLocation?: { latitude?: number | null; longitude?: number | null } | null;
};

const fallbackOrigin: [number, number] = [-74.006, 40.7128];
const fallbackDestination: [number, number] = [13.405, 52.52];
const fallbackDriver: [number, number] = [12.4964, 41.9028];

function statusLabel(status?: string) {
  return status?.replaceAll("_", " ") || "In transit";
}

export function MapPreviewSection() {
  const [shipment, setShipment] = useState<LiveShipment | null>(null);
  const [minutesAgo, setMinutesAgo] = useState(0);
  const [route, setRoute] = useState<[number, number][]>([fallbackOrigin, fallbackDriver, fallbackDestination]);

  useEffect(() => {
    let active = true;
    const apply = (rows: LiveShipment[]) => { if (active && rows[0]) { setShipment(rows[0]); setMinutesAgo(0); } };
    fetch("/api/shipments/live?limit=1", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((payload) => apply(payload?.shipments ?? [])).catch(() => undefined);
    const unsubscribe = subscribeToShipmentStream((event) => { if (event.type === "shipments") apply(event.data.shipments ?? []); });
    return () => { active = false; unsubscribe(); };
  }, []);

  const origin = useMemo<[number, number]>(() => shipment?.origin_lng != null && shipment.origin_lat != null ? [shipment.origin_lng, shipment.origin_lat] : fallbackOrigin, [shipment]);
  const destination = useMemo<[number, number]>(() => shipment?.destination_lng != null && shipment.destination_lat != null ? [shipment.destination_lng, shipment.destination_lat] : fallbackDestination, [shipment]);
  const driverLocation = useMemo<[number, number]>(() => shipment?.liveLocation?.longitude != null && shipment.liveLocation.latitude != null ? [shipment.liveLocation.longitude, shipment.liveLocation.latitude] : fallbackDriver, [shipment]);

  useEffect(() => {
    const params = new URLSearchParams({ origin: origin.join(","), destination: destination.join(",") });
    fetch(`/api/maptiler/directions?${params.toString()}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((payload) => {
      const coordinates = payload?.features?.[0]?.geometry?.coordinates ?? payload?.routes?.[0]?.geometry?.coordinates;
      if (Array.isArray(coordinates) && coordinates.length > 1) setRoute(coordinates as [number, number][]);
    }).catch(() => setRoute([origin, driverLocation, destination]));
  }, [origin, destination, driverLocation]);

  const trackingNumber = shipment?.tracking_number || "UNF-48291";

  return <section className="bg-secondary text-secondary-foreground"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Shipment visibility</p><h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Track every shipment.</h2></div><p className="max-w-sm leading-7 text-secondary-foreground/70">Follow every movement from the USA through Italy to Germany, with checkpoints and delivery milestones in real time.</p></div><div className="relative overflow-hidden border border-secondary-foreground/15 bg-[#071b2d] shadow-2xl"><MapLibreMap className="h-[390px] w-full md:h-[520px]" origin={origin} destination={destination} driverLocation={driverLocation} route={route} branded /><div className="absolute left-4 top-4 flex items-center gap-3 border border-white/15 bg-[#071b2d]/90 px-4 py-3 text-white shadow-xl backdrop-blur md:left-6 md:top-6"><span className="flex size-2.5 rounded-full bg-primary shadow-[0_0_0_5px_rgba(229,57,53,0.18)]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Live tracking</p><p className="text-xs font-semibold">Updated {minutesAgo === 0 ? "just now" : `${minutesAgo} min ago`}</p></div></div><div className="absolute bottom-4 left-4 right-4 max-w-sm border border-white/10 bg-[#071b2d]/95 p-5 text-white shadow-2xl backdrop-blur md:bottom-6 md:left-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Live shipment</p><p className="mt-1 text-xl font-black tracking-tight">{trackingNumber}</p><p className="mt-1 text-sm capitalize text-white/70">{statusLabel(shipment?.status)} · On schedule</p></div><Activity className="size-5 text-primary" /></div><div className="mt-5 flex items-center gap-2 text-xs font-semibold"><span className="truncate">{shipment?.origin || "New York, USA"}</span><div className="h-1 flex-1 bg-white/20"><div className="h-full w-[68%] bg-primary" /></div><span className="truncate text-right">{shipment?.destination || "Berlin, Germany"}</span></div><div className="mt-4 flex items-center justify-between text-xs text-white/60"><span>68% complete</span><span>ETA Today · 4:45 PM</span></div></div></div><div className="grid grid-cols-4 border-x border-b border-secondary-foreground/15 bg-[#071b2d] text-white/70"><div className="flex flex-col gap-2 border-r border-white/10 p-4"><PackageCheck className="size-4 text-primary" /><span className="text-xs font-semibold">Pickup</span></div><div className="flex flex-col gap-2 border-r border-white/10 p-4"><ArrowRight className="size-4 text-primary" /><span className="text-xs font-semibold">In transit</span></div><div className="flex flex-col gap-2 border-r border-white/10 p-4"><MapPin className="size-4 text-primary" /><span className="text-xs font-semibold">Checkpoint</span></div><div className="flex flex-col gap-2 p-4"><MapPin className="size-4 text-primary" /><span className="text-xs font-semibold">Delivery</span></div></div></div></section>;
}

MapPreviewSection.displayName = "MapPreviewSection";
