import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.MAPTILER_API_KEY;
  const origin = request.nextUrl.searchParams.get("origin");
  const destination = request.nextUrl.searchParams.get("destination");
  if (!key || !origin || !destination) return NextResponse.json({ coordinates: [] }, { status: 400 });
  const url = new URL(`https://api.maptiler.com/directions/2.0/route`);
  url.searchParams.set("key", key);
  url.searchParams.set("points", `${origin};${destination}`);
  url.searchParams.set("type", "geojson");
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) return NextResponse.json({ error: "Directions unavailable" }, { status: response.status });
  const payload = await response.json();
  return NextResponse.json(payload, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
