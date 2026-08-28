import { describe, it, expect } from 'vitest';
import { haversineKm } from '@/lib/location/distance';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(6.4281, 3.4219, 6.4281, 3.4219)).toBeCloseTo(0, 5);
  });

  it('returns a positive distance for distinct points', () => {
    // Lekki Phase 1 -> Victoria Island, Lagos (~a few km apart)
    const d = haversineKm(6.4281, 3.4219, 6.4281, 3.42);
    expect(d).toBeGreaterThan(0);
  });

  it('is symmetric', () => {
    const a = haversineKm(6.4281, 3.4219, 6.6, 3.6);
    const b = haversineKm(6.6, 3.6, 6.4281, 3.4219);
    expect(a).toBeCloseTo(b, 8);
  });
});
