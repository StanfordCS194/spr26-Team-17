'use client';

import { renderSection } from '../templates/registry';
import { getSiteBrand } from '@/lib/site-brand';
import { useAmazonCartOptional } from '@/lib/amazon-cart';
import { usePageStore } from '@/lib/store';
import { AmazonCartView } from '@/components/amazon/AmazonCartView';
import { AmazonCheckoutView } from '@/components/amazon/AmazonCheckoutView';
import { AmazonOrderConfirmation } from '@/components/amazon/AmazonOrderConfirmation';
import { WatchPage } from './WatchPage';

const HEADER_TYPES = new Set(['TopBar']);
const SIDEBAR_TYPES = new Set(['Sidebar']);
// Sections that render at the PageRoot level (full-bleed overlays) — Site
// must NOT render them in the main column or they'd double-up.
const ROOT_OVERLAY_TYPES = new Set(['AmbientBackground']);

export function Site() {
  const { config, watchingId } = usePageStore();
  const brand = getSiteBrand(config.slug);
  const amazonCart = useAmazonCartOptional();
  const amazonScreen = brand === 'amazon' ? amazonCart?.screen ?? 'browse' : 'browse';
  const onAmazonCheckoutFlow = brand === 'amazon' && amazonScreen !== 'browse';
  const hideSidebar = brand === 'amazon' && (Boolean(watchingId) || onAmazonCheckoutFlow);

  const header = config.sections.filter((s) => HEADER_TYPES.has(s.type));
  const sidebar = config.sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = config.sections.filter(
    (s) => !HEADER_TYPES.has(s.type) && !SIDEBAR_TYPES.has(s.type) && !ROOT_OVERLAY_TYPES.has(s.type),
  );

  // chromeDim fades the TopBar + Sidebar so an ambient background shines
  // through. 0 (default) = full strength; 0.5 = noticeably faded.
  const dim = config.theme.chromeDim ?? 0;
  const chromeStyle = dim > 0 ? { opacity: 1 - dim, transition: 'opacity 400ms ease' } : undefined;

  return (
    <>
      {header.map((section) => (
        <div
          key={section.id}
          data-section-id={section.id}
          data-section-type={section.type}
          style={chromeStyle}
        >{renderSection(section, config)}</div>
      ))}
      <div className="flex">
        {!hideSidebar &&
          sidebar.map((section) => (
            <div
              key={section.id}
              data-section-id={section.id}
              data-section-type={section.type}
              style={chromeStyle}
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
              <div key={section.id} data-section-id={section.id} data-section-type={section.type}>{renderSection(section, config)}</div>
            ))
          )}
        </main>
      </div>
    </>
  );
}
