// Payment provider abstraction.
// Supports Paystack and Flutterwave behind one interface so the booking
// flow never talks to a provider SDK directly. Secrets are read from
// server-only env vars — never bundled into client code.

import { createHmac, timingSafeEqual } from 'crypto';
export interface InitializePaymentInput {
  bookingId: string;
  amount: number; // in the smallest currency unit is provider-specific; we
  // normalize to major units (e.g. Naira) here and convert per-provider below.
  currency: string;
  customerEmail: string;
  reference: string; // our own idempotency reference
}

export interface InitializePaymentResult {
  checkoutUrl: string;
  providerReference: string;
}

async function initPaystack(input: InitializePaymentInput): Promise<InitializePaymentResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new PaymentProviderUnavailableError('paystack');
  }
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.customerEmail,
      amount: Math.round(input.amount * 100), // kobo
      reference: input.reference,
      currency: input.currency,
      metadata: { booking_id: input.bookingId },
    }),
  });
  if (!res.ok) throw new Error(`Paystack init failed: ${res.status}`);
  const data = await res.json();
  return { checkoutUrl: data.data.authorization_url, providerReference: data.data.reference };
}

async function initFlutterwave(input: InitializePaymentInput): Promise<InitializePaymentResult> {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    throw new PaymentProviderUnavailableError('flutterwave');
  }
  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref: input.reference,
      amount: input.amount,
      currency: input.currency,
      customer: { email: input.customerEmail },
      meta: { booking_id: input.bookingId },
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${input.bookingId}/payment-callback`,
    }),
  });
  if (!res.ok) throw new Error(`Flutterwave init failed: ${res.status}`);
  const data = await res.json();
  return { checkoutUrl: data.data.link, providerReference: input.reference };
}

export class PaymentProviderUnavailableError extends Error {
  constructor(public provider: string) {
    super(
      `${provider} credentials are not configured in this environment. ` +
        `Set ${provider.toUpperCase()}_SECRET_KEY to enable live payments.`
    );
    this.name = 'PaymentProviderUnavailableError';
  }
}

export async function initializePayment(
  provider: 'paystack' | 'flutterwave',
  input: InitializePaymentInput
): Promise<InitializePaymentResult> {
  return provider === 'paystack' ? initPaystack(input) : initFlutterwave(input);
}

// Every webhook must be verified before any DB write.
export function verifyPaystackSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signatureHeader) return false;
  const hash = createHmac('sha512', secret).update(rawBody).digest('hex');
  const hashBuf = Buffer.from(hash);
  const sigBuf = Buffer.from(signatureHeader);
  // timingSafeEqual throws on a length mismatch instead of returning false —
  // a malformed/garbage signature header (any public webhook endpoint will
  // see these, whether from misconfiguration or a probing attacker) would
  // otherwise crash this route with an unhandled 500 instead of a clean 401.
  if (hashBuf.length !== sigBuf.length) return false;
  return timingSafeEqual(hashBuf, sigBuf);
}

export function verifyFlutterwaveSignature(signatureHeader: string | null): boolean {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  if (!secretHash || !signatureHeader) return false;
  return signatureHeader === secretHash;
}
