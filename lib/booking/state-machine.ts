// Booking state machine — pure reference implementation of Technical
// Implementation Spec §8. The individual booking API routes
// (app/api/bookings/[id]/{accept,start,complete,cancel}/route.ts) already
// enforce their specific transition inline; this module exists as the
// single source of truth for "is X -> Y ever a legal transition" so it
// can be unit-tested in isolation and reused by future routes/admin tools
// without duplicating the transition table by hand.

export type BookingStatus =
  | 'requested'
  | 'matched'
  | 'accepted'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ['matched', 'cancelled'],
  matched: ['accepted', 'cancelled'],
  // 'in_progress' is reachable directly from 'accepted', not just via
  // 'en_route' — a helper can tap "I've arrived — start job" without
  // first tapping "I'm on my way" (see components/BookingActions.tsx).
  // This was missing here even though app/api/bookings/[id]/start/
  // route.ts already correctly allowed it — the "single source of
  // truth" wasn't actually the source of truth for this transition.
  accepted: ['en_route', 'in_progress', 'cancelled', 'disputed'],
  en_route: ['in_progress', 'cancelled', 'disputed'],
  in_progress: ['completed', 'disputed'],
  completed: ['disputed'],
  cancelled: [],
  // A disputed booking can still be cancelled (app/api/bookings/[id]/
  // cancel/route.ts allows it) — disputes resolve through the separate
  // `disputes` table/status, not through the booking's own status.
  disputed: ['cancelled'],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function allowedNextStates(from: BookingStatus): BookingStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}
