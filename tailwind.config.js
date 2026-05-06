/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#22d3ee',
          teal: '#14b8a6',
        },
        charcoal: {
          700: '#1f2937',
          800: '#111827',
          900: '#030712',
          950: '#020617',
        }
      },
    },
  },
  plugins: [],
}
