// Redis client. Uses the Upstash REST
// API (plain HTTPS, no persistent TCP connection) rather than a raw Redis
// driver — this is the correct choice for a serverless Next.js/Vercel
// deployment, where a long-lived socket-based Redis client doesn't
// survive between invocations. If UPSTASH_REDIS_REST_URL / TOKEN aren't
// configured, every call here safely no-ops (returns null) rather than
// throwing — callers (see lib/redis/location.ts) already treat "no data"
// as a normal, handled case, matching the same fallback-isolation
// pattern used for AI/payments.

const BASE_URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export function isRedisConfigured() {
  return Boolean(BASE_URL && TOKEN);
}

async function command(args: (string | number)[]): Promise<any> {
  if (!isRedisConfigured()) return null;
  try {
    const res = await fetch(`${BASE_URL}/${args.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch {
    return null; // network/timeout — treat as "Redis unavailable" upstream
  }
}

export const redis = {
  // GEOADD key lng lat member
  geoAdd: (key: string, lng: number, lat: number, member: string) =>
    command(['GEOADD', key, String(lng), String(lat), member]),
  // GEOPOS key member -> [[lng, lat]]
  geoPos: (key: string, member: string) => command(['GEOPOS', key, member]),
  set: (key: string, value: string, exSeconds?: number) =>
    exSeconds ? command(['SET', key, value, 'EX', exSeconds]) : command(['SET', key, value]),
  get: (key: string) => command(['GET', key]),
  del: (key: string) => command(['DEL', key]),
  expire: (key: string, seconds: number) => command(['EXPIRE', key, seconds]),
  incr: (key: string) => command(['INCR', key]),
};
