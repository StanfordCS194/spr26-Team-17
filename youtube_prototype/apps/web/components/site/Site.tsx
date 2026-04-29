'use client';

import { renderSection } from '../templates/registry';
import { usePageStore } from '@/lib/store';

const HEADER_TYPES = new Set(['TopBar']);
const SIDEBAR_TYPES = new Set(['Sidebar']);

export function Site() {
  const { config } = usePageStore();

  const header = config.sections.filter((s) => HEADER_TYPES.has(s.type));
  const sidebar = config.sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = config.sections.filter(
    (s) => !HEADER_TYPES.has(s.type) && !SIDEBAR_TYPES.has(s.type),
  );

  return (
    <>
      {header.map((section) => (
        <div key={section.id} data-section-id={section.id} data-section-type={section.type}>{renderSection(section, config)}</div>
      ))}
      <div className="flex">
        {sidebar.map((section) => (
          <div key={section.id} data-section-id={section.id} data-section-type={section.type}>{renderSection(section, config)}</div>
        ))}
        <main className="min-w-0 flex-1">
          {main.map((section) => (
            <div key={section.id} data-section-id={section.id} data-section-type={section.type}>{renderSection(section, config)}</div>
          ))}
        </main>
      </div>
    </>
  );
}
