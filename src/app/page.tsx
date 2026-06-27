import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Truck, MapPin, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Enterprise Logistics Platform
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              End-to-end delivery management with real-time tracking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/create-shipment">
                <Button size="lg" className="w-full sm:w-auto min-h-[48px]">
                  Create Shipment
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[48px]">
                  Track Package
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Monitor your shipments with live GPS updates
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Carrier Support</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Same-day, standard, international, and freight options
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Drivers</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Vetted drivers with ratings and insurance
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}