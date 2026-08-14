import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { MapLibreMap } from "@/components/map"
import { CustomerShipmentForm } from "@/components/shipping/customer-shipment-form"

export default function CreateShipmentPage() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><div className="container mx-auto flex h-16 items-center gap-4 px-4"><Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary"><Image src="/brand/koi-express-logo.jpg" alt="Unifet Logistics" width={28} height={28} className="size-7 rounded-full object-cover" /><span>Unifet Logistics</span></Link><Link href="/" className="ml-auto flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Back to Home</Link></div></header>
    <main className="container mx-auto px-4 py-8 md:py-14"><div className="mx-auto max-w-6xl space-y-8"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Customer shipping</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Start a shipment request.</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">Tell us where your package is going, compare available options, and submit it for confirmation.</p></div><div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-8"><CustomerShipmentForm /></section><MapLibreMap origin={[-74.006, 40.7128]} destination={[-73.9352, 40.7306]} className="min-h-[360px] w-full rounded-xl border border-border shadow-sm" /></div><p className="text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-primary underline">Sign in</Link> to see your shipment history.</p></div></main>
  </div>
}
