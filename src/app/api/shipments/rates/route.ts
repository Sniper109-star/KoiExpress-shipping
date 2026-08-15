import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const url = new URL("/api/shipping/rates", request.url)
  return NextResponse.redirect(url, 307)
}
