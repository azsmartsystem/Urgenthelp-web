import { Outlet } from 'react-router-dom';
import { BookingRequestProvider } from '@/context/BookingRequestContext';

export function RequestWizardLayout() {
  return (
    <BookingRequestProvider>
      <Outlet />
    </BookingRequestProvider>
  );
}
