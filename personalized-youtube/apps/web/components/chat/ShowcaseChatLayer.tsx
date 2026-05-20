'use client';

import { usePathname } from 'next/navigation';
import { SHOWCASE_SITES } from '@showcase/shared';
import { ChatProvider } from '@/lib/chat-store';
import { ChatPanel } from '@/components/chat/ChatPanel';

const SHOWCASE_PATHS = new Set<string>(SHOWCASE_SITES.map((s) => s.path));

export function ShowcaseChatLayer() {
  const pathname = usePathname() ?? '/';
  if (!SHOWCASE_PATHS.has(pathname)) return null;

  return (
    <ChatProvider>
      <ChatPanel />
    </ChatProvider>
  );
}
