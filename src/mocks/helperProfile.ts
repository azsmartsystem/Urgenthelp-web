import type { HelperProfile } from '@/types';

export const HELPER_PROFILES: HelperProfile[] = [
  {
    helper_id: 'adaeze-okafor',
    display_name: 'Adaeze Okafor',
    avatar_url: '/figma/helper-adaeze-portrait.png',
    match_score: 1,
    distance_km: 1.2,
    eta_minutes: 25,
    rating: 4.9,
    years_experience: 4,
    jobs_completed: 212,
    price_quote: 21500,
    verified: true,
    bio: 'Cleaner in Lekki · on Urgent Help since 2024',
    onTimePercent: 98,
    verificationChecks: ['Government ID (NIN)', 'Face match with ID', 'Home address', 'Guarantor'],
    reviews: [
      {
        author: 'Bisi · Lekki · 2 weeks ago',
        rating: 5,
        comment: "Came early and cleaned under every bed. My flat hasn't looked this good since we moved in.",
      },
      { author: 'Emeka · Ikate · 1 month ago', rating: 5, comment: 'Polite, fast and careful with our things.' },
    ],
  },
];

export function findHelperProfile(id: string) {
  return HELPER_PROFILES.find((h) => h.helper_id === id) ?? null;
}
