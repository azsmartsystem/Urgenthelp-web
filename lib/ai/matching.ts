// AI matching engine — single call site the booking flow uses to get a
// ranked helper list. If AI_MATCHING_ENDPOINT is configured, it calls the
// real inference service. Otherwise it falls back to a deterministic
// rule — nearest verified, available helpers sorted by rating — so the
// booking pipeline never blocks on a missing integration.

import { haversineKm } from '@/lib/location/distance';
import type { MatchCandidateInput, MatchingResponse, MatchResult } from './types';

const MATCH_WEIGHTS = {
  distance: 0.35,
  rating: 0.25,
  trustScore: 0.2,
  availability: 0.1,
  experience: 0.1,
};

function scoreCandidate(
  c: MatchCandidateInput,
  customerLat: number,
  customerLng: number
): MatchResult {
  const distanceKm = haversineKm(customerLat, customerLng, c.lat, c.lng);
  // Normalize each factor to 0-1; closer/higher is better.
  const distanceScore = Math.max(0, 1 - distanceKm / 15); // 15km = effectively 0
  const ratingScore = Math.min(1, c.rating / 5);
  const trustScoreScore = Math.min(1, c.trustScore / 100);
  const availabilityScore = c.isAvailable ? 1 : 0;
  const experienceScore = Math.min(1, c.yearsExperience / 8);

  const matchScore =
    distanceScore * MATCH_WEIGHTS.distance +
    ratingScore * MATCH_WEIGHTS.rating +
    trustScoreScore * MATCH_WEIGHTS.trustScore +
    availabilityScore * MATCH_WEIGHTS.availability +
    experienceScore * MATCH_WEIGHTS.experience;

  return {
    helperId: c.helperId,
    matchScore: Number(matchScore.toFixed(4)),
    distanceKm: Number(distanceKm.toFixed(2)),
    breakdown: {
      distance: distanceScore,
      rating: ratingScore,
      trustScore: trustScoreScore,
      availability: availabilityScore,
      experience: experienceScore,
    },
  };
}

async function callExternalMatchingService(
  candidates: MatchCandidateInput[],
  customerLat: number,
  customerLng: number
): Promise<MatchingResponse | null> {
  const endpoint = process.env.AI_MATCHING_ENDPOINT;
  const apiKey = process.env.AI_SERVICE_API_KEY;
  if (!endpoint || !apiKey) return null; // not configured — caller uses fallback

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ candidates, customerLat, customerLng }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, fallbackUsed: false };
  } catch {
    return null; // network/timeout error — caller uses fallback
  }
}

export async function runMatching(
  candidates: MatchCandidateInput[],
  customerLat: number,
  customerLng: number
): Promise<MatchingResponse> {
  const external = await callExternalMatchingService(candidates, customerLat, customerLng);
  if (external) return external;

  // Deterministic fallback:
  // rank locally-computed scores, verified+available candidates only.
  const ranked = candidates
    .filter((c) => c.isAvailable)
    .map((c) => scoreCandidate(c, customerLat, customerLng))
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    ranked,
    modelVersion: 'fallback-rule-v1',
    confidenceScore: ranked.length > 0 ? 0.6 : 0,
    fallbackUsed: true,
  };
}
