import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#3a0e2e',
        cream: '#fff5f8',
        raspberry: '#e00068',
        blush: '#ff8fb3',
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
