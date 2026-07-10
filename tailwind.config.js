/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: '#740A03',
          roseMuted: '#A77272',
          bgLight: '#FBF9F6',
          bgCard: '#FFFFFF',
          darkText: '#2B2323',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Poppins', 'sans-serif'],
        // Sophisticated minimalist display face for the brand wordmark.
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      fontSize: {
        'senior-sm': ['0.9375rem', { lineHeight: '1.5' }],
        'senior-base': ['1.0625rem', { lineHeight: '1.6' }],
        'senior-lg': ['1.25rem', { lineHeight: '1.5' }],
        'senior-xl': ['1.5rem', { lineHeight: '1.4' }],
        'senior-2xl': ['1.875rem', { lineHeight: '1.3' }],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      },
      minHeight: {
        'touch-target': '44px',
        'touch-target-large': '48px',
      },
      minWidth: {
        'touch-target': '44px',
        'touch-target-large': '48px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.touch-none': {
          '-webkit-touch-callout': 'none',
          '-webkit-user-select': 'none',
          'user-select': 'none',
        },
        '.safe-area-padding': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-area-padding-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-area-padding-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-area-margin-bottom': {
          marginBottom: 'env(safe-area-inset-bottom)',
        },
        '.vibrate-on-tap': {
          '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0.1)',
        },
      })
    }
  ],
}
