import type { Metadata } from 'next';
import { fontVariables } from './fonts';
import { ChatProvider } from '@/lib/chat-store';
import './globals.css';
import './site-brands.css';

export const metadata: Metadata = {
  title: 'Showcase — Personalizable YouTube',
  description: 'Talk to your homepage. Personalize the look, the recommendations, and the layout. Preferences stick.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={fontVariables}
    >
      <body className="bg-bg text-fg antialiased">
        {/* ChatProvider lives at the root so chat state persists across site
            navigations. The ChatPanel itself is rendered by PageRoot, which is
            inside a PageStoreProvider — both contexts the panel depends on. */}
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
