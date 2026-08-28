import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { NavBar } from '@/components/NavBar';

const FAQS = [
  {
    q: 'How does AI matching work?',
    a: 'When you request a service, Urgent Help ranks verified helpers nearby by distance, rating, availability and trust score, then shows you a fair AI-estimated price range before you confirm.',
  },
  {
    q: 'When am I charged?',
    a: 'Payment is collected when you confirm a booking, but held in escrow — the helper is only paid out once the job is marked complete.',
  },
  {
    q: 'What if something goes wrong during a job?',
    a: 'Open the booking from My Bookings and use Report an issue. Our Trust & Safety team reviews every dispute.',
  },
  {
    q: 'How do I become a verified helper?',
    a: 'Switch to Give Help from the menu, complete your profile, and upload a government-issued ID — verification completes automatically once it\'s received.',
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel sticky top-0 z-30">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <NavBar />
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-extrabold text-ink mb-1">Help & Support</h1>
        <p className="text-sm text-ink-faint mb-6">Common questions, and how to reach us for anything else.</p>

        <div className="space-y-3 mb-8">
          {FAQS.map((f, i) => (
            <div key={i} className="card p-4">
              <div className="font-bold text-ink text-sm">{f.q}</div>
              <p className="text-sm text-ink-soft mt-1.5">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-3">Still need help?</h2>
          <p className="text-sm text-ink-soft mb-4">
            If your question is about a specific booking, open it from My Bookings and use Report an issue — that
            routes straight to our support queue with the booking context attached.
          </p>
          <a href="mailto:support@urgenthelp.ng" className="btn btn-primary inline-flex">
            Email support@urgenthelp.ng
          </a>
        </div>
      </div>
    </main>
  );
}
