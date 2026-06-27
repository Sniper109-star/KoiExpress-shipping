import { Navbar } from "@/components/navbar";
import { Package, TrendingUp, Clock, MapPin } from "lucide-react";
import { MapLibreMap } from "@/components/map";

export default function CustomerDashboard() {
  const driverLocation: [number, number] = [-73.9857, 40.7484];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Customer Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Please sign in to view your shipments.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </div>
          </div>

          <MapLibreMap
            driverLocation={driverLocation}
            className="h-[300px] md:h-[400px] w-full"
          />
        </div>
      </main>
    </div>
  );
}