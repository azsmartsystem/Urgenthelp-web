import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword, createAdminSessionToken, verifyAdminSessionToken } from '@/lib/auth/admin';

// Spec §26: "Mode/role permission boundaries" non-negotiable coverage,
// applied to the admin auth domain (spec §3.5/§23) since admins sit
// outside the customer/helper mode system entirely.

describe('Admin password hashing', () => {
  it('verifies a correct password', () => {
    const stored = hashPassword('correct horse battery staple');
    expect(verifyPassword('correct horse battery staple', stored)).toBe(true);
  });

  it('rejects an incorrect password', () => {
    const stored = hashPassword('correct horse battery staple');
    expect(verifyPassword('wrong password', stored)).toBe(false);
  });

  it('produces a different hash each time (random salt)', () => {
    const a = hashPassword('same password');
    const b = hashPassword('same password');
    expect(a).not.toBe(b);
  });
});

describe('Admin session token', () => {
  beforeAll(() => {
    process.env.ADMIN_SESSION_SECRET = 'test-secret-do-not-use-in-production';
  });

  it('round-trips a valid token', () => {
    const token = createAdminSessionToken('admin-123', 'super_admin');
    const payload = verifyAdminSessionToken(token);
    expect(payload?.adminId).toBe('admin-123');
    expect(payload?.role).toBe('super_admin');
  });

  it('rejects a tampered token', () => {
    const token = createAdminSessionToken('admin-123', 'super_admin');
    const tampered = token.slice(0, -2) + 'xx';
    expect(verifyAdminSessionToken(tampered)).toBeNull();
  });

  it('rejects an empty/undefined token', () => {
    expect(verifyAdminSessionToken(undefined)).toBeNull();
  });

  it('rejects an expired token', () => {
    const realNow = Date.now;
    Date.now = () => realNow() - 1000 * 60 * 60 * 9; // 9h in the past
    const token = createAdminSessionToken('admin-123', 'super_admin');
    Date.now = realNow;
    expect(verifyAdminSessionToken(token)).toBeNull();
  });
});
