"use client";

import { useEffect, useState } from "react";
import { Activity, MapPin, PackageCheck } from "lucide-react";
import { RefreshCw } from "lucide-react";

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
      try {
        const response = await fetch("/api/shipments/live?limit=8", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to sync shipments");
        const result = await response.json() as { shipments?: Shipment[] };
        if (mounted) {
          setShipments(result.shipments ?? []);
          setIsLive(true);
        }
      } catch {
        if (mounted) setIsLive(false);
      }
    };
    void load();
    const interval = window.setInterval(load, 15000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  return (
    <section aria-label="Live shipments" className="w-full max-w-sm overflow-hidden border border-primary/40 bg-card shadow-lg shadow-primary/10">
      <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
        <div className="flex items-center gap-2 font-semibold"><Activity className="size-4" /> Live shipments</div>
        <div className="flex items-center gap-2 text-xs font-medium"><span className={`size-2 rounded-full ${isLive ? "bg-primary-foreground" : "bg-primary-foreground/40"}`} />{isLive ? "Live · synced" : <><RefreshCw className="size-3 animate-spin" /> Syncing…</>}</div>
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
