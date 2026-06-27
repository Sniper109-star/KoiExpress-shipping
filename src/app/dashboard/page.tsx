import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, TrendingUp, Clock, MapPin, Plus } from "lucide-react";

const stats = [
  { label: "Total Shipments", value: "1,248", icon: Package, color: "text-primary" },
  { label: "Active Drivers", value: "38", icon: TrendingUp, color: "text-success" },
  { label: "Revenue (Mo)", value: "$42.8K", icon: Clock, color: "text-secondary" },
  { label: "Delivered", value: "1,089", icon: MapPin, color: "text-success" },
];

const recentShipments = [
  { id: "KOI-1001", customer: "Acme Corp", origin: "New York", destination: "Boston", status: "In Transit", date: "2024-01-15" },
  { id: "KOI-1002", customer: "Globex Inc", origin: "Chicago", destination: "Detroit", status: "Delivered", date: "2024-01-14" },
  { id: "KOI-1003", customer: "Initech", origin: "Austin", destination: "San Antonio", status: "Pending", date: "2024-01-14" },
  { id: "KOI-1004", customer: "Umbrella Co", origin: "Seattle", destination: "Portland", status: "In Transit", date: "2024-01-13" },
  { id: "KOI-1005", customer: "Stark Ind", origin: "Los Angeles", destination: "San Francisco", status: "Delivered", date: "2024-01-12" },
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

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark">Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">Welcome back. Here is what is happening today.</p>
          </div>
          <Link href="/dashboard/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Shipment
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} variant="default" className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 ${stat.color}`}>
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card variant="default" className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark">Recent Shipments</h2>
            <Link href="/dashboard/shipments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Origin</TableHead>
                  <TableHead className="hidden md:table-cell">Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentShipments.map((shipment) => (
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
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
