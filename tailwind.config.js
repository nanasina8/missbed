/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'link': 'rgb(68,164,193)'
      },
      animation: {
        fade: 'fadeIn 1s ease-in-out',
      },
      keyframes: () => ({
        fadeIn: {
          '0%': { opacity: 0, top: -10 },
          '100%': { opacity: 1, top: 0 },
        },
      }),
    },
  },
  plugins: [],
}
