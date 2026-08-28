'use client';

// The signature Customer <-> Helper mode switch, unchanged in behavior
// from the approved design's "Get Help / Give Help" capsule, now labeled
// for Urgent Help. Calls POST /api/users/me/mode and routes the user into
// the right dashboard (or into helper onboarding if they don't have a
// helper profile yet).

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function ModeSwitch({ initialMode }: { initialMode: 'customer' | 'helper' }) {
  const [mode, setMode] = useState(initialMode);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function switchTo(next: 'customer' | 'helper') {
    if (next === mode) return;
    const res = await fetch('/api/users/me/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: next }),
    });
    if (res.status === 409) {
      router.push('/helper/onboarding');
      return;
    }
    if (res.ok) {
      setMode(next);
      startTransition(() => {
        router.push(next === 'helper' ? '/helper' : '/dashboard');
        router.refresh();
      });
    }
  }

  return (
    <div className={`mode-switch ${mode === 'helper' ? 'bg-navy' : 'bg-navy'}`}>
      <div
        className="absolute top-1 left-1 h-[38px] rounded-pill transition-transform duration-300 ease-out"
        style={{
          width: 'calc(50% - 4px)',
          transform: mode === 'helper' ? 'translateX(100%)' : 'translateX(0)',
          background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
          boxShadow: '0 6px 16px -4px rgba(6,182,212,.6)',
        }}
      />
      <button
        onClick={() => switchTo('customer')}
        disabled={isPending}
        className={`flex-1 z-10 h-full text-[12.5px] font-extrabold rounded-pill transition-colors ${
          mode === 'customer' ? 'text-white' : 'text-[#B9C4DE]'
        }`}
      >
        Get Help
      </button>
      <button
        onClick={() => switchTo('helper')}
        disabled={isPending}
        className={`flex-1 z-10 h-full text-[12.5px] font-extrabold rounded-pill transition-colors ${
          mode === 'helper' ? 'text-white' : 'text-[#B9C4DE]'
        }`}
      >
        Give Help
      </button>
    </div>
  );
}
