/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: ["./views/**/*.html", , "./**/*.js"], // all .html files
  content: [`./views/**/*.ejs`], // all .ejs files
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['fantasy',],
    layout: 'sidebar',
  },
}





