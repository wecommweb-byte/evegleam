import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#e96789',
        'gold-deep': '#d84b72',
        'gold-light': '#f6b8c8',
        blush: '#F7EDE8',
        'blush-deep': '#EDD5C8',
        dark: '#1A1A1A',
        'dark-soft': '#2D2D2D',
        bg: '#FFFAF8',
        accent: '#8B5E3C',
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
