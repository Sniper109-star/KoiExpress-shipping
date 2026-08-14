import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.APIKEY;
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!key || !query) return NextResponse.json({ features: [] }, { status: 400 });
  const url = new URL(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`);
  url.searchParams.set("key", key);
  url.searchParams.set("limit", "5");
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) return NextResponse.json({ error: "Geocoding unavailable" }, { status: response.status });
  return NextResponse.json(await response.json(), { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } });
}
