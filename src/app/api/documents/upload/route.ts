import { put } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "A file is required" }, { status: 400 })
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "File must be 15 MB or smaller" }, { status: 413 })

  const shipmentId = String(formData.get("shipmentId") || "general")
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
  const blob = await put(`shipments/${shipmentId}/${crypto.randomUUID()}-${safeName}`, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: file.type || "application/octet-stream",
  })

  return NextResponse.json({ pathname: blob.pathname, fileName: file.name, contentType: file.type, size: file.size })
}
