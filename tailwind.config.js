/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'vt323': ['VT323', 'monospace'],
        'chicago': ['"Chicago FLF"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 