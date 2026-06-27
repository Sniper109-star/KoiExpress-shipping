import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { packages, drivers, trackingEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allPackages = await db.select().from(packages);
  const allDrivers = await db.select().from(drivers);
  
  const stats = {
    totalPackages: allPackages.length,
    pendingPackages: allPackages.filter(p => p.status === "pending").length,
    inTransitPackages: allPackages.filter(p => p.status === "in_transit").length,
    deliveredPackages: allPackages.filter(p => p.status === "delivered").length,
    availableDrivers: allDrivers.filter(d => d.isAvailable).length,
    totalDrivers: allDrivers.length,
  };
  
  return NextResponse.json({ packages: allPackages, drivers: allDrivers, stats });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { packageId, status, driverId } = body;
  
  await db.update(packages).set({ status }).where(eq(packages.id, packageId));
  
  if (driverId) {
    await db.update(packages).set({ driverId }).where(eq(packages.id, packageId));
    await db.update(drivers).set({ isAvailable: false }).where(eq(drivers.id, driverId));
  }
  
  await db.insert(trackingEvents).values({
    packageId,
    status,
    location: body.location,
    description: body.description || `Status updated to ${status}`,
  });
  
  return NextResponse.json({ success: true });
}