/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#BDE2A7',
        'primary-strong': '#6FBF73',
        'primary-dark': '#2E7D32',
        background: '#FFFFFF',
        surface: '#F5F7F6',
        'text-primary': '#1C1C1C',
        'text-secondary': '#9E9E9E',
      }
    },
  },
  plugins: [],
}