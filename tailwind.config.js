/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef6ee',
          100: '#fdedd7',
          200: '#fad6ae',
          300: '#f6ba7a',
          400: '#f29345',
          500: '#ef7420',
          600: '#e05916',
          700: '#ba4314',
          800: '#943618',
          900: '#782f16',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e6e3',
          200: '#c7ccc7',
          300: '#a3aba3',
          400: '#7d887d',
          500: '#616d61',
          600: '#4c574c',
          700: '#3f473f',
          800: '#353b35',
          900: '#2e322e',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

