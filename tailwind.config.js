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
        glow: '0 0 20px rgba(201, 168, 76, 0.3)',
        'glow-lg': '0 0 40px rgba(201, 168, 76, 0.4)',
        premium: '0 20px 40px rgba(123, 79, 46, 0.15)',
        'premium-lg': '0 30px 60px rgba(123, 79, 46, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float-delayed 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradient-shift-premium 4s ease infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'scale-bounce': 'scale-bounce 0.3s ease-out',
        'spin-slow': 'spin-slow 3s linear infinite',
        'float-3d': 'float-3d 6s ease-in-out infinite',
        'parallax': 'parallax-float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-5deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 168, 76, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 168, 76, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift-premium': {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'scale-bounce': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float-3d': {
          '0%, 100%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '25%': { transform: 'translateY(-5px) rotateX(2deg) rotateY(2deg)' },
          '50%': { transform: 'translateY(-10px) rotateX(0) rotateY(4deg)' },
          '75%': { transform: 'translateY(-5px) rotateX(-2deg) rotateY(2deg)' },
        },
        'parallax-float': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(10px, -15px, 0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #7B4F2E 0%, #C9A84C 50%, #E76F51 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #D4BA6E 100%)',
        'gradient-earth': 'linear-gradient(135deg, #7B4F2E 0%, #A0714D 100%)',
        'gradient-savanna': 'linear-gradient(135deg, #2D6A4F 0%, #48856A 100%)',
        'gradient-terracotta': 'linear-gradient(135deg, #E76F51 0%, #EC8D75 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
