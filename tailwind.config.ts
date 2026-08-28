import type { Config } from 'tailwindcss';

// Design tokens carried over 1:1 from the approved ALLinHELP / Urgent Help
// product design (ALLinHELP_Product_Design.html) — do not change without
// design sign-off.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F1F3D',
        'navy-2': '#16294f',
        brand: {
          DEFAULT: '#2563EB', // Electric Blue — primary action
          dark: '#1D4ED8',
        },
        ai: '#06B6D4', // Cyan — AI accent
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#F87171',
        // Dark app background (near-black, slight navy tint)
        surface: '#0A0E1A',
        // Card / panel surface — one step up from the page background
        panel: '#131A2C',
        'panel-2': '#182036',
        ink: {
          DEFAULT: '#F5F7FA', // headings — near-white
          soft: '#9CA8C4', // secondary text
          faint: '#6B7690', // labels, placeholders
        },
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,31,61,.04), 0 8px 24px -8px rgba(15,31,61,.12)',
        lg2: '0 20px 60px -12px rgba(15,31,61,.28)',
      },
    },
  },
  plugins: [],
};
export default config;
