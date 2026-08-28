// Admin session handling.
// Admins are intentionally NOT part of the customer/helper `users` +
// Supabase-auth system — they're a separate table
// (`admin_users`) with their own password + signed session cookie.
//
// Password hashing uses Node's built-in scrypt (no external dependency
// needed). Session token is a signed, expiring payload (HMAC-SHA256) so
// `middleware.ts` and every /admin/* server component can verify it
// without a database round-trip.

import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

interface AdminSessionPayload {
  adminId: string;
  role: string;
  exp: number; // unix ms
}

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  return s;
}

export function createAdminSessionToken(adminId: string, role: string): string {
  const payload: AdminSessionPayload = { adminId, role, exp: Date.now() + 1000 * 60 * 60 * 8 }; // 8h
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const expectedSig = createHmac('sha256', secret()).update(body).digest('base64url');
    if (expectedSig.length !== sig.length || !timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) return null;
    const payload: AdminSessionPayload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
