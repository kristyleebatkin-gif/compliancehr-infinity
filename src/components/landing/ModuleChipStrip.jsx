import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Layers } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { getTilePalette, getHeaderView, getSymbolView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

export default function ModuleChipStrip() {
  const fullGridItems = [
    ...MODULE_DIRECTORY.map((m) => ({
      key: m.key,
      label: m.label,
      path: m.path,
      icon: m.icon,
      blurb: m.blurb,
    })),
    {
      key: 'open-dashboard-app-colours',
      label: 'Open Dashboard',
      path: '/dashboard',
      icon: Sparkles,
      blurb: 'Open ComplianceHR Infinity Dashboard',
    },
    {
      key: 'landing-page-bottom-right',
      label: 'Landing Page',
      path: '/',
      icon: Home,
      blurb: 'Main ComplianceHR Infinity Landing Page',
    },
  ];

  return (
    <div
      className="w-full rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-5 sm:px-5 sm:py-5 text-center space-y-4">
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(3) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Layers className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">All {MODULE_DIRECTORY.length} Live App Modules · 6 Per Line</span>
        </span>

        {/* Every module pill in mixed full colour (Light Pink, Medium Pink, Dark Pink, Light Purple, Medium Purple, Violet, Light Blue, Medium Blue) */}
        <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
          {fullGridItems.map((m, idx) => {
            const Icon = m.icon;
            const tile = getTilePalette(idx);
            const sym = getSymbolView(idx);

            return (
              <Link
                key={m.key}
                to={m.path}
                title={m.blurb}
                className="group flex h-full min-h-[42px] w-full items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: tile.bg, color: tile.text }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs">
                  <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                </span>
                <span
                  className="min-w-0 flex-1 whitespace-normal break-words text-left text-[10px] lg:text-[11px] font-extrabold leading-tight"
                  style={{ color: tile.text }}
                >
                  {m.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}