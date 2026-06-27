"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapboxMapProps {
  className?: string;
  origin?: [number, number];
  destination?: [number, number];
  driverLocation?: [number, number];
  markers?: Array<{ coordinates: [number, number]; label?: string }>;
}

export function MapboxMap({
  className = "h-[400px] w-full rounded-xl border",
  origin,
  destination,
  driverLocation,
  markers = [],
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!mapboxgl.accessToken) {
      console.warn("Mapbox token is not set. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.");
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-muted rounded-xl text-muted-foreground text-sm p-4 text-center">
            Map requires Mapbox token. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </div>
        `;
      }
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
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

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: points.length > 0 ? points[0] : [-74.5, 40],
      zoom: points.length > 1 ? undefined : 12,
      bounds: points.length > 1 ? bounds : undefined,
    });

    map.current = mapInstance;

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    if (origin) {
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat(origin)
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Origin</strong>"))
        .addTo(mapInstance);
    }

    if (destination) {
      new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(destination)
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Destination</strong>"))
        .addTo(mapInstance);
    }

    if (driverLocation) {
      new mapboxgl.Marker({ color: "#22c55e", scale: 0.8 })
        .setLngLat(driverLocation)
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Driver Location</strong>"))
        .addTo(mapInstance);
    }

    markers.forEach((marker) => {
      new mapboxgl.Marker({ color: "#f59e0b" })
        .setLngLat(marker.coordinates)
        .setPopup(
          new mapboxgl.Popup().setHTML(marker.label || "<strong>Marker</strong>")
        )
        .addTo(mapInstance);
    });

    if (origin && destination) {
      const getRoute = async () => {
        try {
          const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          );
          const json = await res.json();
          if (json.routes && json.routes[0]) {
            const route = json.routes[0].geometry;
            mapInstance.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route,
              },
            });
            mapInstance.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.8,
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch route:", error);
        }
      };

      mapInstance.on("load", getRoute);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [origin, destination, driverLocation, markers]);

  return <div ref={mapContainer} className={className} />;
}