import Link from "next/link";
import { ArrowLeft, Fish, Search } from "lucide-react";
import { MapLibreMap } from "@/components/map";
import { Button } from "@/components/ui/button";

export default function TrackPage() {
  const origin: [number, number] = [-74.006, 40.7128];
  const destination: [number, number] = [-73.9352, 40.7306];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Fish className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">KoiExpress</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-dark">Track Package</h1>
            <p className="text-muted-foreground">
              Enter tracking number to see shipment status and live location.
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-white p-4 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter tracking number"
                className="flex h-12 flex-1 rounded-md border border-input bg-background px-3 py-2 text-base"
              />
              <Button className="h-12 px-6 rounded-md bg-primary text-white flex items-center justify-center gap-2 hover:bg-primary/90">
                <Search className="h-4 w-4" />
                <span>Track</span>
              </Button>
            </div>
          </div>

          <MapLibreMap
            origin={origin}
            destination={destination}
            className="h-[300px] md:h-[400px] w-full rounded-xl border border-red-100 shadow-sm"
          />
        </div>
      </main>
    </div>
  );
}
