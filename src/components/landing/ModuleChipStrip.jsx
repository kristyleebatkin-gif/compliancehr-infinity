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
      {[1, 2, 3].map((num, idx) => (
        <div key={num} className="flex flex-col items-center">
          <span
            className={`rounded-t-full border-2 chr-siren-light-${num}`}
            style={{ width: '1.5cm', height: '1.5cm', borderColor: getAppBorderView(idx) }}
          />
          <span
            className="h-2 rounded-full shadow-sm"
            style={{ width: '1.85cm', background: getHeaderView(idx) }}
          />
        </div>
      ))}
    </div>
  );
}

function IpadModuleScreenCard({ item, idx }) {
  const Icon = item.icon;
  const borderCol = getAppBorderView(idx);
  const sym = getSymbolView(idx);
  const bullets = getModuleBulletPoints(item);

  return (
    <Link
      to={item.path}
      title={item.blurb}
      className="group relative flex w-[148px] sm:w-[162px] h-[92px] shrink-0 flex-col justify-between rounded-[11px] border p-1 shadow-2xs transition-transform hover:-translate-y-0.5 hover:shadow-sm"
      style={{
        borderColor: borderCol,
        background: getHeaderView(idx),
      }}
    >
      {/* Top iPad Bezel Camera & Status Bar in App-Design Colour */}
      <div className="mb-0.5 flex h-[12px] items-center justify-between px-1">
        <span className="rounded-full bg-white px-1 py-0 text-[5.5px] font-extrabold uppercase tracking-wider" style={{ color: sym.iconColor }}>
          IPAD #{String(idx + 1).padStart(2, '0')}
        </span>
        <span
          className="h-1.5 w-1.5 rounded-full bg-white"
          style={{ boxShadow: '0 0 5px 1px #FFFFFF' }}
        />
        <span className="text-[6px] font-extrabold text-white" style={{ color: '#FFFFFF' }}>
          LIVE
        </span>
      </div>

      {/* Inner iPad Display Screen — Pure White Inside Writing Box */}
      <div className="flex flex-1 flex-col justify-between gap-0.5 rounded-[8px] bg-white p-0.5 text-left">
        {/* App-Coloured Header Bar With Coloured Symbol */}
        <div
          className="gradient-brand flex min-h-[16px] w-full items-center justify-center gap-0.5 rounded px-1 py-0 text-center text-white"
          style={{ background: getHeaderView(idx + 1), color: '#FFFFFF' }}
        >
          <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-white">
            <Icon className="h-1.5 w-1.5" style={{ color: sym.iconColor }} />
          </span>
          <span
            className="min-w-0 flex-1 truncate text-center text-[7px] font-extrabold leading-tight text-white"
            style={{ color: '#FFFFFF' }}
          >
            {item.label}
          </span>
        </div>

        {/* Pure White Writing Box */}
        <div className="flex flex-1 items-center rounded border border-[#0A2B6D]/20 bg-white px-1 py-0">
          <ul className="w-full space-y-0.5">
            {bullets.slice(0, 2).map((point, bIdx) => (
              <li key={bIdx} className="flex items-center gap-0.5 text-[6px] font-extrabold leading-tight text-[#0A2B6D]">
                <CheckCircle2 className="h-1.5 w-1.5 shrink-0 text-[#0A2B6D]" />
                <span className="min-w-0 flex-1 truncate text-[#0A2B6D]">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
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

        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-3 sm:px-4 sm:py-4 text-center space-y-2.5 overflow-hidden">
          {/* Top Header in Border */}
          <div
            className="w-full rounded-xl border border-[#0A2B6D] p-2 shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="flex w-full flex-col items-center justify-center rounded-lg border border-[#0A2B6D] bg-white px-4 py-3 sm:px-6 sm:py-4 text-center space-y-1.5">
              <h2 className="mx-auto text-center font-editorial text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
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
                className="h-1.5 w-full rounded-full"
                style={{ background: TOP_BORDER_GRADIENT }}
              />
            </div>
          </div>

          {/* Stretched Full-Width Header: ComplianceHR Infinity App Modules (48 Live iPads) */}
          <div
            className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-xl border border-[#0A2B6D] px-4 py-1.5 font-editorial text-sm sm:text-lg md:text-xl font-extrabold tracking-wide text-white shadow-2xs"
            style={{ background: getHeaderView(3) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
              <Layers className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-center">
              ComplianceHR Infinity App Modules ({fullGridItems.length} Live iPads)
            </span>
          </div>

          {/* Row 1 of Live iPads */}
          <div className="w-full overflow-hidden py-0.5">
            <div className="chr-ipad-row-1 gap-2">
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
          <div className="w-full overflow-hidden py-0.5">
            <div className="chr-ipad-row-2 gap-2">
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
          <div className="w-full overflow-hidden py-0.5">
            <div className="chr-ipad-row-3 gap-2">
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