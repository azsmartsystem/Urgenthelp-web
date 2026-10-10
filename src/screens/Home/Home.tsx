import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Bell, Search, Calendar, ArrowRight, Sparkles, Shirt, Wrench, Zap, Fuel, MoreHorizontal } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { useAuthSetup } from '@/context/AuthSetupContext';

const SERVICES = [
  { icon: Sparkles, label: 'Cleaning', caption: 'From ₦12k', active: true },
  { icon: Shirt, label: 'Laundry', caption: 'From ₦4k', active: true },
  { icon: Wrench, label: 'Plumbing', caption: 'Quote first', active: true },
  { icon: Zap, label: 'Electrical', caption: 'Quote first', active: true },
  { icon: Fuel, label: 'Generator', caption: 'Quote first', active: true },
  { icon: MoreHorizontal, label: 'More', caption: 'Coming soon', active: false },
];

export function Home() {
  const { firstName } = useAuthSetup();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const visibleServices = SERVICES.filter((s) => s.label.toLowerCase().includes(query.trim().toLowerCase()));

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate('/request/job-details');
  }

  return (
    <AppShell>
      <div className="px-5 md:px-8 pt-4 pb-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <img src="/figma/user-tolu.png" alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-lg text-ink truncate">
              {greeting}, {firstName || 'Tolu'}
            </h1>
            <button className="flex items-center gap-1 text-ink-soft text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              Lekki Phase 1
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            aria-label="Notifications"
            className="w-11 h-11 rounded-full bg-panel border border-line flex items-center justify-center text-ink shrink-0"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={submitSearch}
          className="mt-6 flex items-center gap-3 bg-panel border border-line rounded-pill px-5 h-14 focus-within:border-brand focus-within:border-2"
        >
          <Search className="w-5 h-5 text-ink-faint shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need help with?"
            className="flex-1 min-w-0 bg-transparent outline-none text-ink placeholder:text-ink-faint text-base"
          />
        </form>

        <div className="mt-6 bg-brand rounded-card-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Your next booking</span>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-medium px-2 h-6 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Confirmed
            </span>
          </div>
          <h2 className="font-display font-semibold text-[22px] leading-[28px] tracking-[-0.0182em] text-white mt-3">
            Deep clean · 3-bedroom flat
          </h2>
          <div className="flex items-center gap-2 mt-3 text-white font-semibold text-base">
            <Calendar className="w-[18px] h-[18px]" />
            Sat 4 Oct · 9:00 AM
          </div>
          <div className="flex items-center gap-2.5 mt-4 bg-white/[0.14] rounded-pill p-2">
            <img src="/figma/helper-adaeze-square.png" alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">Adaeze Okafor</div>
              <div className="text-white/90 text-xs">Verified cleaner · 4.9</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-brand" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <h2 className="font-display font-semibold text-lg text-ink">Services</h2>
          <button className="text-brand font-semibold text-sm">See all</button>
        </div>
        {visibleServices.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-3">
            {visibleServices.map((s) =>
              s.active ? (
                <Link
                  key={s.label}
                  to="/request/job-details"
                  className="bg-panel rounded-card p-3.5 flex flex-col items-center gap-2.5 text-center w-full"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EDF2FC] text-brand">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-ink">{s.label}</div>
                    <div className="text-xs text-ink-faint mt-0.5">{s.caption}</div>
                  </div>
                </Link>
              ) : (
                <button
                  key={s.label}
                  disabled
                  className="bg-panel rounded-card p-3.5 flex flex-col items-center gap-2.5 text-center w-full cursor-default"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-panel-2 text-ink-soft">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-ink">{s.label}</div>
                    <div className="text-xs text-ink-faint mt-0.5">{s.caption}</div>
                  </div>
                </button>
              )
            )}
          </div>
        ) : (
          <p className="text-ink-soft text-sm mt-4">No services match "{query}".</p>
        )}

        <h2 className="font-display font-semibold text-lg text-ink mt-8">Book again</h2>
        <div className="mt-3 bg-panel border border-line rounded-card-lg p-4 flex items-center gap-3 max-w-md">
          <img src="/figma/helper-kemi.png" alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink text-base truncate">Kemi Balogun</div>
            <div className="text-ink-soft text-sm">Laundry · last booked 12 Sep</div>
          </div>
          <button className="h-11 px-[18px] rounded-full bg-panel-2 text-ink text-sm font-bold shrink-0">Book</button>
        </div>
      </div>
    </AppShell>
  );
}
