/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs JadaRiseLabs (charte graphique)
        earth: '#7B4F2E',
        'earth-light': '#A0714D',
        'earth-dark': '#5C3A1F',
        gold: '#C9A84C',
        'gold-light': '#D4BA6E',
        'gold-dark': '#A88A3A',
        savanna: '#2D6A4F',
        'savanna-light': '#48856A',
        'savanna-dark': '#1F4E39',
        terracotta: '#E76F51',
        'terracotta-light': '#EC8D75',
        'terracotta-dark': '#D4533A',
        // Couleurs neutres
        cream: '#FDF6E3',
        'cream-dark': '#F5ECD0',
        'text-primary': '#1A1A1A',
        'text-secondary': '#555555',
        'text-muted': '#888888',
        border: '#E5E5E5',
      },
      fontFamily: {
        heading: ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
