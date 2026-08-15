"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapEvent {
  coordinates: [number, number];
  label?: string;
  status?: string;
  timestamp?: string;
}

interface MapLibreMapProps {
  className?: string;
  branded?: boolean;
  origin?: [number, number];
  destination?: [number, number];
  driverLocation?: [number, number];
  route?: [number, number][];
  markers?: MapEvent[];
  interactive?: boolean;
}

function popupContent(title: string, detail?: string) {
  const element = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  element.appendChild(heading);
  if (detail) {
    const body = document.createElement("div");
    body.textContent = detail;
    element.appendChild(body);
  }
  return element;
}

export function MapLibreMap({ className = "h-[400px] w-full rounded-xl border", origin, destination, driverLocation, route = [], markers = [], interactive = true, branded = false }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState(false);
  const routeKey = JSON.stringify({ origin, destination, driverLocation, route, markers, interactive, branded });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const config = JSON.parse(routeKey) as { origin?: [number, number]; destination?: [number, number]; driverLocation?: [number, number]; route: [number, number][]; markers: MapEvent[]; interactive: boolean; branded: boolean };
    const { origin: mapOrigin, destination: mapDestination, driverLocation: mapDriverLocation, route: mapRoute, markers: mapMarkers, interactive: mapInteractive, branded: mapBranded } = config;
    const points = [mapOrigin, mapDestination, mapDriverLocation, ...mapRoute, ...mapMarkers.map((marker) => marker.coordinates)].filter(Boolean) as [number, number][];
    const bounds = new maplibregl.LngLatBounds();
    points.forEach((point) => bounds.extend(point));
    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: `/api/maptiler/style?v=5${mapBranded ? "&theme=navy" : ""}`,
      center: points[0] ?? [-74.006, 40.7128],
      zoom: points.length > 1 ? undefined : 11,
      bounds: points.length > 1 ? bounds : undefined,
      fitBoundsOptions: { padding: 64, maxZoom: 13 },
      cooperativeGestures: !mapInteractive,
    });
    map.current = instance;
    instance.addControl(new maplibregl.NavigationControl(), "top-right");
    instance.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), "top-right");
    instance.on("styleimagemissing", (event) => {
      if (!instance.hasImage(event.id)) instance.addImage(event.id, { width: 1, height: 1, data: new Uint8Array([0, 0, 0, 0]) });
    });
    instance.on("error", () => setMapError(true));
    instance.on("load", () => {
      instance.resize();
      const line = mapRoute.length > 1 ? mapRoute : mapOrigin && mapDestination ? [mapOrigin, mapDestination] : [];
      if (line.length > 1) {
        instance.addSource("shipment-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } } });
        instance.addLayer({ id: "shipment-route-casing", type: "line", source: "shipment-route", paint: { "line-color": "#071b2d", "line-width": 8, "line-opacity": 0.8 } });
        instance.addLayer({ id: "shipment-route", type: "line", source: "shipment-route", paint: { "line-color": mapBranded ? "#e53935" : "#16c79a", "line-width": 4, "line-opacity": 0.95 } });
      }
      const brandedMarker = (label: string, color: string, pulse = false) => {
        const element = document.createElement("div");
        element.className = `flex size-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-white shadow-xl ${pulse ? "animate-pulse" : ""}`;
        element.style.backgroundColor = color;
        element.textContent = label;
        return element;
      };
      if (mapOrigin) new maplibregl.Marker({ element: mapBranded ? brandedMarker("P", "#e53935") : undefined, color: "#f59e0b" }).setLngLat(mapOrigin).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Pickup location"))).addTo(instance);
      if (mapDestination) new maplibregl.Marker({ element: mapBranded ? brandedMarker("D", "#e53935") : undefined, color: "#ef4444" }).setLngLat(mapDestination).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Delivery location"))).addTo(instance);
      if (mapDriverLocation) new maplibregl.Marker({ element: mapBranded ? brandedMarker("●", "#e53935", true) : undefined, color: "#16c79a" }).setLngLat(mapDriverLocation).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Current shipment location"))).addTo(instance);
      mapMarkers.forEach((marker) => new maplibregl.Marker({ color: "#5b8def" }).setLngLat(marker.coordinates).setPopup(new maplibregl.Popup().setDOMContent(popupContent(marker.label ?? marker.status ?? "Tracking event", marker.timestamp))).addTo(instance));
    });
    return () => { instance.remove(); map.current = null; };
  }, [routeKey]);

  return (
    <div ref={mapContainer} className={`${className} relative overflow-hidden`} role="img" aria-label="Shipment route map">
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/95 p-6 text-center">
          <div className="max-w-xs">
            <p className="font-mono text-sm font-semibold text-foreground">Route map unavailable</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Shipment details and tracking remain available while map services reconnect.</p>
          </div>
        </div>
      )}
    </div>
  );
}
