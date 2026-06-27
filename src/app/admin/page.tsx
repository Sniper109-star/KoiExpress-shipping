import { Navbar } from "@/components/navbar";
import { Users, Truck, BarChart3, Settings } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Admin dashboard with analytics and management features.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
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
                  <p className="text-sm text-muted-foreground">Shipments</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold">$0</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Settings</p>
                  <p className="text-xl font-bold">--</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}