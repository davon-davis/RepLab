/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        board: {
          dark: '#769656',
          light: '#eeeed2',
        },
        replab: {
          bg: '#0f1117',
          surface: '#1a1d27',
          border: '#2a2d3a',
          accent: '#7c6bea',
          'accent-dim': '#4c3f9a',
          blunder: '#e05252',
          mistake: '#e09c52',
          inaccuracy: '#e8d84a',
          good: '#52c484',
        },
      },
      fontFamily: {
        display: ['"DM Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
