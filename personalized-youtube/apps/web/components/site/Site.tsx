'use client';

import { renderSection } from '../templates/registry';
import { usePageStore } from '@/lib/store';
import { WatchPage } from './WatchPage';

const HEADER_TYPES = new Set(['TopBar']);
const SIDEBAR_TYPES = new Set(['Sidebar']);
// Sections that render at the PageRoot level (full-bleed overlays) — Site
// must NOT render them in the main column or they'd double-up.
const ROOT_OVERLAY_TYPES = new Set(['AmbientBackground']);
const SIDEBAR_WIDTH = '15rem';
const COLLAPSED_SIDEBAR_WIDTH = '5rem';

export function Site() {
  const { config, watchingId } = usePageStore();

  const header = config.sections.filter((s) => HEADER_TYPES.has(s.type));
  const sidebar = config.sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const sidebarPosition = sidebar.some((s) => s.type === 'Sidebar' && s.props.position === 'right') ? 'right' : 'left';
  const sidebarCollapsed = sidebar.some((s) => s.type === 'Sidebar' && s.props.collapsed);
  const main = config.sections.filter(
    (s) => !HEADER_TYPES.has(s.type) && !SIDEBAR_TYPES.has(s.type) && !ROOT_OVERLAY_TYPES.has(s.type),
  );

  // chromeDim fades the TopBar + Sidebar so an ambient background shines
  // through. 0 (default) = full strength; 0.5 = noticeably faded.
  const dim = config.theme.chromeDim ?? 0;
  const chromeOpacity = 1 - dim;
  const chromeStyle = dim > 0 ? { opacity: chromeOpacity, transition: 'opacity 400ms ease' } : undefined;
  const sidebarColumn = sidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH;
  const hasSidebar = sidebar.length > 0;
  const layoutColumns =
    sidebarPosition === 'left'
      ? `${hasSidebar ? sidebarColumn : '0rem'} minmax(0, 1fr) 0rem`
      : `0rem minmax(0, 1fr) ${hasSidebar ? sidebarColumn : '0rem'}`;
  const renderSidebarSlot = (side: 'left' | 'right') => {
    const isActive = hasSidebar && sidebarPosition === side;
    return (
      <div
        aria-hidden={!isActive}
        className={`hidden min-w-0 overflow-hidden lg:block transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isActive ? 'pointer-events-auto translate-x-0 blur-0' : 'pointer-events-none opacity-0 blur-sm'
        }`}
        style={{ opacity: isActive ? chromeOpacity : 0 }}
      >
        {sidebar.map((section) => {
          if (section.type !== 'Sidebar') return null;
          const slotSection = { ...section, props: { ...section.props, position: side } };
          return (
            <div
              key={`${section.id}-${side}`}
              data-section-id={section.id}
              data-section-type={section.type}
            >{renderSection(slotSection, config)}</div>
          );
        })}
      </div>
    );
  };

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
      <div
        className="grid grid-cols-[minmax(0,1fr)] transition-[grid-template-columns] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:grid-cols-[var(--layout-columns)]"
        style={{ ['--layout-columns' as string]: layoutColumns }}
      >
        {renderSidebarSlot('left')}
        <main className="min-w-0 relative z-10 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
          {watchingId ? (
            <WatchPage />
          ) : (
            main.map((section) => (
              <div
                key={section.id}
                data-section-id={section.id}
                data-section-type={section.type}
                className="transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              >{renderSection(section, config)}</div>
            ))
          )}
        </main>
        {renderSidebarSlot('right')}
      </div>
    </>
  );
}
