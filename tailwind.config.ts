import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#DEB2B4', // Soft blush
          secondary: '#820F46', // Deep berry
          dark: '#090103', // Black
          neutral: '#F3ECDC', // Warm Cream
          accent: '#DE99AB', // Dusty Pink
          base: '#FFFFFF', // White
          // Keep these for UI elements that might still rely on them, mapping to new colors
          cream: '#F3ECDC',
          'cream-dark': '#EFE5CF',
          black: '#090103',
          charcoal: '#1A1113',
          gray: '#7A6D70',
          'gray-light': '#D6C8CA',
          sand: '#DEB2B4',
        },
      },
      fontFamily: {
        heading: ['"Bodoni Moda"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.12em' }],
        xs: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.1em' }],
        sm: ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.04em' }],
        base: ['1rem', { lineHeight: '1.6rem', letterSpacing: '0.02em' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.01em' }],
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '4rem', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '4.75rem', letterSpacing: '-0.04em' }],
        '8xl': ['6rem', { lineHeight: '6.5rem', letterSpacing: '-0.05em' }],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
        widest: '0.15em',
        wider: '0.1em',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'slide-in-up': 'slide-in-up 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        marquee: 'marquee 30s linear infinite',
      },
      aspectRatio: {
        'product': '3 / 4',
        'hero': '16 / 9',
        'square': '1 / 1',
        'portrait': '4 / 5',
      },
    },
  },
  plugins: [],
} satisfies Config
