import { describe, test, expect } from 'vitest';
import { MockAdapter } from '../src/adapter';
import type { ShipmentInput } from '../src/types';

const sample: ShipmentInput = {
  from: { street1: 'A', city: 'X', postalCode: '00001', country: 'US' },
  to: { street1: 'B', city: 'Y', postalCode: '00002', country: 'US' },
  parcels: [{ weightKg: 2 }],
};

describe('MockAdapter', () => {
  const adapter = new MockAdapter();

  test('getRates returns two rates', async () => {
    const rates = await adapter.getRates(sample);
    expect(rates.length).toBeGreaterThanOrEqual(2);
    expect(rates[0]).toHaveProperty('amountCents');
  });

  test('createShipment returns id and rates', async () => {
    const shipment = await adapter.createShipment(sample, { buyLabel: false });
    expect(shipment.id).toBeTruthy();
    expect(Array.isArray(shipment.rates)).toBe(true);
  });

  test('createShipment with buyLabel returns labelUrl and trackingCode', async () => {
    const shipment = await adapter.createShipment(sample, { buyLabel: true });
    expect(shipment.labelUrl).toContain('/api/mock/labels/');
    expect(shipment.labelDataUrl).toContain('data:image/svg+xml');
    expect(shipment.trackingCode).toContain('UF');
  });

  test('track returns events', async () => {
    const tracking = await adapter.track('UF123456789');
    expect(tracking).toHaveProperty('events');
    expect(tracking.events.length).toBeGreaterThan(0);
  });
});
