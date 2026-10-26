import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Layers } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

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
      isAppColoured: true,
      appGradient: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
      blurb: 'Open ComplianceHR Infinity Dashboard',
    },
    {
      key: 'landing-page-bottom-right',
      label: 'Landing Page',
      path: '/',
      icon: Home,
      isAppColoured: true,
      appGradient: 'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
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
          style={{ background: BADGE_GRADIENT }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
            <Layers className="h-3.5 w-3.5 text-[#FF2E9A]" />
          </span>
          <span className="text-center">All {MODULE_DIRECTORY.length} Live App Modules · 6 Per Line</span>
        </span>

        {/* Every module pill has identical equal-size dimensions and circular app-gradient icons on crisp white */}
        <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
          {fullGridItems.map((m) => {
            const Icon = m.icon;

            if (m.isAppColoured) {
              return (
                <Link
                  key={m.key}
                  to={m.path}
                  title={m.blurb}
                  className="group flex h-full min-h-[42px] w-full items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3 py-1.5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: m.appGradient }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6] shadow-2xs">
                    <Icon className="h-3 w-3 text-[#5A00D6]" />
                  </span>
                  <span className="min-w-0 flex-1 whitespace-normal break-words text-left text-[10px] lg:text-[11px] font-extrabold leading-tight text-white">
                    {m.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={m.key}
                to={m.path}
                title={m.blurb}
                className="group flex h-full min-h-[42px] w-full items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
                  style={{ background: ICON_GRADIENT }}
                >
                  <Icon className="h-3 w-3 text-white" />
                </span>
                <span className="min-w-0 flex-1 whitespace-normal break-words text-left text-[10px] lg:text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
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