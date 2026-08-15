import type { CarrierAdapter } from './carrier'
import { customMockCarrier } from './carriers/custom'

const adapters: Record<string, CarrierAdapter> = { [customMockCarrier.code]: customMockCarrier }

export function getCarrierAdapter(code = customMockCarrier.code): CarrierAdapter {
  const adapter = adapters[code]
  if (!adapter) throw new Error(`Unsupported carrier: ${code}`)
  return adapter
}

export function listCarrierAdapters() {
  return Object.values(adapters).map(({ code, name }) => ({ code, name, source: 'mock' as const }))
}
