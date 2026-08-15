import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const documentTypes = ['shipping_label', 'packing_slip', 'commercial_invoice', 'shipment_receipt', 'bill_of_lading'] as const
const schema = z.object({ type: z.enum(documentTypes) })

function escapePdfText(value: string) { return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)').replaceAll(/[^\x20-\x7E]/g, '?') }
function pdf(title: string, lines: string[]) {
  const content = [`BT`, `/F1 20 Tf`, `50 760 Td`, `(${escapePdfText(title)}) Tj`, `/F1 11 Tf`, ...lines.flatMap((line) => [`0 -24 Td`, `(${escapePdfText(line)}) Tj`]), `ET`].join('\n')
  const objects = [`<< /Type /Catalog /Pages 2 0 R >>`, `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`]
  let output = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(output.length); output += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = output.length
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new TextEncoder().encode(output)
}

export async function GET(request: Request, { params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = await params
  const type = new URL(request.url).searchParams.get('type')
  const parsed = schema.safeParse({ type })
  if (!parsed.success) return NextResponse.json({ error: 'Invalid document type.' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const { data: shipment } = await supabase.from('shipments').select('*, sender:addresses!sender_address_id(*), recipient:addresses!recipient_address_id(*), shipment_items(*), packages(*)').eq('id', shipmentId).eq('created_by', user.id).single()
  if (!shipment) return NextResponse.json({ error: 'Shipment not found.' }, { status: 404 })
  const title = parsed.data.type.replaceAll('_', ' ').toUpperCase()
  const lines = [`Reference: ${shipment.reference_number}`, `Tracking: ${shipment.tracking_number ?? 'Pending'}`, `Carrier: ${shipment.carrier_name ?? 'Unassigned'}`, `Service: ${shipment.service_name ?? 'Unassigned'}`, `Status: ${shipment.status}`, `Sender: ${shipment.sender?.name ?? ''}, ${shipment.sender?.line1 ?? ''}, ${shipment.sender?.city ?? ''}`, `Recipient: ${shipment.recipient?.name ?? ''}, ${shipment.recipient?.line1 ?? ''}, ${shipment.recipient?.city ?? ''}`, `Items: ${(shipment.shipment_items ?? []).map((item: { name: string; quantity: number }) => `${item.name} x${item.quantity}`).join(', ') || 'No items listed'}`, `Generated: ${new Date().toISOString()}`]
  const body = pdf(title, lines)
  const printMode = new URL(request.url).searchParams.get('print') === '1'
  await supabase.from('shipment_documents').upsert({ business_id: shipment.business_id, shipment_id: shipment.id, type: parsed.data.type, file_name: `${shipment.reference_number}-${parsed.data.type}.pdf`, mime_type: 'application/pdf', metadata: { generated: true } }, { onConflict: 'shipment_id,package_id,type' })
  return new Response(body, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `${printMode ? 'inline' : 'attachment'}; filename="${shipment.reference_number}-${parsed.data.type}.pdf"`, 'Cache-Control': 'no-store' } })
}
