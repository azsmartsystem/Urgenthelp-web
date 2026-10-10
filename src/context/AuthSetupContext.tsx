import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthSetupState {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  addressLabel: string;
  addressLine: string;
}

interface AuthSetupContextValue extends AuthSetupState {
  setPhone: (phone: string) => void;
  setNameFields: (firstName: string, lastName: string, email: string) => void;
  setAddress: (label: string, line: string) => void;
}

const AuthSetupContext = createContext<AuthSetupContextValue | null>(null);

export function AuthSetupProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthSetupState>({
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    addressLabel: '',
    addressLine: '',
  });

  const value: AuthSetupContextValue = {
    ...state,
    setPhone: (phone) => setState((s) => ({ ...s, phone })),
    setNameFields: (firstName, lastName, email) => setState((s) => ({ ...s, firstName, lastName, email })),
    setAddress: (addressLabel, addressLine) => setState((s) => ({ ...s, addressLabel, addressLine })),
  };

  return <AuthSetupContext.Provider value={value}>{children}</AuthSetupContext.Provider>;
}

export function useAuthSetup() {
  const ctx = useContext(AuthSetupContext);
  if (!ctx) throw new Error('useAuthSetup must be used within AuthSetupProvider');
  return ctx;
}
