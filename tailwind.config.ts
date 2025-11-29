import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#05060A',
        'bg-card': '#090B11',
        'bg-card-alt': '#0C0F18',
        'accent-red': '#ff3b3b',
        'accent-red-light': '#ff4b4b',
        'text-secondary': '#d8d8d8',
        'accent-cyan': '#0a0a0a', // Sleek black
        'accent-cyan-light': '#1a1a1a', // Lighter sleek black variant
        'sleek-black': '#0a0a0a',
        'sleek-black-light': '#1a1a1a',
        'sleek-black-lighter': '#2a2a2a',
        'border-dark': '#1b1f2a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'radar-sweep': 'radar-sweep 2s ease-in-out infinite',
      },
      keyframes: {
        'radar-sweep': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '0.4' },
          '100%': { transform: 'scale(0.8)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config

