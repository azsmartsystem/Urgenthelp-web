import type { Config } from 'tailwindcss';

// Design tokens sourced directly from the "Urgent Help" Figma file
// (fileKey i4pipHNVS1GclySydJFCDi) — a light-themed UI, distinct from the
// old dark-navy tokens this file used to carry for the retired Next.js app.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1E4BB8', // primary blue — CTAs, active states, links
          dark: '#163A94',
        },
        ai: '#06B6D4',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        // Page background (light grey) and card surfaces
        surface: '#F5F6F8',
        panel: '#FFFFFF',
        'panel-2': '#ECEEF1',
        ink: {
          DEFAULT: '#16181D', // headings, primary text
          soft: '#5B616E', // secondary/body text
          faint: '#9AA0AC', // placeholders, disabled
        },
        line: '#E7E9ED',
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        'card-lg': '32px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,24,29,.04), 0 8px 24px -8px rgba(22,24,29,.10)',
        lg2: '0 20px 60px -12px rgba(22,24,29,.18)',
      },
    },
  },
  plugins: [],
};
export default config;
