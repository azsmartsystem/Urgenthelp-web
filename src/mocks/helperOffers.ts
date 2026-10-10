import type { MatchCandidate } from '@/types';

export const HELPER_OFFERS: MatchCandidate[] = [
  {
    helper_id: 'adaeze-okafor',
    display_name: 'Adaeze Okafor',
    avatar_url: '/figma/helper-adaeze-square.png',
    match_score: 1,
    distance_km: 1.2,
    eta_minutes: 25,
    rating: 4.9,
    years_experience: 4,
    jobs_completed: 212,
    price_quote: 21500,
    verified: true,
  },
  {
    helper_id: 'kemi-balogun',
    display_name: 'Kemi Balogun',
    avatar_url: '/figma/helper-kemi.png',
    match_score: 0.9,
    distance_km: 3.4,
    eta_minutes: 50,
    rating: 4.7,
    years_experience: 3,
    jobs_completed: 88,
    price_quote: 19000,
    verified: true,
  },
  {
    helper_id: 'ifeanyi-musa',
    display_name: 'Ifeanyi Musa',
    avatar_url: '/figma/helper-ifeanyi.png',
    match_score: 0.85,
    distance_km: 2.1,
    eta_minutes: 30,
    rating: 4.8,
    years_experience: 5,
    jobs_completed: 140,
    price_quote: 26000,
    verified: true,
  },
];

export function findHelper(id: string) {
  return HELPER_OFFERS.find((h) => h.helper_id === id) ?? null;
}
