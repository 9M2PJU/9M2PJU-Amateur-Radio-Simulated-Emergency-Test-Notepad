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
        'tactical-bg': '#1a1c10', // Deep Olive/Black
        'tactical-surface': '#2b2f1b', // Dark Camo Green
        'tactical-highlight': '#3f4228', // Lighter Camo Green
        'radio-cyan': '#a3b86c', // Light Khaki/Green - replacing Cyan
        'radio-green': '#4d7c0f', // Military Green
        'radio-amber': '#d97706', // Amber (kept for warning/accent)
        'radio-red': '#b91c1c', // Deep Red
        'neon-blue': '#60a5fa', // Muted Blue
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
