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
        'tactical-bg': '#050b14', // Deeper black/blue
        'tactical-surface': '#0f172a', // Slate 900
        'tactical-highlight': '#1e293b', // Slate 800
        'radio-cyan': '#06b6d4', // Cyan 500 - Primary Neon
        'radio-green': '#10b981', // Emerald 500
        'radio-amber': '#f59e0b', // Amber 500
        'radio-red': '#ef4444', // Red 500
        'neon-blue': '#3b82f6', // Blue 500
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
