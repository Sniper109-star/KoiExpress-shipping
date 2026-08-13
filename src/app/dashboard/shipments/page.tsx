"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Radio } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { subscribeToTable } from "@/lib/realtime";

type Shipment = {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
};

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    delivered: "bg-success/10 text-success",
    in_transit: "bg-primary/10 text-primary",
    pending: "bg-secondary/10 text-secondary",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}>{status.replaceAll("_", " ")}</span>;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShipments = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("shipments")
      .select("id, tracking_number, origin, destination, status, created_at")
      .order("created_at", { ascending: false });
    if (queryError) {
      setError("Unable to load shipments right now.");
    } else {
      setShipments((data ?? []) as Shipment[]);
      setError(null);
    }
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

  const filtered = useMemo(() => shipments.filter((shipment) => {
    if (statusFilter !== "all" && shipment.status !== statusFilter) return false;
    const query = search.toLowerCase();
    return !query || shipment.tracking_number.toLowerCase().includes(query) || shipment.origin.toLowerCase().includes(query) || shipment.destination.toLowerCase().includes(query);
  }), [search, shipments, statusFilter]);

  return <DashboardLayout>
    <div className="space-y-6">
      <div><div className="flex items-center gap-2"><h1 className="text-2xl md:text-3xl font-bold text-dark">Shipments</h1><span className="inline-flex items-center gap-1 text-xs text-success"><Radio className="size-3" /> Live</span></div><p className="text-muted-foreground text-sm md:text-base">Manage and track live shipment records.</p></div>
      <Card variant="default" className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tracking number or route..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div><div className="flex gap-3"><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_transit">In Transit</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent></Select><Button variant="outline" size="icon" aria-label="Download shipments"><Download className="h-4 w-4" /></Button></div></div>
        {error ? <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</p> : <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Tracking ID</TableHead><TableHead>Route</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Loading live shipments...</TableCell></TableRow> : filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No shipments found.</TableCell></TableRow> : filtered.map((shipment) => <TableRow key={shipment.id}><TableCell className="font-medium">{shipment.tracking_number}</TableCell><TableCell>{shipment.origin} → {shipment.destination}</TableCell><TableCell>{getStatusBadge(shipment.status)}</TableCell><TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell><TableCell><Link href={`/dashboard/tracking?id=${shipment.tracking_number}`}><Button variant="ghost" size="sm">View</Button></Link></TableCell></TableRow>)}</TableBody></Table></div>}
      </Card>
    </div>
  </DashboardLayout>;
}
