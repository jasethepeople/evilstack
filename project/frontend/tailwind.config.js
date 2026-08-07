/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{tsx,ts,jsx,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        evil: {
          900: '#0a0a0f',
          800: '#13131f',
          700: '#1e1e2e',
          600: '#2a2a3e',
          500: '#363650',
          accent: '#00ff88',
          accent2: '#ff0055',
          accent3: '#00ccff',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
