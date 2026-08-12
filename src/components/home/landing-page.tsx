"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Globe2,
  Headphones,
  MapPin,
  Package,
  PackageCheck,
  Plane,
  Route,
  Search,
  ShieldCheck,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const services = [
  [Package, "Domestic Shipping", "Fast and reliable delivery of packages across cities and regions."],
  [Globe2, "International Shipping", "Send packages worldwide with flexible international shipping solutions."],
  [Truck, "Freight & Cargo", "Move large, heavy, or commercial goods with dependable freight services."],
  [Plane, "Express Delivery", "Time-sensitive packages delivered with priority handling."],
  [Building2, "Business Logistics", "End-to-end shipping solutions designed for businesses and online sellers."],
  [MapPin, "Door-to-Door Delivery", "We pick up your package and deliver it directly to the recipient."],
] as const;

const steps = [
  ["01", "Book", "Enter your shipment details and choose your delivery option."],
  ["02", "Pickup", "We collect your package from your preferred location."],
  ["03", "Track", "Follow your shipment throughout its journey."],
  ["04", "Delivered", "Your package arrives safely at its destination."],
];

const benefits = [
  [Zap, "Fast Delivery"], [Route, "Real-Time Tracking"], [ShieldCheck, "Secure Handling"],
  [Globe2, "Global Coverage"], [CircleDollarSign, "Transparent Pricing"], [Headphones, "Dedicated Support"],
] as const;

export function LandingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackedShipment, setTrackedShipment] = useState<any>(null);
  const [quote, setQuote] = useState({ pickup: "", destination: "", type: "Parcel", weight: "", dimensions: "", speed: "standard" });
  const [quoteSaved, setQuoteSaved] = useState(false);

  useEffect(() => {
    if (!supabase || !trackedShipment?.id) return;
    const channel = supabase.channel(`shipment-${trackedShipment.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments", filter: `id=eq.${trackedShipment.id}` }, (payload: { new: Record<string, unknown> }) => setTrackedShipment(payload.new))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [trackedShipment?.id]);

  const estimate = useMemo(() => {
    const weight = Math.max(Number(quote.weight) || 1, 1);
    const speedFactor = quote.speed === "priority" ? 2.1 : quote.speed === "express" ? 1.55 : 1;
    const distanceFactor = quote.pickup && quote.destination ? 1.3 : 1;
    return Math.round((18 + weight * 7.5) * speedFactor * distanceFactor);
  }, [quote]);

  async function trackShipment() {
    if (!supabase || !trackingNumber.trim()) return;
    const { data } = await supabase.from("shipments").select("*, shipment_events(*)").eq("tracking_number", trackingNumber.trim().toUpperCase()).maybeSingle();
    setTrackedShipment(data);
  }

  async function saveQuote() {
    if (!supabase || !quote.pickup || !quote.destination || !quote.weight) return;
    const { error } = await supabase.from("quotes").insert({ pickup_location: quote.pickup, destination: quote.destination, package_type: quote.type, weight: Number(quote.weight), dimensions: quote.dimensions || null, delivery_speed: quote.speed, estimated_cost: estimate });
    setQuoteSaved(!error);
  }

  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-20 md:px-8 md:py-28 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/70"><span className="size-2 rounded-full bg-primary" />Unifet logistics</p>
            <h1 className="text-balance text-5xl font-semibold tracking-[-0.06em] md:text-7xl lg:text-8xl">Ship Anywhere.<br /><span className="text-primary">We Handle the Journey.</span></h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-secondary-foreground/70 md:text-xl">Reliable shipping and logistics solutions designed to move your packages safely, quickly, and efficiently — locally and internationally.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="#quote"><Button size="lg" className="h-14 rounded-sm bg-primary px-7 text-primary-foreground hover:bg-primary/90">Get a Shipping Quote <ArrowRight data-icon="inline-end" /></Button></Link><Link href="#tracking"><Button size="lg" variant="outline" className="h-14 rounded-sm border-secondary-foreground/30 bg-transparent px-7 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">Track Shipment <Search data-icon="inline-end" /></Button></Link></div>
          </div>
          <div className="w-full max-w-sm border border-secondary-foreground/20 p-5"><div className="flex items-center justify-between border-b border-secondary-foreground/20 pb-4 text-xs uppercase tracking-[0.18em] text-secondary-foreground/60"><span>Live network</span><span className="text-primary">Online</span></div><div className="flex items-center gap-4 py-8"><div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><PackageCheck /></div><div><p className="text-3xl font-semibold">24/7</p><p className="text-sm text-secondary-foreground/60">visibility across every mile</p></div></div><div className="flex items-center gap-2 text-sm text-secondary-foreground/70"><MapPin className="text-primary" /> Lagos <ChevronRight className="size-4" /> London</div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="mb-12 max-w-2xl"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">What we move</p><h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">The right service for every shipment.</h2></div><div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{services.map(([Icon, title, description]) => <article key={title} className="bg-card p-7 transition-colors hover:bg-accent"><Icon className="mb-12 text-primary" /><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{description}</p></article>)}</div></section>

      <section className="border-y border-border bg-accent"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">The journey</p><h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Simple from start to finish.</h2></div><p className="max-w-sm text-muted-foreground">We keep the process clear so your team and your customers always know what happens next.</p></div><div className="grid gap-10 md:grid-cols-4"> {steps.map(([number, title, description], index) => <div key={number} className="relative"><div className="mb-6 flex items-center gap-3"><span className="text-sm font-bold text-primary">{number}</span>{index < 3 && <span className="hidden h-px flex-1 bg-border md:block" />}</div><h3 className="text-2xl font-semibold">{title}</h3><p className="mt-3 text-muted-foreground">{description}</p></div>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">The Unifet fleet</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Built to carry what matters.</h2>
          </div>
          <p className="max-w-sm leading-7 text-muted-foreground">A premium network of road and air capability, designed around one promise: your shipment arrives with care.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="group overflow-hidden border border-border bg-card">
            <Image src="/unifet-delivery-van.png" alt="Unifet red delivery van" width={1200} height={900} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Local network</p><h3 className="mt-1 text-xl font-semibold">City delivery vans</h3></div><Truck className="text-primary" /></div>
          </article>
          <article className="group overflow-hidden border border-border bg-card">
            <Image src="/unifet-freight-truck.png" alt="Unifet red freight truck" width={1200} height={900} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Heavy freight</p><h3 className="mt-1 text-xl font-semibold">Cargo fleet</h3></div><Package className="text-primary" /></div>
          </article>
          <article className="group overflow-hidden border border-border bg-card">
            <Image src="/unifet-cargo-aircraft.png" alt="Unifet red cargo aircraft" width={1200} height={900} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Global reach</p><h3 className="mt-1 text-xl font-semibold">Air cargo</h3></div><Plane className="text-primary" /></div>
          </article>
        </div>
      </section>
      <section id="tracking" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 md:px-8 md:py-28"><div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Shipment visibility</p><h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Track your shipment.</h2><p className="mt-5 max-w-md leading-7 text-muted-foreground">Enter your Unifet tracking number for live status updates and the latest checkpoint.</p></div><div className="border border-border bg-card p-6 md:p-8"><div className="flex flex-col gap-3 sm:flex-row"><input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="h-14 flex-1 border border-input bg-background px-4 outline-none focus:border-primary" /><Button onClick={trackShipment} className="h-14 rounded-sm px-6">Track Package <Search data-icon="inline-end" /></Button></div>{trackedShipment ? <div className="mt-8"><div className="flex items-center justify-between border-b border-border pb-4"><div><p className="font-semibold">{trackedShipment.tracking_number}</p><p className="text-sm text-muted-foreground">{trackedShipment.pickup_location} to {trackedShipment.destination}</p></div><span className="bg-accent px-3 py-1 text-sm font-semibold capitalize text-primary">{trackedShipment.status.replaceAll("_", " ")}</span></div><div className="mt-8 grid grid-cols-4 gap-2">{["picked_up", "in_transit", "at_destination", "delivered"].map((status) => <div key={status} className="flex flex-col gap-2"><div className={`h-2 ${["picked_up", "in_transit", "at_destination", "delivered"].indexOf(trackedShipment.status) >= ["picked_up", "in_transit", "at_destination", "delivered"].indexOf(status) ? "bg-primary" : "bg-muted"}`} /><span className="text-xs capitalize text-muted-foreground">{status.replaceAll("_", " ")}</span></div>)}</div></div> : <p className="mt-6 text-sm text-muted-foreground">Try the demo number: UNI-2048-ORANGE</p>}</div></div></section>

      <section className="bg-secondary text-secondary-foreground"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="mb-12 max-w-2xl"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Why Unifet</p><h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Built for the moments that matter.</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{benefits.map(([Icon, title]) => <div key={title} className="flex items-center gap-4 border border-secondary-foreground/15 p-5"><Icon className="text-primary" /><span className="font-medium">{title}</span></div>)}</div></div></section>

      <section id="quote" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 md:px-8 md:py-28"><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Quote calculator</p><h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Know the cost before you ship.</h2><p className="mt-5 leading-7 text-muted-foreground">Get a transparent estimate, then send the details to our team for confirmation.</p></div><div className="border border-border bg-card p-6 md:p-8"><div className="grid gap-4 sm:grid-cols-2"><input aria-label="Pickup location" placeholder="Pickup location" value={quote.pickup} onChange={(e) => setQuote({ ...quote, pickup: e.target.value })} className="h-12 border border-input bg-background px-4" /><input aria-label="Destination" placeholder="Destination" value={quote.destination} onChange={(e) => setQuote({ ...quote, destination: e.target.value })} className="h-12 border border-input bg-background px-4" /><select aria-label="Package type" value={quote.type} onChange={(e) => setQuote({ ...quote, type: e.target.value })} className="h-12 border border-input bg-background px-4"><option>Parcel</option><option>Documents</option><option>Freight</option><option>Commercial cargo</option></select><input aria-label="Weight" type="number" min="1" placeholder="Weight in kg" value={quote.weight} onChange={(e) => setQuote({ ...quote, weight: e.target.value })} className="h-12 border border-input bg-background px-4" /><input aria-label="Dimensions" placeholder="Dimensions (L × W × H)" value={quote.dimensions} onChange={(e) => setQuote({ ...quote, dimensions: e.target.value })} className="h-12 border border-input bg-background px-4 sm:col-span-2" /><select aria-label="Delivery speed" value={quote.speed} onChange={(e) => setQuote({ ...quote, speed: e.target.value })} className="h-12 border border-input bg-background px-4 sm:col-span-2"><option value="standard">Standard delivery</option><option value="express">Express delivery</option><option value="priority">Priority delivery</option></select></div><div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-muted-foreground">Estimated shipping cost</p><p className="text-4xl font-semibold text-primary">${estimate}.00</p></div><Button onClick={saveQuote} disabled={!quote.pickup || !quote.destination || !quote.weight} className="h-12">{quoteSaved ? <><Check data-icon="inline-start" /> Quote requested</> : <>Request this quote <ArrowRight data-icon="inline-end" /></>}</Button></div></div></div></section>

      <section className="border-t border-border bg-accent"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="max-w-3xl"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">About Unifet</p><h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Moving What Matters.</h2><p className="mt-6 text-xl leading-9 text-muted-foreground">We provide reliable shipping and logistics solutions that connect people and businesses to destinations around the world.</p><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">From small packages to commercial cargo, our goal is simple: make shipping easier, safer, and more transparent.</p></div></div></section>

      <footer className="bg-secondary text-secondary-foreground"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8"><div className="flex items-center gap-2 font-semibold"><Warehouse className="text-primary" /> Unifet</div><p className="text-secondary-foreground/60">Moving what matters, everywhere.</p><Link href="/login" className="text-primary hover:underline">Sign in to dashboard</Link></div></footer>
    </main>
  );
}

LandingPage.displayName = "LandingPage";
