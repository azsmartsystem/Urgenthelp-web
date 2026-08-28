import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Urgent Help — Trusted Local Help, Minutes Away',
  description:
    'Urgent Help is an AI-powered local services platform connecting you with verified, trusted helpers for cleaning, repairs, care and more.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
