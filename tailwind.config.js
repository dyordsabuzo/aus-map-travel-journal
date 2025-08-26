/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,md,mdx,js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
