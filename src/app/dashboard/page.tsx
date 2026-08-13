"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Clock, MapPin, Plus, Radio } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { subscribeToTable } from "@/lib/realtime";

type Shipment = { id: string; tracking_number: string; origin: string; destination: string; status: string; created_at: string };

function getStatusBadge(status: string) {
  const styles: Record<string, string> = { delivered: "bg-success/10 text-success", in_transit: "bg-primary/10 text-primary", pending: "bg-secondary/10 text-secondary" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}>{status.replaceAll("_", " ")}</span>;
}

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShipments = useCallback(async () => {
    const { data } = await supabase.from("shipments").select("id, tracking_number, origin, destination, status, created_at").order("created_at", { ascending: false });
    setShipments((data ?? []) as Shipment[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadShipments(), 0);
    const unsubscribe = subscribeToTable("shipments", () => void loadShipments());
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [loadShipments]);

  const stats = useMemo(() => [
    { label: "Total Shipments", value: shipments.length.toLocaleString(), icon: Package, color: "text-primary" },
    { label: "Active Shipments", value: shipments.filter((shipment) => !["delivered", "cancelled", "returned"].includes(shipment.status)).length.toLocaleString(), icon: TrendingUp, color: "text-success" },
    { label: "Updated Live", value: "Now", icon: Clock, color: "text-secondary" },
    { label: "Delivered", value: shipments.filter((shipment) => shipment.status === "delivered").length.toLocaleString(), icon: MapPin, color: "text-success" },
  ], [shipments]);

  return <DashboardLayout><div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h1 className="text-2xl md:text-3xl font-bold text-dark">Dashboard</h1><span className="inline-flex items-center gap-1 text-xs text-success"><Radio className="size-3" /> Live</span></div><p className="text-muted-foreground text-sm md:text-base">Live shipment operations across USA and global routes.</p></div><Link href="/dashboard/create"><Button className="gap-2"><Plus className="h-4 w-4" />New Shipment</Button></Link></div><div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <Card key={stat.label} variant="default" className="p-4 md:p-6"><div className="flex items-center gap-3 md:gap-4"><div className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 ${stat.color}`}><stat.icon className="h-5 w-5 md:h-6 md:w-6" /></div><div><p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p><p className="text-xl md:text-2xl font-bold">{loading ? "—" : stat.value}</p></div></div></Card>)}</div><Card variant="default" className="p-4 md:p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-dark">Recent Shipments</h2><Link href="/dashboard/shipments"><Button variant="ghost" size="sm">View All</Button></Link></div><div className="space-y-2">{loading ? <p className="py-8 text-center text-muted-foreground">Loading live data...</p> : shipments.slice(0, 5).map((shipment) => <div key={shipment.id} className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><p className="font-medium">{shipment.tracking_number}</p><p className="text-sm text-muted-foreground">{shipment.origin} → {shipment.destination}</p></div><div className="flex items-center gap-3">{getStatusBadge(shipment.status)}<Link href={`/dashboard/tracking?id=${shipment.tracking_number}`}><Button variant="ghost" size="sm">View</Button></Link></div></div>)}</div></Card></div></DashboardLayout>;
}
