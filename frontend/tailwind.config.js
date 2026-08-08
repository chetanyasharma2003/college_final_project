/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0f172a',
          850: '#1a1f36',
          800: '#1e293b',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to br, #0f172a via-blue-900, #0f172a)',
      },
    },
  },
  plugins: [],
}
