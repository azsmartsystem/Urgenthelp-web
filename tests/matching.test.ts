import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runMatching } from '@/lib/ai/matching';
import type { MatchCandidateInput } from '@/lib/ai/types';

// Technical Implementation Spec §26: "Matching ranking stability" is
// explicitly called out as non-negotiable coverage. These tests exercise
// the deterministic fallback path (no AI_MATCHING_ENDPOINT configured),
// which is also the path every dev/CI environment runs without secrets.

describe('AI Matching Engine — fallback scoring (spec §9.2, §10)', () => {
  beforeEach(() => {
    delete process.env.AI_MATCHING_ENDPOINT;
    delete process.env.AI_SERVICE_API_KEY;
  });

  const customerLat = 6.4281;
  const customerLng = 3.4219; // Lekki, Lagos

  function candidate(overrides: Partial<MatchCandidateInput>): MatchCandidateInput {
    return {
      helperId: 'h1',
      lat: 6.43,
      lng: 3.43,
      rating: 4.5,
      trustScore: 80,
      yearsExperience: 3,
      isAvailable: true,
      ...overrides,
    };
  }

  it('ranks a closer helper above a farther one, all else equal', async () => {
    const near = candidate({ helperId: 'near', lat: 6.429, lng: 3.423 });
    const far = candidate({ helperId: 'far', lat: 6.6, lng: 3.6 });
    const result = await runMatching([near, far], customerLat, customerLng);

    expect(result.fallbackUsed).toBe(true);
    expect(result.ranked[0].helperId).toBe('near');
    expect(result.ranked[0].matchScore).toBeGreaterThan(result.ranked[1].matchScore);
  });

  it('excludes unavailable helpers entirely', async () => {
    const available = candidate({ helperId: 'available', isAvailable: true });
    const offline = candidate({ helperId: 'offline', isAvailable: false });
    const result = await runMatching([available, offline], customerLat, customerLng);

    expect(result.ranked.map((r) => r.helperId)).toEqual(['available']);
  });

  it('returns an empty ranked list (not an error) when no candidates are available', async () => {
    const result = await runMatching([], customerLat, customerLng);
    expect(result.ranked).toEqual([]);
    expect(result.confidenceScore).toBe(0);
  });

  it('produces a match score between 0 and 1 with a full breakdown', async () => {
    const result = await runMatching([candidate({})], customerLat, customerLng);
    const [top] = result.ranked;
    expect(top.matchScore).toBeGreaterThanOrEqual(0);
    expect(top.matchScore).toBeLessThanOrEqual(1);
    expect(top.breakdown).toHaveProperty('distance');
    expect(top.breakdown).toHaveProperty('rating');
    expect(top.breakdown).toHaveProperty('trustScore');
    expect(top.breakdown).toHaveProperty('availability');
    expect(top.breakdown).toHaveProperty('experience');
  });

  it('ranks a higher-trust helper above a lower-trust one at equal distance/rating', async () => {
    const trusted = candidate({ helperId: 'trusted', trustScore: 95 });
    const risky = candidate({ helperId: 'risky', trustScore: 40 });
    const result = await runMatching([trusted, risky], customerLat, customerLng);
    expect(result.ranked[0].helperId).toBe('trusted');
  });
});
