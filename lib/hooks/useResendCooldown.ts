'use client';
import { useEffect, useRef, useState } from 'react';

// Shared cooldown behavior for any "resend the email" button — register's
// confirmation resend and forgot-password's reset-link resend both need
// this, and did neither have a cooldown before (register's had no limit
// at all; forgot-password had no resend button whatsoever).
export function useResendCooldown(seconds = 30) {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function start() {
    setRemaining(seconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  return { remaining, canSend: remaining === 0, start };
}
