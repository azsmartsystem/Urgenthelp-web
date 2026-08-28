'use client';
import { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export function PasswordInput({ value, onChange, placeholder, autoComplete, onKeyDown, className }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        onKeyDown={onKeyDown}
        className={
          className ??
          'w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl pl-4 pr-11 py-3 text-sm outline-none focus:border-brand'
        }
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft text-xs font-bold"
      >
        {visible ? 'HIDE' : 'SHOW'}
      </button>
    </div>
  );
}
