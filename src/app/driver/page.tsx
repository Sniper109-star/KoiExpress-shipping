import { Navbar } from "@/components/navbar";
import { Truck, Navigation, Package, Clock } from "lucide-react";

export default function DriverDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Driver Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Driver portal to manage assigned shipments.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
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
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
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
          </div>
        </div>
      </main>
    </div>
  );
}