import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">SwiftShip</Link>
          <nav className="flex items-center gap-4">
            <Link href="/track">
              <Button variant="ghost">Track Package</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Enterprise Logistics Platform</h1>
          <p className="text-xl text-muted-foreground mb-8">
            End-to-end delivery management with real-time tracking
          </p>
          <Link href="/create-shipment">
            <Button size="lg">Create Shipment</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your shipments with live GPS updates
            </p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">Multi-Carrier Support</h3>
            <p className="text-muted-foreground">
              Same-day, standard, international, and freight options
            </p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">Professional Drivers</h3>
            <p className="text-muted-foreground">
              Vetted drivers with ratings and insurance
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}