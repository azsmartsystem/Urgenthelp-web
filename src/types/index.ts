// Shared domain types for the dummy-data layer — shaped to match what the
// Figma screens show, not a database schema (there is no backend here).

export type BookingStatus =
  | 'requested'
  | 'matched'
  | 'accepted'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface AppUser {
  id: string;
  phone_number: string;
  display_name: string | null;
  address_label: string | null;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  iconKey: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Booking {
  id: string;
  category: string;
  serviceName: string;
  notes: string;
  scheduledFor: string;
  address: Address;
  status: BookingStatus;
  priceAgreed: number;
}

export interface MatchCandidate {
  helper_id: string;
  display_name: string;
  avatar_url: string;
  match_score: number; // 0-1
  distance_km: number;
  eta_minutes: number;
  rating: number;
  years_experience: number;
  jobs_completed: number;
  price_quote: number;
  verified: boolean;
}

export interface HelperProfile extends MatchCandidate {
  bio: string;
  onTimePercent: number;
  verificationChecks: string[];
  reviews: { author: string; rating: number; comment: string }[];
}

export interface PriceEstimate {
  price_min: number;
  price_recommended: number;
  price_max: number;
  confidence_score: number;
  factors: string[];
}
