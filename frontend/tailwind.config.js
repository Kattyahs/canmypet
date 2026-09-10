/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#14746F',
        bone: '#F6F6F3',
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
    },
  },
  plugins: [],
}
