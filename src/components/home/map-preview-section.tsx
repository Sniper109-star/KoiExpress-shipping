import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MapPreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark">Track Every Package</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See exactly where your shipment is with our live map view. No guesswork, just precision.
          </p>
        </div>

        <Card variant="default" className="relative overflow-hidden rounded-xl border-2 border-primary/20 p-0">
          <div className="flex flex-col md:flex-row items-center justify-center h-[300px] md:h-[400px] bg-gradient-to-br from-primary/5 via-accent to-secondary/5">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-semibold text-dark">Interactive Map</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Live GPS tracking with real-time driver location and estimated delivery times.
              </p>
              <Link href="/track">
                <Button variant="outline">Try Live Tracking</Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
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
