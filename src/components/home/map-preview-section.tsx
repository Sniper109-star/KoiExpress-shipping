"use client";

import { useEffect, useMemo, useState } from "react";
import { MapLibreMap } from "@/components/map";
import { Card } from "@/components/ui/card";
import { subscribeToShipmentStream } from "@/lib/realtime";

type LiveShipment = {
  id: string;
  origin_lat?: number | null;
  origin_lng?: number | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  liveLocation?: { latitude?: number | null; longitude?: number | null } | null;
};

const fallbackOrigin: [number, number] = [-74.006, 40.7128];
const fallbackDestination: [number, number] = [-73.935, 40.7306];

export function MapPreviewSection() {
  const [shipment, setShipment] = useState<LiveShipment | null>(null);
  const [route, setRoute] = useState<[number, number][]>([fallbackOrigin, [-73.98, 40.72], fallbackDestination]);

  useEffect(() => {
    let active = true;
    const apply = (rows: LiveShipment[]) => {
      const next = rows[0];
      if (active && next) setShipment(next);
    };
    fetch("/api/shipments/live?limit=1", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((payload) => apply(payload?.shipments ?? [])).catch(() => undefined);
    const unsubscribe = subscribeToShipmentStream((event) => { if (event.type === "shipments") apply(event.data.shipments ?? []); });
    return () => { active = false; unsubscribe(); };
  }, []);

  const origin = useMemo<[number, number]>(() => shipment?.origin_lng != null && shipment.origin_lat != null ? [shipment.origin_lng, shipment.origin_lat] : fallbackOrigin, [shipment]);
  const destination = useMemo<[number, number]>(() => shipment?.destination_lng != null && shipment.destination_lat != null ? [shipment.destination_lng, shipment.destination_lat] : fallbackDestination, [shipment]);
  const driverLocation: [number, number] | undefined = shipment?.liveLocation?.longitude != null && shipment.liveLocation.latitude != null ? [shipment.liveLocation.longitude, shipment.liveLocation.latitude] : undefined;

  const originKey = origin.join(",");
  const destinationKey = destination.join(",");

  useEffect(() => {
    const params = new URLSearchParams({ origin: originKey, destination: destinationKey });
    fetch(`/api/maptiler/directions?${params.toString()}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((payload) => {
      const coordinates = payload?.features?.[0]?.geometry?.coordinates ?? payload?.routes?.[0]?.geometry?.coordinates;
      if (Array.isArray(coordinates) && coordinates.length > 1) setRoute(coordinates as [number, number][]);
    }).catch(() => setRoute([origin, destination]));
  }, [destination, destinationKey, origin, originKey]);

  return <section className="bg-white py-16 md:py-24"><div className="container mx-auto px-4"><div className="mb-12 space-y-4 text-center"><h2 className="text-3xl font-bold text-dark md:text-4xl">Track Every Package</h2><p className="mx-auto max-w-2xl text-lg text-muted-foreground">Live MapTiler visibility powered by real shipment data and streaming location updates.</p></div><Card variant="default" className="relative overflow-hidden rounded-xl border-2 border-primary/20 p-0"><div className="relative h-[300px] md:h-[400px]"><MapLibreMap className="h-full w-full rounded-none border-0" origin={origin} destination={destination} driverLocation={driverLocation} route={route} /><div className="absolute bottom-4 left-4 rounded-lg bg-background/95 p-3 shadow-lg backdrop-blur"><p className="text-sm font-semibold text-foreground">{shipment ? "Live shipment visibility" : "MapTiler live preview"}</p><p className="text-xs text-muted-foreground">{driverLocation ? "Driver location updated from Neon tracking events." : "Waiting for the first live shipment location."}</p></div></div><div className="absolute right-4 top-4"><span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success"><span className="size-2 animate-pulse rounded-full bg-success" />Live Tracking Active</span></div></Card></div></section>;
}

MapPreviewSection.displayName = "MapPreviewSection";
