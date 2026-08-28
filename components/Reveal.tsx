'use client';
import { useEffect, useRef, useState } from 'react';

// Fades + slides an element up the first time it scrolls into view, then
// leaves it alone (no re-triggering on scroll back up/down — that reads as
// flickery rather than lively). Client-only by necessity (IntersectionObserver
// needs the DOM), but every section using this still renders its real content
// server-side first — this only adds the animation class, never gates content
// on JS loading.
export function Reveal({ children, delayMs = 0, className = '' }: { children: React.ReactNode; delayMs?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${delayMs}ms, transform 0.6s ease-out ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
