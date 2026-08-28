// Shared domain types — mirrors Technical Implementation Specification §4/§5

export type BookingStatus =
  | "requested"
  | "matched"
  | "accepted"
  | "en_route"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type UserMode = "customer" | "helper";

export interface AppUser {
  id: string;
  phone_number: string;
  email: string | null;
  active_mode: UserMode;
  status: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  trust_score_cached: number;
}

export interface HelperProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  availability_status: "online" | "offline";
  service_radius_km: number;
  trust_score_cached: number;
  completion_rate_cached: number;
  avg_response_seconds_cached: number | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon_key: string | null;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  base_price_min: number;
  base_price_max: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  line1: string;
  city: string | null;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface Booking {
  id: string;
  customer_id: string;
  helper_id: string | null;
  service_id: string;
  address_id: string;
  status: BookingStatus;
  urgency: "standard" | "urgent";
  notes: string | null;
  price_min: number | null;
  price_recommended: number | null;
  price_max: number | null;
  price_confidence: number | null;
  final_price: number | null;
  created_at: string;
}

export interface MatchCandidate {
  helper_id: string;
  display_name: string;
  avatar_url: string | null;
  rank: number;
  match_score: number; // 0-1
  score_breakdown: {
    distance: number;
    rating: number;
    trust_score: number;
    availability: number;
    experience: number;
  };
  distance_km: number;
  eta_minutes: number;
  rating: number;
  years_experience: number;
  verified: boolean;
}

export interface PriceEstimate {
  price_min: number;
  price_recommended: number;
  price_max: number;
  confidence_score: number;
  model_version: string;
  factors: string[];
  is_fallback: boolean;
}
