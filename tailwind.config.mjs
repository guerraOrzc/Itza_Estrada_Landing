/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
        },
        brand: {
          bg: 'var(--color-bg)',
          'bg-alt': 'var(--color-bg-alt)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          'text-inverse': 'var(--color-text-inverse)',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      maxWidth: {
        container: 'var(--container-max-width)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
    },
  },
  plugins: [],
};
