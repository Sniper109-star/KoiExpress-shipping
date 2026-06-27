import Link from "next/link";
import { ArrowLeft, Fish, Package } from "lucide-react";
import { MapLibreMap } from "@/components/map";
import { Button } from "@/components/ui/button";

export default function CreateShipmentPage() {
  const origin: [number, number] = [-74.006, 40.7128];
  const destination: [number, number] = [-73.9352, 40.7306];

  return (
    <div className="min-h-screen flex flex-col bg-accent">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
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
            <h1 className="text-2xl md:text-3xl font-bold text-dark">Create Shipment</h1>
            <p className="text-muted-foreground">
              Please sign in to create shipments. This page requires authentication.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="origin" className="text-sm font-medium text-dark">
                    Origin
                  </label>
                  <input
                    id="origin"
                    type="text"
                    placeholder="Pickup location"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                    defaultValue="New York, NY"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="destination" className="text-sm font-medium text-dark">
                    Destination
                  </label>
                  <input
                    id="destination"
                    type="text"
                    placeholder="Delivery location"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                    defaultValue="Brooklyn, NY"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium text-dark">
                    Weight (kg)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    placeholder="0.0"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                  />
                </div>
                <Button className="w-full h-12 rounded-md font-medium text-base flex items-center justify-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Create Shipment</span>
                </Button>
              </div>
            </div>

            <MapLibreMap
              origin={origin}
              destination={destination}
              className="h-[300px] md:h-[400px] w-full rounded-xl border shadow-sm"
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link href="/login" className="font-medium text-primary underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
