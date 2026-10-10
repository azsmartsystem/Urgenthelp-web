import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MatchCandidate } from '@/types';

export type CleanType = 'standard' | 'deep' | 'move';

interface BookingRequestState {
  cleanType: CleanType;
  bedrooms: string;
  bathrooms: number;
  extras: string[];
  photoCount: number;
  when: 'asap' | 'schedule';
  selectedDate: string;
  selectedTime: string;
  repeatBooking: boolean;
  selectedHelper: MatchCandidate | null;
}

interface BookingRequestContextValue extends BookingRequestState {
  setJobDetails: (fields: Partial<Pick<BookingRequestState, 'cleanType' | 'bedrooms' | 'bathrooms' | 'extras' | 'photoCount'>>) => void;
  setSchedule: (fields: Partial<Pick<BookingRequestState, 'when' | 'selectedDate' | 'selectedTime' | 'repeatBooking'>>) => void;
  selectHelper: (helper: MatchCandidate) => void;
  reset: () => void;
}

const initialState: BookingRequestState = {
  cleanType: 'deep',
  bedrooms: '3',
  bathrooms: 2,
  extras: ['Inside fridge', 'Windows'],
  photoCount: 0,
  when: 'schedule',
  selectedDate: 'Sat 4 Oct',
  selectedTime: '9:00 AM',
  repeatBooking: false,
  selectedHelper: null,
};

const BookingRequestContext = createContext<BookingRequestContextValue | null>(null);

export function BookingRequestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingRequestState>(initialState);

  const value: BookingRequestContextValue = {
    ...state,
    setJobDetails: (fields) => setState((s) => ({ ...s, ...fields })),
    setSchedule: (fields) => setState((s) => ({ ...s, ...fields })),
    selectHelper: (selectedHelper) => setState((s) => ({ ...s, selectedHelper })),
    reset: () => setState(initialState),
  };

  return <BookingRequestContext.Provider value={value}>{children}</BookingRequestContext.Provider>;
}

export function useBookingRequest() {
  const ctx = useContext(BookingRequestContext);
  if (!ctx) throw new Error('useBookingRequest must be used within BookingRequestProvider');
  return ctx;
}
