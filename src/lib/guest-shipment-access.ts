import crypto from 'node:crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const ACCESS_TTL_SECONDS = 2 * 60 * 60

function secret() {
  return process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SECRET_KEY || 'unifet-development-guest-secret'
}

export function createGuestShipmentToken(shipmentId: string) {
  const payload = Buffer.from(JSON.stringify({ sub: shipmentId, exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS })).toString('base64url')
  const signature = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyGuestShipmentToken(token: string | null, shipmentId: string) {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub?: string; exp?: number }
    return parsed.sub === shipmentId && typeof parsed.exp === 'number' && parsed.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function guestAccessFrom(request: Request, shipmentId: string) {
  return verifyGuestShipmentToken(request.headers.get('x-shipment-access-token'), shipmentId)
}

export function createServiceRoleClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}
