import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Splash } from './screens/Splash/Splash';
import { Onboarding } from './screens/Onboarding/Onboarding';
import { Phone } from './screens/auth/Phone';
import { VerifyCode } from './screens/auth/VerifyCode';
import { YourName } from './screens/auth/YourName';
import { YourAddress } from './screens/auth/YourAddress';
import { Home } from './screens/Home/Home';
import { RequestWizardLayout } from './screens/request/RequestWizardLayout';
import { JobDetails } from './screens/request/JobDetails';
import { WhenAndWhere } from './screens/request/WhenAndWhere';
import { FairPrice } from './screens/request/FairPrice';
import { FindingHelpers } from './screens/request/FindingHelpers';
import { Offers } from './screens/request/Offers';
import { HelperProfile } from './screens/request/HelperProfile';
import { ReviewAndPay } from './screens/request/ReviewAndPay';
import { BookingConfirmed } from './screens/request/BookingConfirmed';
import { Tracking } from './screens/request/Tracking';
import { JobInProgress } from './screens/request/JobInProgress';
import { JobDone } from './screens/request/JobDone';
import { RateHelper } from './screens/request/RateHelper';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/splash" replace /> },
  { path: '/splash', element: <Splash /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/phone', element: <Phone /> },
  { path: '/verify', element: <VerifyCode /> },
  { path: '/name', element: <YourName /> },
  { path: '/address', element: <YourAddress /> },
  { path: '/home', element: <Home /> },
  {
    path: '/request',
    element: <RequestWizardLayout />,
    children: [
      { path: 'job-details', element: <JobDetails /> },
      { path: 'when-and-where', element: <WhenAndWhere /> },
      { path: 'fair-price', element: <FairPrice /> },
      { path: 'finding-helpers', element: <FindingHelpers /> },
      { path: 'offers', element: <Offers /> },
      { path: 'helper/:helperId', element: <HelperProfile /> },
      { path: 'review', element: <ReviewAndPay /> },
      { path: 'confirmed', element: <BookingConfirmed /> },
      { path: 'tracking', element: <Tracking /> },
      { path: 'in-progress', element: <JobInProgress /> },
      { path: 'job-done', element: <JobDone /> },
      { path: 'rate', element: <RateHelper /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-ink-faint text-sm">
      Page not found.
    </div>
  );
}
