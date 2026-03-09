/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F8FAFC',
        'surface': '#FFFFFF',
        'text-main': '#0F172A',
        'text-muted': '#64748B',
        'accent': '#2563EB',      // Professional Royal Blue
        'accent-hover': '#1D4ED8',
        'accent-dark': '#0F172A', // Slate 900
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
