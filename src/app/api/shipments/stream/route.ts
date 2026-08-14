import { desc, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { shipments, shippingEvents, shippingShipments } from "@/lib/db/schema"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  const encoder = new TextEncoder()
  let cursor = new Date(0)
  let closed = false
  const signal = request.signal
  signal.addEventListener("abort", () => { closed = true })

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      send("ready", { connectedAt: new Date().toISOString(), intervalMs: 3000 })
      try {
        while (!closed) {
          const legacyQuery = userId ? db.select({ id: shipments.id, trackingNumber: shipments.trackingNumber, status: shipments.status, origin: shipments.origin, destination: shipments.destination, updatedAt: shipments.updatedAt }).from(shipments).where(eq(shipments.createdByUserId, userId)).orderBy(desc(shipments.updatedAt)).limit(100) : db.select({ id: shipments.id, trackingNumber: shipments.trackingNumber, status: shipments.status, origin: shipments.origin, destination: shipments.destination, updatedAt: shipments.updatedAt }).from(shipments).orderBy(desc(shipments.updatedAt)).limit(8)
          const engineQuery = userId ? db.select({ id: shippingShipments.id, publicId: shippingShipments.publicId, trackingNumber: shippingShipments.trackingNumber, status: shippingShipments.status, origin: shippingShipments.origin, destination: shippingShipments.destination, updatedAt: shippingShipments.updatedAt }).from(shippingShipments).where(eq(shippingShipments.userId, userId)).orderBy(desc(shippingShipments.updatedAt)).limit(100) : Promise.resolve([])
          const [legacy, engine] = await Promise.all([legacyQuery, engineQuery])
          const latest = [...legacy, ...engine].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          send("shipments", { shipments: latest, source: "neon-sse", emittedAt: new Date().toISOString() })
          const events = userId ? await db.select().from(shippingEvents).where(eq(shippingEvents.userId, userId)).orderBy(desc(shippingEvents.createdAt)).limit(50) : []
          const freshEvents = events.filter((event) => event.createdAt > cursor)
          if (freshEvents.length) {
            cursor = freshEvents[0].createdAt
            for (const event of freshEvents.reverse()) send("shipment.updated", event)
          }
          await new Promise<void>((resolve) => { const timer = setTimeout(resolve, 3000); signal.addEventListener("abort", () => { clearTimeout(timer); resolve() }, { once: true }) })
        }
      } finally { controller.close() }
    },
    cancel() { closed = true },
  })
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } })
}

