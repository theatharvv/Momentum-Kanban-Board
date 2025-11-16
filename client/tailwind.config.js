/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        robotoCondensed: ['Roboto Condensed', 'sans-serif'],
        openSans: ['Open Sans', 'sans-serif'],
        slabo27px: ['Slabo 27px', 'serif'],
        inter: ['Inter', 'sans-serif'],
        ibmPlexSans: ['IBM Plex Sans', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
      }

    },
  },
  plugins: [],
}
