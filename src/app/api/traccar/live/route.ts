import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getTraccarLiveData } from "@/lib/traccar"
import { db } from "@/lib/db"
import { traccarDevices, traccarPositions } from "@/lib/db/schema"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const live = await getTraccarLiveData()
    const tenantId = session.user.id
    for (const { device, position } of live) {
      await db.insert(traccarDevices).values({ tenantId, traccarDeviceId: device.id, name: device.name, uniqueId: device.uniqueId, status: device.status, category: device.category, phone: device.phone, lastLatitude: position?.latitude, lastLongitude: position?.longitude, lastAddress: position?.address, lastSpeed: position?.speed, lastCourse: position?.course, lastSeenAt: position?.serverTime ? new Date(position.serverTime) : undefined, updatedAt: new Date() }).onConflictDoNothing()
      if (position) await db.insert(traccarPositions).values({ tenantId, traccarDeviceId: device.id, traccarPositionId: position.id, latitude: position.latitude, longitude: position.longitude, address: position.address, speed: position.speed, course: position.course, deviceTime: position.deviceTime ? new Date(position.deviceTime) : undefined, serverTime: position.serverTime ? new Date(position.serverTime) : undefined, attributes: position.attributes }).onConflictDoNothing()
    }
    return NextResponse.json({ data: live, source: "traccar", updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Traccar unavailable" }, { status: 502 }) }
}
