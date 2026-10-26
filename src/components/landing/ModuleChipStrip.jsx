import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Layers } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

function IpadModuleScreenCard({ item, idx }) {
  const Icon = item.icon;
  const sym = getSymbolView(idx);
  const borderCol = getAppBorderView(idx);

  return (
    <Link
      to={item.path}
      title={item.blurb}
      className="group relative flex w-[230px] sm:w-[250px] shrink-0 flex-col justify-between rounded-[22px] border-[3px] bg-[#0A2B6D] p-2 shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: borderCol }}
    >
      {/* Top iPad Camera Dot & Status Bar */}
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-[8px] font-extrabold uppercase tracking-wider text-white/80">
          iPad Live View
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
        <span className="text-[8px] font-extrabold text-white/80">100%</span>
      </div>

      {/* Inner iPad Display Screen */}
      <div
        className="flex flex-1 flex-col justify-between rounded-[14px] border-2 bg-white p-2.5 text-left space-y-2"
        style={{ borderColor: borderCol }}
      >
        {/* Module Title with White Background & App-Coloured Border */}
        <div
          className="flex items-center gap-2 rounded-xl border-2 bg-white px-2.5 py-1.5 shadow-2xs"
          style={{ borderColor: borderCol }}
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white"
            style={{ borderColor: borderCol }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
          </span>
          <span className="min-w-0 flex-1 whitespace-normal break-words text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
            {item.label}
          </span>
        </div>

        {/* Short Description Inside the iPad Screen */}
        <p className="line-clamp-2 text-[10px] font-bold leading-snug text-[#0072FF]">
          {item.blurb}
        </p>
      </div>

      {/* Bottom iPad Home Indicator Bar */}
      <div className="mt-1.5 flex justify-center">
        <span className="h-1 w-10 rounded-full bg-white/75" />
      </div>
    </Link>
  );
}

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
      label: 'Dashboard',
      path: '/dashboard',
      icon: Sparkles,
      blurb: 'Open ComplianceHR Infinity Executive & Role-Based Dashboard.',
    },
    {
      key: 'landing-page-bottom-right',
      label: 'Landing Page',
      path: '/',
      icon: Home,
      blurb: 'Main ComplianceHR Infinity Overview, Audits & Pricing Hub.',
    },
  ];

  // Split into 2 rows of iPad screens that slowly glide from left to right
  const half = Math.ceil(fullGridItems.length / 2);
  const row1 = fullGridItems.slice(0, half);
  const row2 = fullGridItems.slice(half);

  return (
    <div
      className="w-full rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <style>{`
        @keyframes chr-ipad-left-to-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .chr-ipad-marquee-ltr {
          display: flex;
          width: max-content;
          animation: chr-ipad-left-to-right 85s linear infinite;
        }
        .chr-ipad-marquee-ltr-slow {
          display: flex;
          width: max-content;
          animation: chr-ipad-left-to-right 95s linear infinite;
        }
        .chr-ipad-marquee-ltr:hover,
        .chr-ipad-marquee-ltr-slow:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-4 sm:px-5 sm:py-5 text-center space-y-4 overflow-hidden">
        {/* Stretched Full-Width Header: ComplianceHR infinity App Modules (Live) */}
        <div
          className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(3) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Layers className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">ComplianceHR infinity App Modules (Live)</span>
        </div>

        {/* Row 1 of iPad Screens Slowly Gliding from Left to Right */}
        <div className="w-full overflow-hidden py-1">
          <div className="chr-ipad-marquee-ltr gap-3">
            {[...row1, ...row1].map((item, idx) => (
              <IpadModuleScreenCard
                key={`r1-${item.key}-${idx}`}
                item={item}
                idx={idx % row1.length}
              />
            ))}
          </div>
        </div>

        {/* Row 2 of iPad Screens Slowly Gliding from Left to Right */}
        <div className="w-full overflow-hidden py-1">
          <div className="chr-ipad-marquee-ltr-slow gap-3">
            {[...row2, ...row2].map((item, idx) => (
              <IpadModuleScreenCard
                key={`r2-${item.key}-${idx}`}
                item={item}
                idx={(idx % row2.length) + 3}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}