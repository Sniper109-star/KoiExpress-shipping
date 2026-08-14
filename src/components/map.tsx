"use client";

import { useEffect, useRef } from "react";
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

export function MapLibreMap({ className = "h-[400px] w-full rounded-xl border", origin, destination, driverLocation, route = [], markers = [], interactive = true }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const routeKey = JSON.stringify({ origin, destination, driverLocation, route, markers, interactive });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const points = [origin, destination, driverLocation, ...route, ...markers.map((marker) => marker.coordinates)].filter(Boolean) as [number, number][];
    const bounds = new maplibregl.LngLatBounds();
    points.forEach((point) => bounds.extend(point));
    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: "/api/maptiler/style",
      center: points[0] ?? [-74.006, 40.7128],
      zoom: points.length > 1 ? undefined : 11,
      bounds: points.length > 1 ? bounds : undefined,
      fitBoundsOptions: { padding: 64, maxZoom: 13 },
      cooperativeGestures: !interactive,
    });
    map.current = instance;
    instance.addControl(new maplibregl.NavigationControl(), "top-right");
    instance.on("load", () => {
      const line = route.length > 1 ? route : origin && destination ? [origin, destination] : [];
      if (line.length > 1) {
        instance.addSource("shipment-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } } });
        instance.addLayer({ id: "shipment-route-casing", type: "line", source: "shipment-route", paint: { "line-color": "#071b2d", "line-width": 8, "line-opacity": 0.8 } });
        instance.addLayer({ id: "shipment-route", type: "line", source: "shipment-route", paint: { "line-color": "#16c79a", "line-width": 4, "line-opacity": 0.95, "line-dasharray": [1.5, 1] } });
      }
      if (origin) new maplibregl.Marker({ color: "#f59e0b" }).setLngLat(origin).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Pickup location"))).addTo(instance);
      if (destination) new maplibregl.Marker({ color: "#ef4444" }).setLngLat(destination).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Delivery location"))).addTo(instance);
      if (driverLocation) new maplibregl.Marker({ color: "#16c79a" }).setLngLat(driverLocation).setPopup(new maplibregl.Popup().setDOMContent(popupContent("Current shipment location"))).addTo(instance);
      markers.forEach((marker) => new maplibregl.Marker({ color: "#5b8def" }).setLngLat(marker.coordinates).setPopup(new maplibregl.Popup().setDOMContent(popupContent(marker.label ?? marker.status ?? "Tracking event", marker.timestamp))).addTo(instance));
    });
    return () => { instance.remove(); map.current = null; };
  }, [routeKey]);

  return <div ref={mapContainer} className={className} role="img" aria-label="MapTiler shipment route map" />;
}
