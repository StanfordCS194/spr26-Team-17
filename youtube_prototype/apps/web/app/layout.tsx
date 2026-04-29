import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Showcase — Personalizable YouTube',
  description: 'Talk to your homepage. Personalize the look, the recommendations, and the layout. Preferences stick.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
