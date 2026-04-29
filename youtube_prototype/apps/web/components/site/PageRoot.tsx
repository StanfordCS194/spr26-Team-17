'use client';

import { usePageStore } from '@/lib/store';
import { Site } from './Site';
import { ChatPanel } from '@/components/chat/ChatPanel';

export function PageRoot({ pageSlug }: { pageSlug: string }) {
  const { config } = usePageStore();
  const themeStyle: React.CSSProperties = {
    ['--accent' as string]: config.theme.accent,
    ['--font-scale' as string]: config.theme.fontScale,
  };

  return (
    <div
      data-theme={config.theme.mode}
      style={themeStyle}
      className="min-h-screen relative bg-bg text-fg"
    >
      <Site />
      <ChatPanel pageSlug={pageSlug} />
    </div>
  );
}
