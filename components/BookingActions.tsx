'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Status- and role-aware action buttons — this is the client-side half of
// the booking state machine. Which
// buttons render depends on {status, role}; each button calls the
// matching lifecycle API route.
export function BookingActions({
  bookingId,
  status,
  role,
  hasPayment,
}: {
  bookingId: string;
  status: string;
  role: 'customer' | 'helper';
  hasPayment: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<{
    basePrice: number;
    serviceFee: number;
    total: number;
    checkoutUrl: string;
  } | null>(null);
  const router = useRouter();

  async function call(path: string, body?: any) {
    setLoading(path);
    setError(null);
    const res = await fetch(`/api/bookings/${bookingId}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error?.message ?? 'Action failed.');
      return;
    }
    router.refresh();
  }

  async function pay() {
    setLoading('pay');
    setError(null);
    const res = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, provider: 'paystack' }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(
        data.error?.code === 'PAYMENT_PROVIDER_UNAVAILABLE'
          ? 'Payments are not yet configured in this environment (missing provider credentials).'
          : data.error?.message ?? 'Payment failed to initialize.'
      );
      return;
    }
    // Show the fee breakdown before redirecting — the checkout_url is
    // already fetched, so confirming below doesn't call initialize again
    // (which would create a second pending payment row for this booking).
    setPaymentPreview({ basePrice: data.base_price, serviceFee: data.service_fee, total: data.total_amount, checkoutUrl: data.checkout_url });
  }

  const buttons: { label: string; action: () => void; key: string; primary?: boolean; danger?: boolean }[] = [];

  if (role === 'helper' && status === 'matched') {
    buttons.push({ label: 'Accept job', action: () => call('/accept'), key: '/accept', primary: true });
  }
  if (role === 'customer' && status === 'accepted') {
    buttons.push({ label: 'Confirm helper', action: () => call('/confirm-helper'), key: '/confirm-helper', primary: true });
  }
  if (role === 'customer' && status === 'accepted' && !hasPayment) {
    buttons.push({ label: 'Pay now', action: pay, key: 'pay', primary: true });
  }
  if (role === 'helper' && status === 'accepted') {
    buttons.push({ label: "I'm on my way", action: () => call('/en-route'), key: '/en-route', primary: true });
  }
  if (role === 'helper' && ['accepted', 'en_route'].includes(status)) {
    buttons.push({ label: "I've arrived — start job", action: () => call('/start'), key: '/start', primary: status === 'en_route' });
  }
  if (role === 'helper' && status === 'in_progress') {
    buttons.push({ label: 'Mark job complete', action: () => call('/complete'), key: '/complete', primary: true });
  }
  if (['requested', 'matched', 'accepted'].includes(status)) {
    buttons.push({
      label: 'Cancel booking',
      action: () => call('/cancel', { reason: 'Cancelled from booking detail page' }),
      key: '/cancel',
      danger: true,
    });
  }

  if (buttons.length === 0) return null;

  return (
    <div className="space-y-2">
      {buttons.map((b) => (
        <button
          key={b.key}
          onClick={b.action}
          disabled={loading === b.key}
          className={`btn w-full ${b.primary ? 'btn-primary' : b.danger ? 'btn-ghost text-danger' : 'btn-ghost'}`}
        >
          {loading === b.key ? 'Working…' : b.label}
        </button>
      ))}
      {error && <p className="text-danger text-xs text-center">{error}</p>}
    </div>
  );
}
