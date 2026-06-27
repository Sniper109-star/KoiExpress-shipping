"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Truck, User, Clock } from "lucide-react";

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState("");

  const shipment = {
    id: trackingId || "KOI-1001",
    driver: "Michael Chen",
    vehicle: "Ford Transit Van",
    eta: "2:30 PM",
    status: "In Transit",
    origin: "New York",
    destination: "Boston",
    lastUpdate: "Departed warehouse - 11:45 AM",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">Live Tracking</h1>
          <p className="text-muted-foreground text-sm md:text-base">Monitor your shipments in real-time.</p>
        </div>

        <Card variant="default" className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter tracking number..."
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1"
            />
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Track
            </Button>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card variant="default" className="p-0 overflow-hidden">
              <div className="h-[300px] md:h-[400px] bg-gradient-to-br from-primary/5 via-accent to-secondary/5 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 text-primary mx-auto" />
                  <p className="text-lg font-semibold text-dark">Live Map View</p>
                  <p className="text-sm text-muted-foreground">Real-time driver location tracking</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card variant="default" className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">Driver Info</h3>
                  <p className="text-sm text-muted-foreground">{shipment.driver}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{shipment.driver}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>{shipment.vehicle}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>ETA: {shipment.eta}</span>
                </div>
              </div>
            </Card>

            <Card variant="accent" className="p-4 md:p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shipment ID</p>
                <p className="font-mono font-bold text-primary">{shipment.id}</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Origin</span>
                  <span className="font-medium">{shipment.origin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-medium">{shipment.destination}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {shipment.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Update</span>
                  <span className="font-medium">{shipment.lastUpdate}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
