/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        olemiss: {
          navy: '#00205b',
          cardinal: '#c8102e',
        },
        brand: {
          DEFAULT: 'var(--cb-primary)',
          foreground: 'var(--cb-primary-foreground)',
          accent: 'var(--cb-danger)',
        },
        surface: {
          DEFAULT: 'var(--cb-bg-elevated)',
          muted: 'var(--cb-bg-muted)',
          foreground: 'var(--cb-text-primary)',
          secondary: 'var(--cb-text-secondary)',
        },
      },
      borderRadius: {
        lg: 'var(--cb-radius-lg)',
        md: 'var(--cb-radius-md)',
        sm: 'var(--cb-radius-sm)',
      },
      boxShadow: {
        card: 'var(--cb-shadow-lg)',
        glow: 'var(--cb-shadow-glow)',
      },
    },
  },
  plugins: [],
}
