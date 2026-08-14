import { NextResponse } from "next/server"

function escapeXml(value: string) { return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character] ?? character)) }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const safeId = escapeXml(id)
  const tracking = `UF${id.replace(/[^a-z0-9]/gi, "").slice(-10).toUpperCase()}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360"><rect width="100%" height="100%" fill="#fff"/><rect x="18" y="18" width="684" height="324" rx="10" fill="none" stroke="#162b4d" stroke-width="3"/><text x="42" y="62" font-family="Arial" font-size="24" font-weight="700" fill="#162b4d">UNIFET LOGISTICS</text><text x="42" y="96" font-family="Arial" font-size="14" fill="#52637a">SHIPMENT LABEL · ${safeId}</text><text x="42" y="160" font-family="Arial" font-size="14" fill="#52637a">TRACKING NUMBER</text><text x="42" y="198" font-family="monospace" font-size="28" font-weight="700" fill="#162b4d">${tracking}</text><text x="42" y="274" font-family="Arial" font-size="16" fill="#162b4d">Handle with care · Unifet delivery network</text></svg>`
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "private, max-age=300" } })
}
