/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './hack-heist-admin/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', ...defaultTheme.fontFamily.sans],
        body: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'gfg-dark-bg': '#061028',
        'gfg-card-bg': '#07203a',
        'gfg-primary': '#0b66ff',
        'gfg-accent': '#7dd3fc',
        'gfg-text-light': '#f8fafc',
        'gfg-muted': '#94a3b8',
        'gfg-gradient-start': '#062a6e',
        'gfg-gradient-end': '#04162b',
      },
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(2,6,23,0.6)',
      }
    },
  },
  plugins: [],
}