import { NextResponse } from "next/server";

const MAPTILER_BASE = "https://api.maptiler.com";

function rewriteUrls(value: unknown): unknown {
  if (typeof value === "string" && value.startsWith(MAPTILER_BASE)) {
    const url = new URL(value);
    url.searchParams.delete("key");
    return `/api/maptiler/proxy?target=${encodeURIComponent(url.toString())}`;
  }
  if (Array.isArray(value)) return value.map(rewriteUrls);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewriteUrls(child)]));
  }
  return value;
}

export async function GET() {
  const key = process.env.APIKEY;
  if (!key) return NextResponse.json({ error: "MapTiler is not configured" }, { status: 503 });
  const upstream = await fetch(`${MAPTILER_BASE}/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`, { next: { revalidate: 3600 } });
  if (!upstream.ok) return NextResponse.json({ error: "MapTiler style unavailable" }, { status: upstream.status });
  const style = await upstream.json();
  return NextResponse.json(rewriteUrls(style), { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
