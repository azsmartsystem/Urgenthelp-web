import { describe, it, expect, beforeEach } from 'vitest';
import { estimatePrice } from '@/lib/ai/pricing';
import type { PricingInput } from '@/lib/ai/types';

// Spec §26: "Pricing range sanity (never negative, never absurd multiples
// of base price)" is explicitly called out as non-negotiable coverage.

describe('AI Pricing Engine — fallback (spec §9.2, §11)', () => {
  beforeEach(() => {
    delete process.env.AI_PRICING_ENDPOINT;
    delete process.env.AI_SERVICE_API_KEY;
  });

  const base: PricingInput = {
    serviceId: 'svc_cleaning',
    basePriceMin: 6000,
    basePriceMax: 12000,
    distanceKm: 3,
    durationMinutes: 120,
    urgency: 'standard',
  };

  it('never returns a negative or zero price', async () => {
    const result = await estimatePrice(base);
    expect(result.priceMin).toBeGreaterThan(0);
    expect(result.priceRecommended).toBeGreaterThan(0);
    expect(result.priceMax).toBeGreaterThan(0);
  });

  it('keeps min <= recommended <= max', async () => {
    const result = await estimatePrice(base);
    expect(result.priceMin).toBeLessThanOrEqual(result.priceRecommended);
    expect(result.priceRecommended).toBeLessThanOrEqual(result.priceMax);
  });

  it('never exceeds ~1.5x the base category range (no absurd multiples)', async () => {
    const result = await estimatePrice({ ...base, distanceKm: 50, urgency: 'urgent', demandIndex: 1 });
    expect(result.priceMax).toBeLessThan(base.basePriceMax * 1.5);
  });

  it('charges more for urgent than standard, all else equal', async () => {
    const standard = await estimatePrice({ ...base, urgency: 'standard' });
    const urgent = await estimatePrice({ ...base, urgency: 'urgent' });
    expect(urgent.priceRecommended).toBeGreaterThan(standard.priceRecommended);
  });

  it('flags fallback usage and returns a plain-language explanation', async () => {
    const result = await estimatePrice(base);
    expect(result.fallbackUsed).toBe(true);
    expect(result.explanation.length).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(1);
  });
});
