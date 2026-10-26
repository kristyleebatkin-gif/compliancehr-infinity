import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { getHeaderView, getAppBorderView, getSymbolView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

// Split a module blurb into 2–3 concise list items so it displays in list order inside the iPad screen
function getModuleBulletPoints(item) {
  const raw = String(item.blurb || '')
    .split(/[,.;]+|\s+and\s+|\s+with\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  if (raw.length >= 2) {
    return raw.slice(0, 3).map((line) => line.charAt(0).toUpperCase() + line.slice(1));
  }
  return [
    item.blurb || `${item.label} workspace`,
    'Live compliance & audit ready',
  ];
}

// Three 1.5cm siren-like dome lights centred on top of the main iPad section border (Green, Orange, Red slowly changing colours)
function ThreeTopSirenLights() {
  return (
    <div className="flex items-end justify-center gap-5" aria-hidden="true">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex flex-col items-center">
          <span
            className={`rounded-t-full border-[3px] border-[#0A2B6D] chr-siren-light-${num}`}
            style={{ width: '1.5cm', height: '1.5cm' }}
          />
          <span
            className="h-2 rounded-full bg-[#0A2B6D] shadow-sm"
            style={{ width: '1.85cm' }}
          />
        </div>
      ))}
    </div>
  );
}

function IpadModuleScreenCard({ item, idx }) {
  const Icon = item.icon;
  const sym = getSymbolView(idx);
  const borderCol = getAppBorderView(idx);
  const bullets = getModuleBulletPoints(item);

  return (
    <Link
      to={item.path}
      title={item.blurb}
      className="group relative flex w-[285px] sm:w-[310px] h-[220px] shrink-0 flex-col justify-between rounded-[24px] border-[3px] bg-[#0A2B6D] p-2.5 shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: borderCol }}
    >
      {/* Top iPad Bezel Camera & Status Bar (Removed "View") */}
      <div className="mb-1.5 flex h-[16px] items-center justify-between px-2">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/90">
          IPAD #{String(idx + 1).padStart(2, '0')}
        </span>
        <span className="h-2 w-2 rounded-full bg-[#00C6FF]" />
        <span className="text-[9px] font-extrabold text-white/90">LIVE</span>
      </div>

      {/* Inner iPad Display Screen — All Sections Lined Up With Neighbouring iPads */}
      <div
        className="grid flex-1 grid-cols-1 grid-rows-[50px_1fr] gap-2 rounded-[16px] border-2 bg-white p-2.5 text-left"
        style={{ borderColor: borderCol }}
      >
        {/* Top Section: White Frame with App-Design Coloured Symbol & App-Design Coloured Words */}
        <div
          className="flex h-[50px] w-full rounded-xl p-[2.5px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex h-full w-full items-center justify-center gap-2 rounded-[9px] bg-white px-2.5 py-1 text-center">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
              style={{ borderColor: borderCol }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
            </span>
            <span
              className="min-w-0 flex-1 whitespace-normal break-words text-center text-xs font-extrabold leading-tight"
              style={{ color: sym.iconColor }}
            >
              {item.label}
            </span>
          </div>
        </div>

        {/* Bottom Section: Lined-Up Bullet Points with App-Design Coloured Symbols & Words */}
        <div
          className="flex h-full w-full rounded-xl p-[2px]"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <ul className="flex h-full w-full flex-col justify-center gap-1 rounded-[9px] bg-white px-2.5 py-1.5">
            {bullets.slice(0, 2).map((point, bIdx) => {
              const bSym = getSymbolView(idx + bIdx + 1);
              return (
                <li key={bIdx} className="flex items-center gap-2 text-[10.5px] font-extrabold leading-tight">
                  <span
                    className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                    style={{ borderColor: getAppBorderView(idx + bIdx + 1) }}
                  >
                    <CheckCircle2 className="h-2.5 w-2.5" style={{ color: bSym.iconColor }} />
                  </span>
                  <span className="min-w-0 flex-1 whitespace-normal break-words text-[#5A00D6]">
                    {point}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Bottom iPad Home Indicator Bar */}
      <div className="mt-1.5 flex h-[8px] items-center justify-center">
        <span className="h-1 w-12 rounded-full bg-white/80" />
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
      blurb: 'Executive oversight, role-based workspaces, and live compliance metrics.',
    },
    {
      key: 'landing-page-bottom-right',
      label: 'Landing Page',
      path: '/',
      icon: Home,
      blurb: 'Main ComplianceHR Infinity overview, express audits, and pricing hub.',
    },
  ];

  // Split into 3 rows of live iPads
  const third = Math.ceil(fullGridItems.length / 3);
  const row1 = fullGridItems.slice(0, third);
  const row2 = fullGridItems.slice(third, third * 2);
  const row3 = fullGridItems.slice(third * 2);

  return (
    <div className="w-full pt-3">
      {/* Three 1.5cm Siren-Like Lights Centred on Top of the Main iPad Section Border Only */}
      <div className="mb-1.5 flex justify-center">
        <ThreeTopSirenLights />
      </div>

      <div
        className="w-full rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <style>{`
          @keyframes chr-ipad-left-to-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          @keyframes chr-siren-cycle {
            0%, 100% {
              background-color: #10B981;
              box-shadow: 0 0 18px 4px rgba(16, 185, 129, 0.85), inset 0 4px 10px rgba(255, 255, 255, 0.65);
            }
            33% {
              background-color: #F97316;
              box-shadow: 0 0 18px 4px rgba(249, 115, 22, 0.85), inset 0 4px 10px rgba(255, 255, 255, 0.65);
            }
            66% {
              background-color: #EF4444;
              box-shadow: 0 0 18px 4px rgba(239, 68, 68, 0.85), inset 0 4px 10px rgba(255, 255, 255, 0.65);
            }
          }
          .chr-siren-light-1 {
            animation: chr-siren-cycle 6s ease-in-out infinite;
          }
          .chr-siren-light-2 {
            animation: chr-siren-cycle 6s ease-in-out infinite 2s;
          }
          .chr-siren-light-3 {
            animation: chr-siren-cycle 6s ease-in-out infinite 4s;
          }
          .chr-ipad-row-1 {
            display: flex;
            width: max-content;
            animation: chr-ipad-left-to-right 75s linear infinite;
          }
          .chr-ipad-row-2 {
            display: flex;
            width: max-content;
            animation: chr-ipad-left-to-right 85s linear infinite;
          }
          .chr-ipad-row-3 {
            display: flex;
            width: max-content;
            animation: chr-ipad-left-to-right 95s linear infinite;
          }
          .chr-ipad-row-1:hover,
          .chr-ipad-row-2:hover,
          .chr-ipad-row-3:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-5 sm:px-6 sm:py-6 text-center space-y-4 overflow-hidden">
          {/* Top Header in Border with Enlarged "All ComplianceHR modules are Live, Effortless and Simple." */}
          <div
            className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3.5 sm:p-4 shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white px-6 py-6 sm:px-10 sm:py-8 text-center space-y-3">
              <h2 className="mx-auto text-center font-editorial text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="text-[#0A2B6D]">All Compliance</span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="text-[#0A2B6D]">Modules Are </span>
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Live, Effortless and Simple.
                </span>
              </h2>
              <div
                className="h-2 w-full rounded-full"
                style={{ background: TOP_BORDER_GRADIENT }}
              />
            </div>
          </div>

          {/* Stretched Full-Width Header: ComplianceHR Infinity App Modules (48 Live iPads) */}
          <div
            className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#0A2B6D] px-6 py-2.5 font-editorial text-lg sm:text-2xl md:text-3xl font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: getHeaderView(3) }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Layers className="h-4.5 w-4.5 text-white" />
            </span>
            <span className="text-center">
              ComplianceHR Infinity App Modules ({fullGridItems.length} Live iPads)
            </span>
          </div>

          {/* Row 1 of Live iPads */}
          <div className="w-full overflow-hidden py-1">
            <div className="chr-ipad-row-1 gap-3.5">
              {[...row1, ...row1].map((item, idx) => (
                <IpadModuleScreenCard
                  key={`r1-${item.key}-${idx}`}
                  item={item}
                  idx={idx % row1.length}
                />
              ))}
            </div>
          </div>

          {/* Row 2 of Live iPads */}
          <div className="w-full overflow-hidden py-1">
            <div className="chr-ipad-row-2 gap-3.5">
              {[...row2, ...row2].map((item, idx) => (
                <IpadModuleScreenCard
                  key={`r2-${item.key}-${idx}`}
                  item={item}
                  idx={(idx % row2.length) + 2}
                />
              ))}
            </div>
          </div>

          {/* Row 3 of Live iPads */}
          <div className="w-full overflow-hidden py-1">
            <div className="chr-ipad-row-3 gap-3.5">
              {[...row3, ...row3].map((item, idx) => (
                <IpadModuleScreenCard
                  key={`r3-${item.key}-${idx}`}
                  item={item}
                  idx={(idx % row3.length) + 5}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}