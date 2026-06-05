/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        echo: {
          dark: '#0a0a0f',
          card: '#13131a',
          border: '#1e1e2e',
          pink: '#ff6b9d',
          purple: '#9b59d6',
          cyan: '#00d4ff',
          gold: '#ffd700',
        }
      }
    }
  },
  plugins: [],
}
