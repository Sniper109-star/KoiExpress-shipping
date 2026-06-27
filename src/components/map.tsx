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

export function MapLibreMap({
  className = "h-[400px] w-full rounded-xl border",
  origin,
  destination,
  driverLocation,
  markers = [],
}: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const bounds = new maplibregl.LngLatBounds();
    const points: [number, number][] = [];

    if (origin) {
      points.push(origin);
      bounds.extend(origin);
    }
    if (destination) {
      points.push(destination);
      bounds.extend(destination);
    }
    if (driverLocation) {
      points.push(driverLocation);
      bounds.extend(driverLocation);
    }
    markers.forEach((m) => {
      points.push(m.coordinates);
      bounds.extend(m.coordinates);
    });

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: points.length > 0 ? points[0] : [-74.5, 40],
      zoom: points.length > 1 ? undefined : 12,
      bounds: points.length > 1 ? bounds : undefined,
    });

    map.current = mapInstance;

    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

    mapInstance.on("load", () => {
      if (origin) {
        new maplibregl.Marker({ color: "#3b82f6" })
          .setLngLat(origin)
          .setPopup(new maplibregl.Popup().setHTML("<strong>Origin</strong>"))
          .addTo(mapInstance);
      }

      if (destination) {
        new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat(destination)
          .setPopup(new maplibregl.Popup().setHTML("<strong>Destination</strong>"))
          .addTo(mapInstance);
      }

      if (driverLocation) {
        new maplibregl.Marker({ color: "#22c55e", scale: 0.8 })
          .setLngLat(driverLocation)
          .setPopup(new maplibregl.Popup().setHTML("<strong>Driver Location</strong>"))
          .addTo(mapInstance);
      }

      markers.forEach((marker) => {
        new maplibregl.Marker({ color: "#f59e0b" })
          .setLngLat(marker.coordinates)
          .setPopup(
            new maplibregl.Popup().setHTML(marker.label || "<strong>Marker</strong>")
          )
          .addTo(mapInstance);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [origin, destination, driverLocation, markers]);

  return <div ref={mapContainer} className={className} />;
}