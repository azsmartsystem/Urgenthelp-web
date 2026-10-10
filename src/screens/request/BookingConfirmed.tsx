import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Calendar, MapPin, Lock, Info, CalendarPlus, MessageCircle } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest } from '@/context/BookingRequestContext';

export function BookingConfirmed() {
  const navigate = useNavigate();
  const { selectedHelper, selectedDate, selectedTime } = useBookingRequest();
  const helperFirst = selectedHelper?.display_name.split(' ')[0] ?? 'Adaeze';

  return (
    <FlowScreenShell>
      <div className="px-5 md:px-8 pt-6 flex-1 flex flex-col">
        <div className="flex flex-col items-center text-center pt-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="w-[88px] h-[88px] rounded-full bg-brand flex items-center justify-center"
          >
            <Check className="w-11 h-11 text-white" />
          </motion.div>
          <h1 className="font-display font-semibold text-[40px] leading-[44px] tracking-[-0.0375em] text-ink mt-4">
            You're booked
          </h1>
          <p className="text-ink-soft text-base mt-2 max-w-xs">
            {helperFirst} will arrive on {selectedDate || 'Sat 4 Oct'} at {selectedTime || '9:00 AM'}. We'll remind you the evening before.
          </p>
        </div>

        <div className="bg-panel border border-line rounded-card-lg p-4 mt-6">
          <div className="flex items-center gap-3 py-3 border-b border-line">
            <span className="w-10 h-10 rounded-full bg-[#EDF2FC] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-brand" />
            </span>
            <div>
              <div className="font-semibold text-ink text-sm">{selectedDate || 'Sat 4 Oct'} · {selectedTime || '9:00 AM'}</div>
              <div className="text-ink-soft text-sm">About 4 hours</div>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3 border-b border-line">
            <span className="w-10 h-10 rounded-full bg-[#EDF2FC] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-brand" />
            </span>
            <div>
              <div className="font-semibold text-ink text-sm">12 Admiralty Way, Lekki Phase 1</div>
              <div className="text-ink-soft text-sm">Opposite Mega Chicken</div>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <span className="w-10 h-10 rounded-full bg-[#EDF2FC] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-brand" />
            </span>
            <div>
              <div className="font-semibold text-ink text-sm">₦22,300 paid and held</div>
              <div className="text-ink-soft text-sm">Released only when you confirm</div>
            </div>
          </div>
        </div>

        <div className="bg-panel-2 rounded-card-lg p-3.5 flex items-center gap-3 mt-4">
          <Info className="w-5 h-5 text-ink-soft shrink-0" />
          <p className="text-ink-soft text-sm">
            On the day, you'll get a 4-digit start code. Share it only when {helperFirst} is at your door.
          </p>
        </div>

        <div className="mt-auto pb-8 pt-8 flex flex-col gap-2.5">
          <button onClick={() => navigate('/request/tracking')} className="btn btn-primary w-full">
            Track this booking
          </button>
          <div className="flex gap-2.5">
            <button className="flex-1 h-11 rounded-full bg-panel-2 text-brand text-sm font-bold flex items-center justify-center gap-1.5">
              <CalendarPlus className="w-4 h-4" />
              Add to calendar
            </button>
            <button className="flex-1 h-11 rounded-full bg-panel-2 text-brand text-sm font-bold flex items-center justify-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          </div>
        </div>
      </div>
    </FlowScreenShell>
  );
}
