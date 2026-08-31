import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fcf2ee',
          100: '#f8e1d6',
          200: '#efc1ac',
          300: '#e39d7d',
          400: '#d5794f',
          500: '#c15a2e',
          600: '#a34521',
          700: '#83371c',
          800: '#6a2e1b',
          900: '#56271a',
        },
        azulejo: {
          50: '#eef6f5',
          100: '#d3e9e7',
          200: '#a7d3cf',
          300: '#78b7b1',
          400: '#4e9791',
          500: '#337873',
          600: '#285f5b',
          700: '#224e4b',
          800: '#1e403d',
          900: '#1a3634',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
}

export default config
