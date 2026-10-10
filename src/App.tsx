import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthSetupProvider } from './context/AuthSetupContext';

export default function App() {
  return (
    <AuthSetupProvider>
      <RouterProvider router={router} />
    </AuthSetupProvider>
  );
}
