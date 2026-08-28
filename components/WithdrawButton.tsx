'use client';
import { useState } from 'react';

export function WithdrawButton({ bankAccounts, maxAmount, feePercent }: { bankAccounts: any[]; maxAmount: number; feePercent: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requested = Number(amount) || 0;
  const fee = Math.round((requested * feePercent) / 100);
  const net = requested - fee;

  async function submit() {
    setLoading(true);
    setMessage(null);
    const res = await fetch('/api/wallet/me/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), bank_account_id: bankAccountId }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? data.message : data.error?.message ?? 'Withdrawal failed.');
    if (res.ok) setAmount('');
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn" style={{ background: '#fff', color: '#0F1F3D', padding: '10px 16px', fontSize: 12.5 }}>
        Withdraw funds
      </button>
    );
  }

  return (
    <div className="bg-panel rounded-xl p-4 text-ink">
      {bankAccounts.length === 0 ? (
        <p className="text-xs text-ink-soft">Add a bank account in Settings before withdrawing.</p>
      ) : (
        <div className="space-y-2">
          <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className="w-full bg-panel-2 text-ink border border-line rounded-lg px-3 py-2 text-xs">
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bank_name} — {b.account_name}
              </option>
            ))}
          </select>
          <input
            type="number"
            max={maxAmount}
            placeholder={`Up to ₦${maxAmount.toLocaleString()}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-panel-2 text-ink border border-line rounded-lg px-3 py-2 text-xs"
          />
          {requested > 0 && (
            <div className="text-[11px] text-ink-faint bg-panel-2 rounded-lg px-3 py-2 space-y-0.5">
              <div className="flex justify-between">
                <span>Service fee ({feePercent}%)</span>
                <span>-₦{fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-ink">
                <span>You&apos;ll receive</span>
                <span>₦{net.toLocaleString()}</span>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading || !amount} className="btn btn-primary btn-sm flex-1">
              {loading ? 'Requesting…' : 'Confirm'}
            </button>
            <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
      {message && <p className="text-[11px] text-ink-soft mt-2">{message}</p>}
    </div>
  );
}
