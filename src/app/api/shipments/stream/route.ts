import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const encoder = new TextEncoder()

function encode(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Authentication required', { status: 401 })

  const { data: membership, error: membershipError } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (membershipError) return new Response('Unable to load account', { status: 500 })
  if (!membership?.business_id) return new Response('Business membership required', { status: 409 })

  const businessId = membership.business_id
  let closed = false
  let cursor = new Date(0)
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const close = () => {
        if (closed) return
        closed = true
        try { controller.close() } catch { /* stream already closed */ }
      }
      const abort = () => { closed = true }
      request.signal.addEventListener('abort', abort, { once: true })
      const send = (event: string, data: unknown) => {
        if (!closed) controller.enqueue(encode(event, data))
      }

      send('ready', { connectedAt: new Date().toISOString(), intervalMs: 3000, source: 'supabase' })
      try {
        while (!closed) {
          const { data: shipments, error } = await supabase
            .from('shipments')
            .select('id, reference_number, status, created_at, updated_at, tracking_number, sender:addresses!sender_address_id(city, state, country_code), recipient:addresses!recipient_address_id(city, state, country_code)')
            .eq('business_id', businessId)
            .order('updated_at', { ascending: false })
            .limit(100)

          if (error) throw error
          send('shipments', { shipments: shipments ?? [], source: 'supabase', emittedAt: new Date().toISOString() })

          const { data: events, error: eventsError } = await supabase
            .from('tracking_events')
            .select('*')
            .in('shipment_id', (shipments ?? []).map((shipment) => shipment.id))
            .gt('created_at', cursor.toISOString())
            .order('created_at', { ascending: true })
            .limit(100)

          if (eventsError) throw eventsError
          for (const event of events ?? []) send('shipment.updated', event)
          if (events?.length) cursor = new Date(events[events.length - 1].created_at)

          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 3000)
            request.signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
          })
        }
      } catch (error) {
        if (!closed) send('error', { message: 'Unable to load live shipment updates.' })
        console.error('[v0] shipment stream failed', error)
      } finally {
        request.signal.removeEventListener('abort', abort)
        close()
      }
    },
    cancel() { closed = true },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
