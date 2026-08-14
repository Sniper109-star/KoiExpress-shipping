import Link from "next/link";
import { MapLibreMap } from "@/components/map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MapPreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark">Track Every Package</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See exactly where your shipment is with our live map view. No guesswork, just precision.
          </p>
        </div>

        <Card variant="default" className="relative overflow-hidden rounded-xl border-2 border-red-100 p-0">
          <div className="relative h-[300px] md:h-[400px]">
            <MapLibreMap className="h-full w-full rounded-none border-0" origin={[-74.006, 40.7128]} destination={[-73.935, 40.7306]} route={[[-74.006, 40.7128], [-73.98, 40.72], [-73.935, 40.7306]]} />
            <div className="absolute bottom-4 left-4 rounded-lg bg-background/95 p-3 shadow-lg backdrop-blur"><p className="text-sm font-semibold text-foreground">Live shipment visibility</p><p className="text-xs text-muted-foreground">Pickup, route, and delivery in one view.</p></div>
          </div>
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-600 border border-green-200">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live Tracking Active
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

MapPreviewSection.displayName = "MapPreviewSection";
