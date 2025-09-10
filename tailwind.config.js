/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'system': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        'bittorrent': {
          'bg': '#f8f9fa',
          'toolbar': '#e9ecef',
          'border': '#dee2e6',
          'downloading': '#007bff',
          'seeding': '#28a745',
          'completed': '#28a745',
          'error': '#dc3545',
        }
      }
    },
  },
  plugins: [],
}
