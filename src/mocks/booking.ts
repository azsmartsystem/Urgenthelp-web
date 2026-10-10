import type { PriceEstimate } from '@/types';

export function estimatePrice(min: number, max: number): PriceEstimate {
  const recommended = Math.round((min + max) / 2 / 100) * 100;
  return {
    price_min: min,
    price_recommended: recommended,
    price_max: max,
    confidence_score: 0.87,
    factors: ['Service type & scope', 'Your location', 'Typical duration', 'Helper demand right now'],
  };
}

export function generateBookingId(): string {
  return `UH-${Math.floor(100000 + Math.random() * 900000)}`;
}
