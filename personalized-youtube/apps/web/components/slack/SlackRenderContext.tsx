'use client';

import { createContext, useContext } from 'react';

export type SlackRenderContextValue = {
  /** Slack channel id (C…) → display name without # */
  channelNames: Record<string, string>;
};

const SlackRenderContext = createContext<SlackRenderContextValue>({ channelNames: {} });

export function SlackRenderProvider({
  channelNames,
  children,
}: {
  channelNames: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <SlackRenderContext.Provider value={{ channelNames }}>{children}</SlackRenderContext.Provider>
  );
}

export function useSlackRender(): SlackRenderContextValue {
  return useContext(SlackRenderContext);
}
