import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminUser } from "@/lib/admin-auth"
import { createAdminDatabaseClient } from "@/lib/supabase/admin"

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.string().min(1).max(40).optional(),
  driver_name: z.string().max(120).nullable().optional(),
  vehicle: z.string().max(120).nullable().optional(),
  eta: z.string().datetime().nullable().optional(),
  last_update: z.string().max(500).nullable().optional(),
})

export async function PATCH(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid shipment update" }, { status: 400 })
  const { id, ...changes } = parsed.data
  const supabase = createAdminDatabaseClient()
  const { data, error } = await supabase.from("shipments").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: "Unable to update shipment" }, { status: 500 })
  return NextResponse.json({ shipment: data })
}
