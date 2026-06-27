"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { MapPin, Package } from "lucide-react";
import { MapLibreMap } from "@/components/map";

export default function CreateShipmentDashboardPage() {
  const origin: [number, number] = [-74.006, 40.7128];
  const destination: [number, number] = [-73.9352, 40.7306];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">Create Shipment</h1>
          <p className="text-muted-foreground text-sm md:text-base">Enter shipment details to create a new delivery.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="default" className="p-4 md:p-6">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="origin" placeholder="Pickup location" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="destination" placeholder="Delivery location" className="pl-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (cm)</Label>
                  <Input id="dimensions" placeholder="L x W x H" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same-day">Same-Day Delivery</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="freight">Freight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gap-2">
                <Package className="h-4 w-4" />
                Create Shipment
              </Button>
            </form>
          </Card>

          <Card variant="default" className="p-0 overflow-hidden">
            <MapLibreMap
              origin={origin}
              destination={destination}
              className="h-[300px] md:h-[400px] w-full"
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
