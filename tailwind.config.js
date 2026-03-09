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
        'accent': '#badc58',      // Pastel Green / Lime
        'accent-hover': '#a3cb38',
        'accent-dark': '#6ab04c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
