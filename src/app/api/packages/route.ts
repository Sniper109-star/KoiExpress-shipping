import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { packages, trackingEvents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateTrackingNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackingNumber = searchParams.get("trackingNumber");

  if (trackingNumber) {
    const pkg = await db.select().from(packages).where(eq(packages.trackingNumber, trackingNumber)).limit(1);
    if (!pkg[0]) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    
    const events = await db.select().from(trackingEvents)
      .where(eq(trackingEvents.packageId, pkg[0].id))
      .orderBy(desc(trackingEvents.timestamp));
    
    return NextResponse.json({ ...pkg[0], events });
  }

  const allPackages = await db.select().from(packages);
  return NextResponse.json(allPackages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const trackingNumber = generateTrackingNumber();
  
  const result = await db.insert(packages).values({
    trackingNumber,
    senderName: body.senderName,
    senderEmail: body.senderEmail,
    senderPhone: body.senderPhone,
    senderAddress: body.senderAddress,
    recipientName: body.recipientName,
    recipientEmail: body.recipientEmail,
    recipientPhone: body.recipientPhone,
    recipientAddress: body.recipientAddress,
    weight: parseFloat(body.weight),
    dimensions: body.dimensions,
    description: body.description,
    price: 5.99 + (parseFloat(body.weight) * 2.5),
    status: "pending",
  }).returning();

  await db.insert(trackingEvents).values({
    packageId: result[0].id,
    status: "pending",
    location: body.senderAddress,
    description: "Package created and awaiting pickup",
  });

  return NextResponse.json(result[0]);
}