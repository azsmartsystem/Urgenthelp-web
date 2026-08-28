'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/helpers', label: 'Helpers' },
  { href: '/admin/verification', label: 'Verification' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/disputes', label: 'Disputes' },
  { href: '/admin/trust-safety', label: 'Trust & Safety' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
];

export function AdminNav({ adminEmail, role }: { adminEmail: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <nav className="flex md:flex-col md:h-full items-center md:items-stretch gap-1 overflow-x-auto md:overflow-visible">
      <div className="flex md:block gap-1 md:flex-1 shrink-0">
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap block px-3.5 py-2.5 rounded-lg text-sm font-semibold mb-0.5 transition-colors ${
                active ? 'bg-panel/10 text-white' : 'text-[#B9C4DE] hover:bg-panel/5'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="shrink-0 md:border-t md:border-white/10 md:pt-4 md:mt-4">
        <div className="hidden md:block text-[11px] text-[#8EA0C7] px-3.5">{adminEmail}</div>
        <div className="hidden md:block text-[10px] text-[#5E729E] px-3.5 uppercase font-bold mt-0.5">{role.replace('_', ' ')}</div>
        <button
          onClick={logout}
          className="whitespace-nowrap md:w-full text-left px-3.5 py-2.5 md:py-2 md:mt-3 text-sm font-semibold text-[#B9C4DE] hover:bg-panel/5 rounded-lg"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
