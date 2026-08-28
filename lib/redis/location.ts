// Live helper location.
// Ephemeral, high-frequency GPS pings live ONLY in Redis (GEO set with a
// short-lived companion TTL key), never written to Postgres directly —
// only the final "service_location" snapshot is persisted relationally,
// by the booking `start` transition. If Redis isn't configured, these
// functions return null/false and callers degrade gracefully (tracking
// UI shows "location unavailable" instead of crashing).

import { redis, isRedisConfigured } from './client';

const GEO_KEY = 'helper_locations';
const PING_TTL_SECONDS = 120; // no ping in ~2min => treated as offline

export async function pingHelperLocation(helperId: string, lat: number, lng: number) {
  if (!isRedisConfigured()) return { stored: false, reason: 'redis_not_configured' as const };
  await redis.geoAdd(GEO_KEY, lng, lat, helperId);
  await redis.set(`helper_ping:${helperId}`, JSON.stringify({ lat, lng, at: Date.now() }), PING_TTL_SECONDS);
  return { stored: true };
}

export async function getHelperLocation(helperId: string): Promise<{ lat: number; lng: number; at: number } | null> {
  if (!isRedisConfigured()) return null;
  const raw = await redis.get(`helper_ping:${helperId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
