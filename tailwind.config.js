/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './site/index.html',
    './site/blog/*.html',
    './site/websites/*.html',
    './site/work/*.html',
    './site/care-plans/*.html',
    './site/ai-services/*.html',
    './site/contact/*.html',
    './site/assets/blog.js',
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0b1120', light: '#151d32', muted: '#1e293b' },
        cream: { DEFAULT: '#f8f6f1', dark: '#ebe8e1' },
        brand: { DEFAULT: '#0d9488', dark: '#0f766e', light: '#5eead4', warm: '#d97706' },
      },
    },
  },
  plugins: [],
};