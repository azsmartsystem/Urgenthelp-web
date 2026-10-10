import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Wallet, User } from 'lucide-react';
import { Logo } from '@/components/Logo';

const SIDEBAR_ITEMS = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '#', icon: Calendar, label: 'Bookings', disabled: true },
  { to: '#', icon: Wallet, label: 'Wallet', disabled: true },
  { to: '#', icon: User, label: 'Account', disabled: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-[230px] bg-panel border-r border-line p-5">
        <Logo className="mb-8" />
        <nav className="flex flex-col gap-1">
          {SIDEBAR_ITEMS.map((item) =>
            item.disabled ? (
              <span
                key={item.label}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-ink-faint cursor-default"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive ? 'bg-brand/10 text-brand' : 'text-ink-soft hover:bg-panel-2'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            )
          )}
        </nav>
      </aside>

      <main className="md:col-start-2 pb-28 md:pb-0">{children}</main>

      <nav className="fixed left-5 right-5 bottom-6 md:hidden h-16 bg-brand rounded-pill flex items-center justify-between px-2 shadow-lg2 z-40">
        {SIDEBAR_ITEMS.map((item) =>
          item.disabled ? (
            <span key={item.label} className="w-12 h-12 rounded-full flex items-center justify-center text-white/60">
              <item.icon className="w-[22px] h-[22px]" />
            </span>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `h-12 rounded-full flex items-center justify-center gap-2 transition ${
                  isActive ? 'px-4 bg-white text-brand' : 'w-12 text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-[22px] h-[22px]" />
                  {isActive && <span className="text-sm font-bold">{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
}
