/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#F8FAFF',
        ink: '#0E1726',
        muted: '#6B7A90',
        divider: '#E6EAF3',
        primary: '#4C6FFF',
        'primary-hover': '#3B5BFF',
        'primary-active': '#2A4AFF',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      borderRadius: {
        'custom': '16px',
      },
      maxWidth: {
        '1200': '1200px',
      },
      spacing: {
        '18': '4.5rem',
      },
      fontSize: {
        'lg-semi': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      boxShadow: {
        'glass': '0 1px 2px rgba(0,0,0,0.06)',
        'elevation': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
