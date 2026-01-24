/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tactical-bg': '#0f172a', // Slate 900
        'tactical-surface': '#1e293b', // Slate 800
        'tactical-highlight': '#334155', // Slate 700
        'radio-green': '#22c55e', // Green 500
        'radio-amber': '#f59e0b', // Amber 500
        'radio-red': '#ef4444', // Red 500
      },
    },
  },
  plugins: [],
}
