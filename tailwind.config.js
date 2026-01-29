/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      colors: {
        'tactical-bg': 'var(--color-bg)',
        'tactical-surface': 'var(--color-surface)',
        'tactical-highlight': 'var(--color-highlight)',
        'radio-cyan': 'var(--color-cyan)',
        'radio-green': 'var(--color-green)',
        'radio-amber': 'var(--color-amber)',
        'radio-red': 'var(--color-red)',
        'neon-blue': 'var(--color-blue)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
