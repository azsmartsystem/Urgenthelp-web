import { describe, it, expect } from 'vitest';
import { canTransition, allowedNextStates } from '@/lib/booking/state-machine';

// Spec §8 / §26: "Booking state machine transitions" is explicitly called
// out as non-negotiable coverage.

describe('Booking state machine (spec §8)', () => {
  it('allows the full documented happy path', () => {
    expect(canTransition('requested', 'matched')).toBe(true);
    expect(canTransition('matched', 'accepted')).toBe(true);
    expect(canTransition('accepted', 'en_route')).toBe(true);
    expect(canTransition('en_route', 'in_progress')).toBe(true);
    expect(canTransition('in_progress', 'completed')).toBe(true);
  });

  it('never allows skipping a state (e.g. requested straight to completed)', () => {
    expect(canTransition('requested', 'completed')).toBe(false);
    expect(canTransition('requested', 'accepted')).toBe(false);
    expect(canTransition('matched', 'in_progress')).toBe(false);
  });

  it('never allows a completed booking to be cancelled', () => {
    expect(canTransition('completed', 'cancelled')).toBe(false);
  });

  it('allows cancellation from every pre-completion state', () => {
    expect(canTransition('requested', 'cancelled')).toBe(true);
    expect(canTransition('matched', 'cancelled')).toBe(true);
    expect(canTransition('accepted', 'cancelled')).toBe(true);
    expect(canTransition('en_route', 'cancelled')).toBe(true);
  });

  it('allows disputes to be raised from accepted onward, not before matching', () => {
    expect(canTransition('accepted', 'disputed')).toBe(true);
    expect(canTransition('in_progress', 'disputed')).toBe(true);
    expect(canTransition('completed', 'disputed')).toBe(true);
    expect(canTransition('requested', 'disputed')).toBe(false);
    expect(canTransition('matched', 'disputed')).toBe(false);
  });

  it('treats cancelled as a true terminal state', () => {
    expect(allowedNextStates('cancelled')).toEqual([]);
  });

  it('never allows a reverse transition', () => {
    expect(canTransition('in_progress', 'accepted')).toBe(false);
    expect(canTransition('completed', 'in_progress')).toBe(false);
  });
});
