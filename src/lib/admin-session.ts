const encoder = new TextEncoder()

function encode(value: string) {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function decode(value: string) {
  return atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4))
}

function encodeBytes(value: ArrayBuffer) {
  let binary = ''
  new Uint8Array(value).forEach((byte) => { binary += String.fromCharCode(byte) })
  return encode(binary)
}

function secret() {
  const value = process.env.BETTER_AUTH_SECRET
  if (!value) throw new Error("BETTER_AUTH_SECRET is required for admin sessions")
  return value
}

async function signature(payload: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const result = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return encodeBytes(result)
}

export async function createAdminSession(email: string) {
  const payload = `${email}|${Date.now() + 8 * 60 * 60 * 1000}`
  return `${encode(payload)}.${await signature(payload)}`
}

export async function verifyAdminSession(token: string | undefined) {
  if (!token) return null
  const [encoded, provided] = token.split('.')
  if (!encoded || !provided) return null
  const payload = decode(encoded)
  const [email, expires] = payload.split('|')
  if (!email || !expires || Number(expires) < Date.now()) return null
  const expected = await signature(payload)
  if (expected.length !== provided.length) return null
  let mismatch = 0
  for (let index = 0; index < expected.length; index += 1) mismatch |= expected.charCodeAt(index) ^ provided.charCodeAt(index)
  return mismatch === 0 && email === process.env.EMAIL_3?.trim() ? { email } : null
}
