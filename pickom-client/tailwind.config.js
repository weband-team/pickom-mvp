/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'mobile-only': '428px', // Максимальная ширина мобильного приложения
      },
      maxWidth: {
        'mobile': '428px', // iPhone 14 Pro Max width - фиксированная ширина для всех экранов
        'xs': '375px',
      },
      width: {
        'mobile': '428px',
        'mobile-sm': '375px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card-background)',
          foreground: 'var(--foreground)',
        },
        border: 'var(--border-color)',
        accent: {
          orange: 'var(--accent-orange)',
          'orange-hover': 'var(--accent-orange-hover)',
        },
        success: 'var(--success-green)',
        secondary: 'var(--text-secondary)',
        // Цвета для фона больших экранов
        'desktop-bg': '#111827',
        'desktop-border': '#374151',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
      fontSize: {
        'mobile-sm': ['14px', '20px'],
        'mobile-base': ['16px', '24px'],
        'mobile-lg': ['18px', '28px'],
        'mobile-xl': ['20px', '32px'],
        'mobile-2xl': ['24px', '36px'],
        'mobile-3xl': ['30px', '40px'],
        'mobile-4xl': ['36px', '44px'],
      },
      minHeight: {
        'touch-target': '44px',
        'button': '56px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        'mobile': '12px',
        'mobile-lg': '16px',
      },
      boxShadow: {
        'mobile': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'mobile-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'mobile-app': '0 0 50px rgba(0, 0, 0, 0.8)', // Тень для мобильного контейнера на больших экранах
      },
    },
  },
  plugins: [],
} 