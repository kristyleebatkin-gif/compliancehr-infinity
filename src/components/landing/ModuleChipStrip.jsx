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
      className="group relative flex w-[180px] sm:w-[195px] h-[114px] shrink-0 flex-col justify-between rounded-[14px] border-2 p-1.5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderColor: borderCol,
        background: getHeaderView(idx),
      }}
    >
      {/* Top iPad Bezel Camera & Status Bar in App-Design Colour */}
      <div className="mb-1 flex h-[14px] items-center justify-between px-1">
        <span className="rounded-full bg-white px-1.5 py-0 text-[6.5px] font-extrabold uppercase tracking-wider" style={{ color: sym.iconColor }}>
          IPAD #{String(idx + 1).padStart(2, '0')}
        </span>
        <span
          className="h-2 w-2 rounded-full bg-white"
          style={{ boxShadow: '0 0 6px 2px #FFFFFF' }}
        />
        <span className="text-[7px] font-extrabold text-white" style={{ color: '#FFFFFF' }}>
          LIVE
        </span>
      </div>

      {/* Inner iPad Display Screen — Pink/Blue/Purple Spray Between Borders & Pure White Inside Writing Box */}
      <div
        className="flex flex-1 flex-col justify-between gap-1 rounded-[10px] p-1 text-left"
        style={{
          background:
            'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.68) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.68) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.68) 0%, transparent 52%), #FFFFFF',
        }}
      >
        {/* App-Coloured Header Bar With Coloured Symbol */}
        <div
          className="gradient-brand flex min-h-[20px] w-full items-center justify-center gap-1 rounded-md px-1.5 py-0.5 text-center text-white"
          style={{ background: getHeaderView(idx + 1), color: '#FFFFFF' }}
        >
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white">
            <Icon className="h-2 w-2" style={{ color: sym.iconColor }} />
          </span>
          <span
            className="min-w-0 flex-1 truncate text-center text-[8px] font-extrabold leading-tight text-white"
            style={{ color: '#FFFFFF' }}
          >
            {item.label}
          </span>
        </div>

        {/* Pure White Writing Box Framed in App-Design Border With Dark Blue Writing */}
        <div
          className="flex flex-1 rounded-md p-[1.5px]"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-1 items-center rounded-[4px] bg-white px-1.5 py-0.5">
            <ul className="w-full space-y-0.5">
              {bullets.slice(0, 2).map((point, bIdx) => (
                <li key={bIdx} className="flex items-center gap-1 text-[7px] font-extrabold leading-tight text-[#0A2B6D]">
                  <CheckCircle2 className="h-2 w-2 shrink-0" style={{ color: getSymbolView(idx + bIdx).iconColor }} />
                  <span className="min-w-0 flex-1 truncate text-[#0A2B6D]">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
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

        <div
          className="flex w-full flex-col items-center justify-center rounded-[16px] px-3 py-5 sm:px-6 sm:py-6 text-center space-y-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.65) 0%, transparent 52%), #FFFFFF',
          }}
        >
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