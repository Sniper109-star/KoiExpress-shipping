import "server-only"

export type TraccarDevice = { id: number; name: string; uniqueId?: string; status?: string; category?: string; phone?: string }
export type TraccarPosition = { id: number; deviceId: number; latitude: number; longitude: number; address?: string; speed?: number; course?: number; deviceTime?: string; serverTime?: string; attributes?: Record<string, unknown> }

function baseUrl() { return (process.env.API_2 ?? "").replace(/\/$/, "") }
async function traccarFetch<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path}`
  if (!baseUrl()) throw new Error("Traccar API is not configured")
  const response = await fetch(url, { headers: { Accept: "application/json", ...(process.env.API_KEY ? { Authorization: `Bearer ${process.env.API_KEY}` } : {}) }, cache: "no-store" })
  if (!response.ok) throw new Error(`Traccar request failed: ${response.status}`)
  return response.json() as Promise<T>
}
export function getTraccarDevices() { return traccarFetch<TraccarDevice[]>("/api/devices") }
export function getTraccarPositions() { return traccarFetch<TraccarPosition[]>("/api/positions") }
export async function getTraccarLiveData() { const [devices, positions] = await Promise.all([getTraccarDevices(), getTraccarPositions()]); const byDevice = new Map(positions.map((position) => [position.deviceId, position])); return devices.map((device) => ({ device, position: byDevice.get(device.id) ?? null })) }
