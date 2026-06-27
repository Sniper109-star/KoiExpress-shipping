import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navigation, PackageSearch } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-accent">
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-dark">
              Fast. Reliable. <span className="text-primary">KoiExpress.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              End-to-end delivery management with real-time tracking. From pickup to doorstep, we deliver excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/create-shipment">
                <Button size="lg" className="w-full sm:w-auto min-h-[48px]">
                  <PackageSearch className="mr-2 h-4 w-4" />
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
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="w-80 h-80 rounded-full bg-primary/10 flex items-center justify-center">
              <Navigation className="h-32 w-32 text-primary/60" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-success/20 flex items-center justify-center">
              <PackageSearch className="h-12 w-12 text-success" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

HeroSection.displayName = "HeroSection";
