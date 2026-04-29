import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        'muted-fg': 'var(--muted-fg)',
        border: 'var(--border)',
      },
      fontSize: {
        scaled: 'calc(1rem * var(--font-scale, 1))',
      },
    },
  },
  plugins: [],
};

export default config;
