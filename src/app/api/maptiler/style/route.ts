import { NextResponse } from "next/server";

const MAPTILER_BASE = "https://api.maptiler.com";

function rewriteUrls(value: unknown): unknown {
  if (typeof value === "string" && value.startsWith(MAPTILER_BASE)) {
    const url = new URL(value);
    url.searchParams.delete("key");
    const target = url.toString().replaceAll("%7B", "{").replaceAll("%7D", "}");
    return `/api/maptiler/proxy?target=${encodeURIComponent(target)}`;
  }
  if (Array.isArray(value)) return value.map(rewriteUrls);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewriteUrls(child)]));
  }
  return value;
}

export async function GET() {
  const key = process.env.MAPTILER_API_KEY;
  if (!key) return NextResponse.json({ error: "MapTiler is not configured" }, { status: 503 });
  const upstream = await fetch(`${MAPTILER_BASE}/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`, { next: { revalidate: 3600 } });
  if (!upstream.ok) return NextResponse.json({ error: "MapTiler style unavailable" }, { status: upstream.status });
  const style = await upstream.json();
  const rewrittenStyle = rewriteUrls(style) as Record<string, unknown>;
  const layers = Array.isArray(rewrittenStyle.layers) ? rewrittenStyle.layers : [];
  for (const layer of layers) {
    const paint = (layer as { paint?: Record<string, unknown> }).paint;
    if (!paint) continue;
    if (layer.type === "background") paint["background-color"] = "#071b2d";
    if (paint["fill-color"]) paint["fill-color"] = "#0d2a40";
    if (paint["line-color"]) paint["line-color"] = "#27465a";
    if (paint["text-color"]) paint["text-color"] = "#d9e7ef";
  }
  delete rewrittenStyle.sprite;
  delete rewrittenStyle.glyphs;
  return NextResponse.json(rewrittenStyle, { headers: { "Cache-Control": "no-store" } });
}
