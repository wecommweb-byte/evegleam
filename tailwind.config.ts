import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#FBD4D9',
        'brand-pink-light': '#FBE5E7',
        'brand-gold': '#C19860',
        'brand-dark': '#0A0908',
        gold: '#FBD4D9',
        'gold-deep': '#C19860',
        'gold-light': '#FBE5E7',
        blush: '#FBD4D9',
        'blush-deep': '#C19860',
        dark: '#0A0908',
        'dark-soft': '#0A0908',
        bg: '#FFFAF8',
        accent: '#C19860',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        brand: '16px',
      },
      boxShadow: {
        gold: '0 0 20px rgba(233, 103, 137, 0.4)',
        'gold-lg': '0 8px 40px rgba(233, 103, 137, 0.3)',
        soft: '0 4px 20px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 12px 40px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
