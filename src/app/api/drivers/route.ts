import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drivers, packages, trackingEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allDrivers = await db.select().from(drivers);
  return NextResponse.json(allDrivers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (body.action === "assign") {
    const { packageId, driverId } = body;
    const pkg = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
    if (!pkg[0]) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    
    await db.update(packages)
      .set({ driverId, status: "pickup" })
      .where(eq(packages.id, packageId));
    
    await db.update(drivers)
      .set({ isAvailable: false })
      .where(eq(drivers.id, driverId));
    
    await db.insert(trackingEvents).values({
      packageId,
      status: "pickup",
      location: pkg[0].senderAddress,
      description: "Driver assigned for pickup",
    });
    
    return NextResponse.json({ success: true });
  }
  
  const result = await db.insert(drivers).values({
    name: body.name,
    email: body.email,
    phone: body.phone,
    vehicleType: body.vehicleType,
    licensePlate: body.licensePlate,
  }).returning();
  
  return NextResponse.json(result[0]);
}