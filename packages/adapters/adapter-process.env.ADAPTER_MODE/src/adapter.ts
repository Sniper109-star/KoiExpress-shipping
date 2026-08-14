import type { ShipmentInput, Rate, ShipmentRecord } from './types';

export class MockAdapter {
  async getRates(input: ShipmentInput): Promise<Rate[]> {
    const weightKg = input.parcels?.[0]?.weightKg ?? 1;
    const base = Math.max(500, Math.round(weightKg * 1000));
    return [
      { id: 'mock-std', carrier: 'MockCarrier', service: 'Standard', currency: 'USD', amountCents: base, estimatedDays: 5 },
      { id: 'mock-exp', carrier: 'MockCarrier', service: 'Express', currency: 'USD', amountCents: base + 800, estimatedDays: 2 },
    ];
  }

  async createShipment(input: ShipmentInput, opts?: { buyLabel?: boolean; rateId?: string }): Promise<ShipmentRecord> {
    const rates = await this.getRates(input);
    const id = `mock_sh_${Date.now()}`;
    const chosen = opts?.rateId ? rates.find((rate) => rate.id === opts.rateId) ?? rates[0] : rates[0];
    const record: ShipmentRecord = { id, rates };
    if (opts?.buyLabel) {
      record.labelUrl = `https://example.com/mock-labels/${id}.pdf`;
      record.trackingCode = `TRACK-${chosen.id}-${id}`;
    }
    return record;
  }

  async track(trackingCode: string) {
    return {
      tracking_code: trackingCode,
      status: 'in_transit',
      events: [
        { status: 'pre_transit', timestamp: new Date(Date.now() - 86400000).toISOString(), location: 'Origin' },
        { status: 'in_transit', timestamp: new Date().toISOString(), location: 'Hub' },
      ],
    };
  }
}

export default MockAdapter;
