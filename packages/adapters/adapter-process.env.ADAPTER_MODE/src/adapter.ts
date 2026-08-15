import type { ShipmentInput, Rate, ShipmentRecord } from './types';

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character] ?? character));

function makeLabel(input: ShipmentInput, id: string, trackingCode: string) {
  const destination = `${input.to.name ?? ''} ${input.to.street1}, ${input.to.city}`.trim();
  const origin = `${input.from.name ?? ''} ${input.from.street1}, ${input.from.city}`.trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360"><rect width="720" height="360" fill="#ffffff"/><rect x="18" y="18" width="684" height="324" rx="10" fill="none" stroke="#162b4d" stroke-width="3"/><text x="42" y="62" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#162b4d">UNIFET LOGISTICS</text><text x="42" y="94" font-family="Arial,sans-serif" font-size="14" fill="#52637a">SHIPMENT LABEL · ${escapeXml(id)}</text><text x="42" y="144" font-family="Arial,sans-serif" font-size="13" fill="#52637a">FROM</text><text x="42" y="168" font-family="Arial,sans-serif" font-size="18" fill="#162b4d">${escapeXml(origin)}</text><text x="42" y="218" font-family="Arial,sans-serif" font-size="13" fill="#52637a">TO</text><text x="42" y="242" font-family="Arial,sans-serif" font-size="18" fill="#162b4d">${escapeXml(destination)}</text><text x="42" y="298" font-family="monospace" font-size="20" font-weight="700" letter-spacing="2" fill="#162b4d">${escapeXml(trackingCode)}</text><text x="560" y="298" font-family="Arial,sans-serif" font-size="13" fill="#52637a">UNIFET</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export class MockAdapter {
  async getRates(input: ShipmentInput): Promise<Rate[]> {
    const weightKg = input.parcels.reduce((total, parcel) => total + (parcel.weightKg ?? 0), 0) || 1;
    const distanceFactor = input.from.country === input.to.country ? 1 : 1.8;
    const base = Math.max(650, Math.round(weightKg * 850 * distanceFactor));
    return [
      { id: 'unifet-std', carrier: 'Unifet Network', carrierLogoUrl: '/brand/unifet-vehicle-mark.png', service: 'Standard Delivery', currency: 'USD', amountCents: base, estimatedDays: input.from.country === input.to.country ? 4 : 8 },
      { id: 'unifet-priority', carrier: 'Unifet Priority', carrierLogoUrl: '/brand/unifet-vehicle-mark.png', service: 'Priority Delivery', currency: 'USD', amountCents: base + 950, estimatedDays: input.from.country === input.to.country ? 2 : 4 },
      { id: 'unifet-express', carrier: 'Unifet Express', carrierLogoUrl: '/brand/unifet-vehicle-mark.png', service: 'Express Delivery', currency: 'USD', amountCents: base + 1850, estimatedDays: input.from.country === input.to.country ? 1 : 2 },
    ];
  }

  async createShipment(input: ShipmentInput, opts?: { buyLabel?: boolean; rateId?: string }): Promise<ShipmentRecord> {
    const rates = await this.getRates(input);
    const selected = opts?.rateId ? rates.find((rate) => rate.id === opts.rateId) ?? rates[0] : rates[0];
    const fingerprint = `${input.from.postalCode}-${input.to.postalCode}-${input.parcels.map((parcel) => parcel.weightKg ?? 0).join('-')}`;
    const id = `unifet_sh_${Array.from(fingerprint).reduce((hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0), 7).toString(36)}`;
    const trackingCode = `UF${id.replace('unifet_sh_', '').toUpperCase()}${selected.id.slice(-3).toUpperCase()}`;
    const record: ShipmentRecord = { id, rates, status: opts?.buyLabel ? 'label_created' : 'submitted' };
    if (opts?.buyLabel) {
      record.labelUrl = `/api/mock/labels/${id}`;
      record.labelDataUrl = makeLabel(input, id, trackingCode);
      record.trackingCode = trackingCode;
    }
    return record;
  }

  async track(trackingCode: string) {
    const seed = trackingCode.length % 4;
    const statuses = ['pre_transit', 'in_transit', 'out_for_delivery', 'delivered'];
    const current = statuses[Math.min(seed, statuses.length - 1)];
    const now = Date.now();
    return { tracking_code: trackingCode, status: current, events: statuses.slice(0, seed + 1).map((status, index) => ({ status, timestamp: new Date(now - (seed - index) * 86400000).toISOString(), location: ['Origin facility', 'Regional hub', 'Local depot', 'Destination'][index] })) };
  }
}

export default MockAdapter;
