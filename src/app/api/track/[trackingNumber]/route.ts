import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params
  const url = new URL(`/api/tracking/${encodeURIComponent(trackingNumber)}`, request.url)
  return NextResponse.redirect(url, 307)
}
