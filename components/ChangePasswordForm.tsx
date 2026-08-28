'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/PasswordInput';

function passwordIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pw)) issues.push('One uppercase letter');
  if (!/[0-9]/.test(pw)) issues.push('One number');
  return issues;
}

// Supabase's client SDK updates the password against the current session
// directly — there's no separate "confirm current password" step exposed
// by auth.updateUser(), so this relies on the person already being
// authenticated (same trust boundary as every other page behind
// getCurrentAppUserServer's redirect-to-/login guard).
export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function submit() {
    setError(null);
    setSuccess(false);
    const issues = passwordIssues(password);
    if (issues.length) return setError(`Password needs: ${issues.join(', ')}.`);
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="space-y-3">
      <PasswordInput value={password} onChange={setPassword} placeholder="New password" autoComplete="new-password" />
      <PasswordInput
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Confirm new password"
        autoComplete="new-password"
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button onClick={submit} disabled={loading} className="btn btn-primary">
        {loading ? 'Saving…' : 'Update password'}
      </button>
      {success && <p className="text-success text-xs font-semibold">Password updated.</p>}
      {error && <p className="text-danger text-xs font-semibold">{error}</p>}
    </div>
  );
}
