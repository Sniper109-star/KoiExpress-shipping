import { NextRequest, NextResponse } from "next/server";

const MAPTILER_HOST = "api.maptiler.com";

export async function GET(request: NextRequest) {
  const key = process.env.key;
  const target = request.nextUrl.searchParams.get("target");
  if (!key || !target) return NextResponse.json({ error: "MapTiler is not configured" }, { status: 400 });

  let url: URL;
  try { url = new URL(target); } catch { return NextResponse.json({ error: "Invalid MapTiler target" }, { status: 400 }); }
  if (url.protocol !== "https:" || url.hostname !== MAPTILER_HOST) return NextResponse.json({ error: "Unsupported MapTiler target" }, { status: 400 });
  url.searchParams.set("key", key);

  const upstream = await fetch(url, { next: { revalidate: 3600 } });
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
