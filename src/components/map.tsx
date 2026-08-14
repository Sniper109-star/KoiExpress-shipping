"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapLibreMapProps {
  className?: string;
  origin?: [number, number];
  destination?: [number, number];
  driverLocation?: [number, number];
  markers?: Array<{ coordinates: [number, number]; label?: string }>;
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

export function MapLibreMap({ className = "h-[400px] w-full rounded-xl border", origin, destination, driverLocation, markers = [] }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const points = [origin, destination, driverLocation, ...markers.map((marker) => marker.coordinates)].filter(Boolean) as [number, number][];
    const bounds = new maplibregl.LngLatBounds();
    points.forEach((point) => bounds.extend(point));
    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: "/api/maptiler/style",
      center: points[0] ?? [-74.006, 40.7128],
      zoom: points.length > 1 ? undefined : 11,
      bounds: points.length > 1 ? bounds : undefined,
      fitBoundsOptions: { padding: 56, maxZoom: 13 },
    });
    map.current = instance;
    instance.addControl(new maplibregl.NavigationControl(), "top-right");
    instance.on("load", () => {
      if (origin) new maplibregl.Marker({ color: "#D62828" }).setLngLat(origin).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Pickup location"))).addTo(instance);
      if (destination) new maplibregl.Marker({ color: "#1D3557" }).setLngLat(destination).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Delivery location"))).addTo(instance);
      if (driverLocation) new maplibregl.Marker({ color: "#2A9D8F" }).setLngLat(driverLocation).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Current driver location"))).addTo(instance);
      markers.forEach((marker) => new maplibregl.Marker({ color: "#D62828" }).setLngLat(marker.coordinates).setPopup(new maplibregl.Popup().setDOMContent(popupContent(marker.label ?? "Tracking event"))).addTo(instance));
    });
    return () => { instance.remove(); map.current = null; };
  }, [origin, destination, driverLocation, markers]);

  return <div ref={mapContainer} className={className} aria-label="MapTiler shipment tracking map" />;
}
