"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download } from "lucide-react";

const allShipments = [
  { id: "KOI-1001", customer: "Acme Corp", origin: "New York", destination: "Boston", status: "In Transit", date: "2024-01-15" },
  { id: "KOI-1002", customer: "Globex Inc", origin: "Chicago", destination: "Detroit", status: "Delivered", date: "2024-01-14" },
  { id: "KOI-1003", customer: "Initech", origin: "Austin", destination: "San Antonio", status: "Pending", date: "2024-01-14" },
  { id: "KOI-1004", customer: "Umbrella Co", origin: "Seattle", destination: "Portland", status: "In Transit", date: "2024-01-13" },
  { id: "KOI-1005", customer: "Stark Ind", origin: "Los Angeles", destination: "San Francisco", status: "Delivered", date: "2024-01-12" },
  { id: "KOI-1006", customer: "Wayne Ent", origin: "Gotham", destination: "Metropolis", status: "Pending", date: "2024-01-11" },
  { id: "KOI-1007", customer: "Cyberdyne", origin: "San Jose", destination: "Oakland", status: "Delivered", date: "2024-01-10" },
];

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    Delivered: "bg-success/10 text-success",
    "In Transit": "bg-primary/10 text-primary",
    Pending: "bg-secondary/10 text-secondary",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export default function ShipmentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = allShipments.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">Shipments</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage and track all your shipments.</p>
        </div>

        <Card variant="default" className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Origin</TableHead>
                  <TableHead className="hidden md:table-cell">Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.id}</TableCell>
                    <TableCell>{shipment.customer}</TableCell>
                    <TableCell className="hidden md:table-cell">{shipment.origin}</TableCell>
                    <TableCell className="hidden md:table-cell">{shipment.destination}</TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{shipment.date}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/tracking?id=${shipment.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No shipments found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
