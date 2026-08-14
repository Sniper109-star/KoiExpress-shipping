"use client";

import { useEffect, useState } from "react";
import { Activity, MapPin, PackageCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: string;
  tracking_number: string;
  destination: string;
  status: string;
  updated_at: string;
};

const statusLabels: Record<string, string> = {
  pending: "Order placed",
  picked_up: "Picked up",
  in_transit: "In transit",
  at_destination: "Out for delivery",
  delivered: "Delivered",
};

function formatStatus(status: string) {
  return statusLabels[status] ?? status.replaceAll("_", " ");
}

export function LiveShipmentFeed() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("shipments")
        .select("id, tracking_number, destination, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(8);
      if (mounted) setShipments((data ?? []) as Shipment[]);
    };
    void load();

    const channel = supabase
      .channel("homepage-live-shipments")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, (payload) => {
        if (!mounted) return;
        if (payload.eventType === "DELETE") {
          setShipments((current) => current.filter((item) => item.id !== payload.old.id));
          return;
        }
        const next = payload.new as Shipment;
        setShipments((current) => [next, ...current.filter((item) => item.id !== next.id)].slice(0, 8));
      })
      .subscribe((status) => {
        if (mounted) setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section aria-label="Live shipments" className="w-full max-w-sm overflow-hidden border border-primary/40 bg-card shadow-lg shadow-primary/10">
      <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
        <div className="flex items-center gap-2 font-semibold"><Activity className="size-4" /> Live shipments</div>
        <div className="flex items-center gap-2 text-xs font-medium"><span className={`size-2 rounded-full ${isLive ? "bg-primary-foreground" : "bg-primary-foreground/40"}`} />{isLive ? "Live" : "Connecting"}</div>
      </div>
      <div className="flex max-h-72 min-h-56 flex-col overflow-y-auto bg-background">
        {shipments.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted-foreground"><PackageCheck className="size-8 text-primary" /><p>Live shipment updates will appear here.</p></div>
        ) : shipments.map((shipment) => (
          <div key={shipment.id} className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 last:border-b-0">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-primary">{shipment.tracking_number}</p><p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3" />{shipment.destination}</p></div>
            <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-medium capitalize text-primary">{formatStatus(shipment.status)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

LiveShipmentFeed.displayName = "LiveShipmentFeed";
