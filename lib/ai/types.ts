// Shared AI service contracts — common shape across all engines: every
// one returns a primary result + confidence_score + model_version, and
// every call is logged.

export interface MatchCandidateInput {
  helperId: string;
  lat: number;
  lng: number;
  rating: number;
  trustScore: number;
  yearsExperience: number;
  isAvailable: boolean;
}

export interface MatchScoreBreakdown {
  distance: number;
  rating: number;
  trustScore: number;
  availability: number;
  experience: number;
}

export interface MatchResult {
  helperId: string;
  matchScore: number; // 0-1
  breakdown: MatchScoreBreakdown;
  distanceKm: number;
}

export interface MatchingResponse {
  ranked: MatchResult[];
  modelVersion: string;
  confidenceScore: number;
  fallbackUsed: boolean;
}

export interface PricingInput {
  serviceId: string;
  basePriceMin: number;
  basePriceMax: number;
  distanceKm: number;
  durationMinutes: number;
  urgency: 'standard' | 'urgent';
  demandIndex?: number; // 0-1, from forecast engine; optional
}

export interface PricingResponse {
  priceMin: number;
  priceRecommended: number;
  priceMax: number;
  confidenceScore: number;
  modelVersion: string;
  fallbackUsed: boolean;
  explanation: string;
}
