import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { MapboxMap } from "@/components/map";

export default function TrackPage() {
  const origin: [number, number] = [-74.006, 40.7128];
  const destination: [number, number] = [-73.9352, 40.7306];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Track Package</h1>
            <p className="text-muted-foreground">
              Enter tracking number to see shipment status and live location.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter tracking number"
                className="flex h-12 flex-1 rounded-md border border-input bg-background px-3 py-2 text-base"
              />
              <button className="h-12 px-6 rounded-md bg-primary text-primary-foreground font-medium text-base flex items-center justify-center gap-2">
                <Search className="h-4 w-4" />
                <span>Track</span>
              </button>
            </div>
          </div>

          <MapboxMap
            origin={origin}
            destination={destination}
            className="h-[300px] md:h-[400px] w-full"
          />
        </div>
      </main>
    </div>
  );
}