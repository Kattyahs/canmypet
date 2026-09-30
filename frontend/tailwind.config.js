/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#14746F',
          dark: '#0F5C58',
          soft: '#E4F2EF',
          muted: '#F1F8F6',
        },
        bone: '#F4F7F6',
        risk: {
          safe: '#166534',
          moderate: '#92400E',
          toxic: '#B91C1C',
          lethal: '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['"Public Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 2px 8px rgba(16, 24, 40, 0.05)',
        raised: '0 4px 16px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
}