import { Lato } from 'next/font/google';

export const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

export const fontVariables = lato.variable;
