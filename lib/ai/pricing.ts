// AI Fair Price Prediction Engine — service abstraction.
// Same pattern as matching.ts: real endpoint if configured, otherwise the
// documented fallback (category base price range) per Technical
// Implementation Spec §9.2.

import type { PricingInput, PricingResponse } from './types';

async function callExternalPricingService(input: PricingInput): Promise<PricingResponse | null> {
  const endpoint = process.env.AI_PRICING_ENDPOINT;
  const apiKey = process.env.AI_SERVICE_API_KEY;
  if (!endpoint || !apiKey) return null;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, fallbackUsed: false };
  } catch {
    return null;
  }
}

export async function estimatePrice(input: PricingInput): Promise<PricingResponse> {
  const external = await callExternalPricingService(input);
  if (external) return external;

  // Deterministic fallback: base category range, nudged by distance/urgency/demand.
  const distanceFactor = 1 + Math.min(0.25, input.distanceKm * 0.01);
  const urgencyFactor = input.urgency === 'urgent' ? 1.15 : 1;
  const demandFactor = 1 + (input.demandIndex ?? 0.3) * 0.2;

  const factor = distanceFactor * urgencyFactor * demandFactor;
  const priceMin = Math.round(input.basePriceMin * factor);
  const priceMax = Math.round(input.basePriceMax * factor);
  const priceRecommended = Math.round((priceMin + priceMax) / 2);

  return {
    priceMin,
    priceRecommended,
    priceMax,
    confidenceScore: 0.55,
    modelVersion: 'fallback-rule-v1',
    fallbackUsed: true,
    explanation:
      'Estimated from the base category price range, adjusted for distance, urgency and current local demand.',
  };
}
