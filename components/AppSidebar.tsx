'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

interface Profile {
  displayName: string;
  mode: 'customer' | 'helper';
  trustScore: number | null;
}

// Primary navigation drawer for the app. Slide-in panel with overlay,
// containing account links plus the Get Help / Give Help mode switch.
export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!open || profile) return; // load once, lazily, only once the drawer's actually opened
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: appUser } = await supabase.from('users').select('id, active_mode').eq('auth_user_id', user.id).maybeSingle();
      if (!appUser) return;
      const table = appUser.active_mode === 'helper' ? 'helper_profiles' : 'customer_profiles';
      const { data: modeProfile } = await supabase.from(table).select('display_name, trust_score_cached').eq('user_id', appUser.id).maybeSingle();
      setProfile({
        displayName: modeProfile?.display_name ?? 'there',
        mode: appUser.active_mode,
        trustScore: (modeProfile as any)?.trust_score_cached ?? null,
      });
    })();
  }, [open, profile, supabase]);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      // Basic focus trap — Tab/Shift+Tab cycle within the drawer instead
      // of escaping into the page behind the overlay.
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Move focus into the drawer when it opens, and back to the hamburger
    // button when it closes — without this, a keyboard/screen-reader user
    // stays "behind" the overlay with no indication anything changed.
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    };
  }, [open]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    // Swipe left to close, mirroring the slide-in-from-left open animation.
    if (delta < -60) setOpen(false);
    touchStartX.current = null;
  }

  async function switchTo(next: 'customer' | 'helper') {
    if (switching) return;
    if (profile?.mode === next) {
      setOpen(false);
      router.push(next === 'helper' ? '/helper' : '/dashboard');
      return;
    }
    setSwitching(true);
    const res = await fetch('/api/users/me/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: next }),
    });
    setSwitching(false);
    setOpen(false);
    if (res.status === 409) {
      router.push('/helper/onboarding');
      return;
    }
    if (res.ok) {
      router.push(next === 'helper' ? '/helper' : '/dashboard');
      router.refresh();
    } else {
      // Not authenticated, or some other failure — send them through the
      // real auth flow rather than failing silently on a dead click.
      router.push(`/register?intent=${next}`);
    }
  }

  const items = [
    { href: profile?.mode === 'helper' ? '/helper' : '/dashboard', icon: '🏠', label: 'Home' },
    { href: '/dashboard/bookings', icon: '📋', label: 'My Bookings' },
    { href: '/wallet', icon: '💳', label: 'Wallet' },
    { href: '/messages', icon: '💬', label: 'Messages' },
    { href: '/notifications', icon: '🔔', label: 'Notifications' },
    { href: '/profile', icon: '👤', label: 'Profile & settings' },
    { href: '/support', icon: '❓', label: 'Help & Support' },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-panel-2"
      >
        <span className="text-lg leading-none" aria-hidden="true">☰</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="absolute left-0 top-0 bottom-0 w-[82%] max-w-[320px] bg-panel border-r border-line flex flex-col animate-[slide-in_0.25s_ease-out]"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-line">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-ink hover:bg-panel-2">
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-4 border-b border-line">
              <div className="w-11 h-11 rounded-full bg-panel-2 border border-line flex items-center justify-center text-lg font-extrabold text-ink-soft shrink-0">
                {profile?.displayName?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-ink text-sm truncate">{profile?.displayName ?? 'Loading…'}</div>
                {profile?.mode === 'helper' && profile.trustScore != null && (
                  <div className="text-xs text-ink-faint mt-0.5">Trust score {Math.round(profile.trustScore)}/100</div>
                )}
              </div>
            </Link>

            <nav className="flex-1 overflow-y-auto py-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-ink-soft hover:bg-panel-2 hover:text-ink"
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                  router.refresh();
                }}
                className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-danger hover:bg-panel-2 w-full text-left"
              >
                <span className="text-base w-5 text-center">🚪</span>
                Log out
              </button>
            </nav>

            <div className="p-4 border-t border-line space-y-2">
              <button
                onClick={() => switchTo('customer')}
                disabled={switching}
                className={`w-full py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition ${
                  profile?.mode === 'customer' ? 'bg-gradient-to-r from-brand to-ai text-white' : 'bg-panel-2 border border-line text-ink'
                }`}
              >
                🛍️ Get Help
              </button>
              <button
                onClick={() => switchTo('helper')}
                disabled={switching}
                className={`w-full py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition ${
                  profile?.mode === 'helper' ? 'bg-gradient-to-r from-brand to-ai text-white' : 'bg-panel-2 border border-line text-ink'
                }`}
              >
                ⚡ Give Help
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
