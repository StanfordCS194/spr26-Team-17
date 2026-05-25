'use client';

import type { Section } from '@showcase/shared';
import { renderSection } from '../templates/registry';
import { getSiteBrand } from '@/lib/site-brand';
import { useAmazonCartOptional } from '@/lib/amazon-cart';
import { usePageStore } from '@/lib/store';
import { SlackWorkspaceShell } from '@/components/slack/SlackWorkspaceShell';
import { AmazonCartView } from '@/components/amazon/AmazonCartView';
import { AmazonCheckoutView } from '@/components/amazon/AmazonCheckoutView';
import { AmazonOrderConfirmation } from '@/components/amazon/AmazonOrderConfirmation';
import { WatchPage } from './WatchPage';

function sectionStyleVars(section: Section): React.CSSProperties | undefined {
  const style = section.props.style;
  if (!style) return undefined;
  const css: Record<string, string> = {};
  if (style.background) {
    css.background = style.background;
    css['--bg'] = style.background;
    css['--surface'] = style.background;
  }
  if (style.accent) css['--accent'] = style.accent;
  if (style.textColor) {
    css.color = style.textColor;
    css['--fg'] = style.textColor;
  }
  if (style.borderRadius) css.borderRadius = style.borderRadius;
  return css as React.CSSProperties;
}

const HEADER_TYPES = new Set(['TopBar']);
const SIDEBAR_TYPES = new Set(['Sidebar']);
const ROOT_OVERLAY_TYPES = new Set(['AmbientBackground']);

export function Site() {
  const { config, watchingId } = usePageStore();
  const brand = getSiteBrand(config.slug);
  const amazonCart = useAmazonCartOptional();
  const amazonScreen = brand === 'amazon' ? amazonCart?.screen ?? 'browse' : 'browse';
  const onAmazonCheckoutFlow = brand === 'amazon' && amazonScreen !== 'browse';
  const hideSidebar = brand === 'amazon' && (Boolean(watchingId) || onAmazonCheckoutFlow);

  if (brand === 'slack') {
    return (
      <div className="slack-app-shell flex min-h-0 flex-1 flex-col">
        <SlackWorkspaceShell config={config} />
      </div>
    );
  }

  const header = config.sections.filter((s) => HEADER_TYPES.has(s.type));
  const sidebar = config.sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = config.sections.filter(
    (s) => !HEADER_TYPES.has(s.type) && !SIDEBAR_TYPES.has(s.type) && !ROOT_OVERLAY_TYPES.has(s.type),
  );

  const dim = config.theme.chromeDim ?? 0;
  const chromeStyle = dim > 0 ? { opacity: 1 - dim, transition: 'opacity 400ms ease' } : undefined;

  return (
    <>
      {header.map((section) => (
        <div
          key={section.id}
          data-section-id={section.id}
          data-section-type={section.type}
          style={{ ...sectionStyleVars(section), ...chromeStyle }}
        >{renderSection(section, config)}</div>
      ))}
      <div className="flex">
        {!hideSidebar &&
          sidebar.map((section) => (
            <div
              key={section.id}
              data-section-id={section.id}
              data-section-type={section.type}
              style={{ ...sectionStyleVars(section), ...chromeStyle }}
            >{renderSection(section, config)}</div>
          ))}
        <main className={`min-w-0 flex-1 relative z-10 ${getSiteBrand(config.slug) === 'instagram' ? 'site-main-feed' : ''}`}>
          {brand === 'amazon' && amazonScreen === 'cart' ? (
            <AmazonCartView />
          ) : brand === 'amazon' && amazonScreen === 'checkout' ? (
            <AmazonCheckoutView />
          ) : brand === 'amazon' && amazonScreen === 'confirmation' ? (
            <AmazonOrderConfirmation />
          ) : watchingId ? (
            <WatchPage />
          ) : (
            main.map((section) => (
              <div
                key={section.id}
                data-section-id={section.id}
                data-section-type={section.type}
                style={sectionStyleVars(section)}
              >{renderSection(section, config)}</div>
            ))
          )}
        </main>
      </div>
    </>
  );
}
