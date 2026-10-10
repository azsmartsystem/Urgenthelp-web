import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Home as HomeIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest } from '@/context/BookingRequestContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIMES = ['8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function formatDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function StepHeader() {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-5 md:px-8 pt-4 pb-1">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="w-11 h-11 rounded-full bg-panel border border-line flex items-center justify-center text-ink shrink-0"
      >
        ←
      </button>
      <div className="text-center">
        <div className="font-display font-semibold text-[18px] tracking-[-0.0111em] text-ink">Home cleaning</div>
        <div className="text-xs text-ink-soft font-medium">Step 2 of 3</div>
      </div>
      <span className="w-11 h-11 shrink-0" />
    </header>
  );
}

export function WhenAndWhere() {
  const navigate = useNavigate();
  const { when, selectedDate, selectedTime, repeatBooking, setSchedule } = useBookingRequest();
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const scrollRef = useRef<HTMLDivElement>(null);
  const isCurrentMonth = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();

  const days = useMemo(() => {
    const lastDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const firstDay = isCurrentMonth ? today.getDate() : 1;
    return Array.from({ length: lastDay - firstDay + 1 }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), firstDay + i));
  }, [viewMonth, isCurrentMonth, today]);

  function changeMonth(delta: number) {
    setViewMonth((m) => {
      const next = new Date(m.getFullYear(), m.getMonth() + delta, 1);
      const min = startOfMonth(today);
      return next < min ? min : next;
    });
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [viewMonth]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/request/fair-price');
  }

  return (
    <FlowScreenShell>
      <StepHeader />
      <form onSubmit={submit} className="px-5 md:px-8 pt-4 flex-1 flex flex-col">
        <div className="flex gap-1.5">
          <span className="flex-1 h-1 rounded-pill bg-brand" />
          <span className="flex-1 h-1 rounded-pill bg-brand" />
          <span className="flex-1 h-1 rounded-pill bg-line" />
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">When?</h2>
        <div className="flex p-1 bg-panel-2 rounded-pill mt-3">
          <button
            type="button"
            onClick={() => setSchedule({ when: 'asap' })}
            className={`flex-1 h-10 rounded-pill text-sm font-bold transition ${
              when === 'asap' ? 'bg-panel text-ink' : 'text-ink-soft'
            }`}
          >
            As soon as possible
          </button>
          <button
            type="button"
            onClick={() => setSchedule({ when: 'schedule' })}
            className={`flex-1 h-10 rounded-pill text-sm font-bold transition ${
              when === 'schedule' ? 'bg-panel text-ink' : 'text-ink-soft'
            }`}
          >
            Schedule
          </button>
        </div>

        {when === 'schedule' && (
          <>
            <div className="flex items-center justify-between mt-4">
              <span className="font-semibold text-ink text-sm">
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={isCurrentMonth}
                  aria-label="Previous month"
                  className="w-8 h-8 rounded-full bg-panel-2 flex items-center justify-center text-ink disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="w-8 h-8 rounded-full bg-panel-2 flex items-center justify-center text-ink"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-5 px-5 md:-mx-8 md:px-8 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {days.map((d) => {
                const label = formatDate(d);
                const active = selectedDate === label;
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setSchedule({ selectedDate: label })}
                    className={`h-[72px] w-16 shrink-0 snap-start rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition ${
                      active ? 'bg-brand border-brand text-white' : 'bg-panel border-line text-ink'
                    }`}
                  >
                    <span className={`text-xs font-medium ${active ? 'text-white' : 'text-ink-soft'}`}>{WEEKDAYS[d.getDay()]}</span>
                    <span className="font-display font-semibold text-lg">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {TIMES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSchedule({ selectedTime: t })}
                  className={`h-11 px-4 rounded-full text-sm font-bold border transition ${
                    selectedTime === t ? 'bg-brand border-brand text-white' : 'bg-panel border-line text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 text-ink-soft text-sm">
              <Clock className="w-4 h-4 shrink-0" />
              A deep clean like this takes about 4 hours.
            </div>
          </>
        )}

        <h2 className="font-display font-semibold text-lg text-ink mt-6">Where?</h2>
        <div className="bg-panel border border-line rounded-card p-4 flex items-center gap-3 mt-3">
          <div className="w-10 h-10 rounded-full bg-[#EDF2FC] flex items-center justify-center shrink-0">
            <HomeIcon className="w-5 h-5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink text-base">Home</div>
            <div className="text-ink-soft text-sm">12 Admiralty Way, Lekki Phase 1 · Opposite Mega Chicken</div>
          </div>
          <button type="button" className="text-brand font-semibold text-sm shrink-0">
            Change
          </button>
        </div>

        <div className="bg-panel border border-line rounded-card p-4 flex items-center gap-3 mt-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink text-base">Repeat this booking</div>
            <div className="text-ink-soft text-sm">Same helper, every 2 weeks</div>
          </div>
          <button
            type="button"
            onClick={() => setSchedule({ repeatBooking: !repeatBooking })}
            className={`w-[52px] h-8 rounded-full flex items-center px-[3px] shrink-0 transition ${
              repeatBooking ? 'bg-brand justify-end' : 'bg-line justify-start'
            }`}
          >
            <span className="w-[26px] h-[26px] rounded-full bg-white" />
          </button>
        </div>

        <div className="mt-auto pb-8 pt-8">
          <button type="submit" className="btn btn-primary w-full">
            See fair price
          </button>
        </div>
      </form>
    </FlowScreenShell>
  );
}
