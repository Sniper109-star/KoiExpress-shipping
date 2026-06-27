"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Truck, Phone, MoreVertical } from "lucide-react";

const drivers = [
  { name: "Michael Chen", vehicle: "Van - Ford Transit", rating: 4.9, status: "Available" },
  { name: "Sarah Johnson", vehicle: "Truck - Isuzu NPR", rating: 4.7, status: "Busy" },
  { name: "David Park", vehicle: "Bike - Cargo", rating: 4.8, status: "Available" },
  { name: "Lisa Wang", vehicle: "Van - Mercedes Sprinter", rating: 4.9, status: "Available" },
  { name: "James Rodriguez", vehicle: "Truck - Freightliner", rating: 4.6, status: "Busy" },
];

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    Available: "bg-success/10 text-success",
    Busy: "bg-secondary/10 text-secondary",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function DriversPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark">Drivers</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage your delivery drivers and their availability.</p>
          </div>
          <Button>Add Driver</Button>
        </div>

        <Card variant="default" className="p-4 md:p-6">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {driver.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium">{driver.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {driver.vehicle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={driver.rating} />
                    </TableCell>
                    <TableCell>{getStatusBadge(driver.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
