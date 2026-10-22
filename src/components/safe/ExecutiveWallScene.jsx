import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Clock, Lock, Vault, FolderLock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import SilverScreenSplit from '@/components/safe/SilverScreenSplit';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

const DEFAULT_SOFTWARE_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/04a0fc5c9_generated_b2aad3e7.png';

function ExecutiveChairFrontLeftSvg() {
  return (
    <svg viewBox="0 0 130 135" className="h-12 w-12 shrink-0 drop-shadow-sm" aria-label="Executive Chair Back Front Left">
      <defs>
        <linearGradient id="chairBackSquished" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect x="26" y="4" width="78" height="68" rx="16" fill="url(#chairBackSquished)" stroke="#ffffff" strokeWidth="3" />
      <rect x="38" y="10" width="54" height="14" rx="6" fill="#ffffff" fillOpacity="0.3" />
      <line x1="38" y1="36" x2="92" y2="36" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="48" x2="92" y2="48" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="60" x2="92" y2="60" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 50 C10 50, 10 80, 24 84" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
      <path d="M104 50 C120 50, 120 80, 106 84" fill="none" stroke="#db2777" strokeWidth="6" strokeLinecap="round" />
      <rect x="20" y="70" width="90" height="18" rx="9" fill="url(#chairBackSquished)" stroke="#ffffff" strokeWidth="2.5" />
      <rect x="61" y="88" width="8" height="22" rx="2" fill="#1e293b" />
      <path d="M65 110 L28 124 M65 110 L102 124 M65 110 L46 128 M65 110 L84 128 M65 110 L65 129" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="26" cy="126" r="3.5" fill="#2563eb" />
      <circle cx="104" cy="126" r="3.5" fill="#ec4899" />
      <circle cx="46" cy="130" r="3.5" fill="#7c3aed" />
      <circle cx="84" cy="130" r="3.5" fill="#7c3aed" />
      <circle cx="65" cy="131" r="3.5" fill="#ec4899" />
    </svg>
  );
}

export function CouchNearFrontDoorSvg() {
  return (
    <svg viewBox="0 0 250 110" className="h-14 w-32 shrink-0 drop-shadow-sm" aria-label="Reception Couch Near Front Door">
      <defs>
        <linearGradient id="couchSquished" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Plush 3-Seater Couch on Left */}
      <rect x="14" y="28" width="136" height="38" rx="12" fill="url(#couchSquished)" stroke="#ffffff" strokeWidth="2.5" />
      <rect x="20" y="33" width="38" height="26" rx="6" fill="#ffffff" fillOpacity="0.22" />
      <rect x="63" y="33" width="38" height="26" rx="6" fill="#ffffff" fillOpacity="0.22" />
      <rect x="106" y="33" width="38" height="26" rx="6" fill="#ffffff" fillOpacity="0.22" />
      <rect x="4" y="42" width="16" height="36" rx="8" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
      <rect x="144" y="42" width="16" height="36" rx="8" fill="#db2777" stroke="#ffffff" strokeWidth="2" />
      <rect x="14" y="60" width="136" height="20" rx="8" fill="url(#couchSquished)" stroke="#ffffff" strokeWidth="2.5" />
      <rect x="20" y="80" width="6" height="14" rx="2" fill="#1e293b" />
      <rect x="138" y="80" width="6" height="14" rx="2" fill="#1e293b" />
      {/* Front Door right next to the Couch */}
      <rect x="174" y="6" width="66" height="94" rx="6" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="3" />
      <rect x="180" y="12" width="54" height="82" rx="4" fill="url(#couchSquished)" stroke="#ffffff" strokeWidth="1.5" />
      <rect x="188" y="18" width="38" height="32" rx="4" fill="#e0f2fe" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1.5" />
      <text x="207" y="37" textAnchor="middle" fill="#1e3a8a" fontSize="8" fontWeight="900">DOOR</text>
      <rect x="188" y="56" width="38" height="30" rx="3" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeWidth="1" />
      <circle cx="226" cy="54" r="3.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

export function OfficeTechTableSvg() {
  return (
    <svg viewBox="0 0 280 115" className="h-16 w-40 shrink-0 drop-shadow-sm" aria-label="Table with Modern Speaker, iPhone and Computer">
      <defs>
        <linearGradient id="techScreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* 1. Modern Smart Speaker on Left of Table */}
      <rect x="24" y="32" width="34" height="44" rx="14" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
      <ellipse cx="41" cy="37" rx="12" ry="3.5" fill="url(#techScreenGrad)" />
      {/* Speaker Mesh Dots */}
      <circle cx="35" cy="50" r="1.5" fill="#94a3b8" />
      <circle cx="41" cy="50" r="1.5" fill="#94a3b8" />
      <circle cx="47" cy="50" r="1.5" fill="#94a3b8" />
      <circle cx="35" cy="58" r="1.5" fill="#94a3b8" />
      <circle cx="41" cy="58" r="1.5" fill="#94a3b8" />
      <circle cx="47" cy="58" r="1.5" fill="#94a3b8" />

      {/* 2. iPhone in Middle of Table */}
      <rect x="76" y="42" width="24" height="34" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
      <rect x="79" y="45" width="18" height="27" rx="3" fill="url(#techScreenGrad)" />
      <rect x="85" y="46" width="6" height="2" rx="1" fill="#0f172a" />
      <circle cx="88" cy="69" r="1.2" fill="#ffffff" />

      {/* 3. Desktop Computer Monitor & Keyboard on Right of Table */}
      <rect x="122" y="10" width="128" height="54" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
      <rect x="127" y="14" width="118" height="44" rx="3" fill="url(#techScreenGrad)" />
      <text x="186" y="34" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">ComplianceHR</text>
      <text x="186" y="46" textAnchor="middle" fill="#fde047" fontSize="8" fontWeight="800">INFINITY</text>
      {/* Monitor Stand */}
      <rect x="178" y="64" width="16" height="9" fill="#94a3b8" />
      <rect x="164" y="72" width="44" height="4" rx="2" fill="#64748b" />
      {/* Keyboard */}
      <rect x="148" y="75" width="76" height="3" rx="1.5" fill="#e2e8f0" />

      {/* Modern Office Table Surface & Legs */}
      <rect x="8" y="76" width="264" height="9" rx="4" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
      <rect x="24" y="85" width="8" height="26" rx="2" fill="#334155" />
      <rect x="248" y="85" width="8" height="26" rx="2" fill="#334155" />
    </svg>
  );
}

/**
 * Big Logo, Name & Slogan in Left Corner inside Picture Frame:
 *   Software: ComplianceHR Infinity
 *   Complete Control. Greater Confidence.
 *   Brighter Success
 */
export function ComplianceHrPhotoFrame({ logoUrl, large = true, badgeLabel = '' }) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;
  return (
    <div
      className="rounded-2xl p-1.5 shadow-lg ring-2 ring-amber-300/90"
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div className="rounded-xl border-[3px] border-amber-300 bg-white p-2.5 text-center shadow-inner">
        {badgeLabel && (
          <div className="mb-1 flex justify-center">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
              style={{ background: SQUISHED_GRADIENT }}
            >
              {badgeLabel}
            </span>
          </div>
        )}
        {/* Big Logo inside Picture Frame */}
        <div
          className={`mx-auto flex items-center justify-center overflow-hidden rounded-xl border-2 border-pink-400 bg-white p-1.5 shadow-sm ${
            large ? 'h-24 w-36 sm:h-28 sm:w-44' : 'h-16 w-24'
          }`}
        >
          <Image
            src={frameSrc}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="mt-1.5 text-xs sm:text-sm font-extrabold tracking-tight text-blue-950">
          Software: ComplianceHR Infinity
        </div>
        <div
          className="mt-1 rounded-lg px-2 py-1 text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className="text-[10px] sm:text-xs font-extrabold leading-tight">
            Complete Control. Greater Confidence.
          </div>
          <div className="text-[10px] sm:text-xs font-extrabold leading-tight">
            Brighter Success
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmallSafeVaultBar() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-violet-300 bg-white px-3 py-1.5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <Vault className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[11px] font-extrabold text-blue-950">
            Small Safe Vault · Secured Under Inbox &amp; Company Safe
          </div>
          <div className="text-[9px] font-bold text-violet-800">
            All inbox attachments, compliance records, and company safe documents locked &amp; audit-ready
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Link
          to="/company-safe"
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <Lock className="h-3 w-3" /> Open Safe
        </Link>
        <Link
          to="/documents"
          className="inline-flex items-center gap-1 rounded-lg border border-violet-300 bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold text-violet-900 hover:bg-violet-100"
        >
          <FolderLock className="h-3 w-3" /> Document Vault
        </Link>
      </div>
    </div>
  );
}

function ThreeDoorCupboardCompact() {
  const doors = [
    { num: 'Door 1', label: 'Company Safe', color: '#2563eb' },
    { num: 'Door 2', label: 'NDIS & HR', color: '#7c3aed' },
    { num: 'Door 3', label: 'Certificates', color: '#ec4899' },
  ];
  return (
    <div className="rounded-xl border border-white/80 bg-white/95 p-1.5 text-foreground shadow-sm">
      <div className="mb-1 flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-violet-950">
        <span className="inline-flex items-center gap-1">
          <Lock className="h-2.5 w-2.5 text-pink-600" /> 3-Door Cupboard
        </span>
        <span className="text-[8px] font-bold text-pink-700">Secured</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {doors.map((d) => (
          <div
            key={d.num}
            className="flex items-center justify-between rounded-md border border-white px-2 py-1 text-white shadow-sm"
            style={{ background: d.color }}
          >
            <div className="min-w-0">
              <div className="text-[8px] font-bold uppercase text-white/90">{d.num}</div>
              <div className="truncate text-[9px] font-extrabold text-white">{d.label}</div>
            </div>
            <span className="h-3 w-1 shrink-0 rounded-full bg-white" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExecutiveWallScene({ logoUrl, showAllModulesMinimised = true, showRosterAbove = true }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-AU', {
    timeZone: 'Australia/Sydney',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-2 sm:p-2.5 shadow-panel space-y-2"
      style={{
        borderColor: '#7c3aed55',
        background:
          'linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(124,58,237,0.06) 50%, rgba(236,72,153,0.12) 100%)',
      }}
    >
      {/* 1. ROSTER FITTED ABOVE */}
      {showRosterAbove && <RosterMiniOverview />}

      {/* 2. SILVER SCREEN: Live Weather on One Half + NDIS News & Updates on Other Half */}
      <SilverScreenSplit />

      {/* 3. MAIN SQUASHED SCENE: Left Corner Big Logo/Name/Slogan Picture Frame + Couch Near Front Door + Table with Speaker/iPhone/Computer + Top-Right 2x Colour Area */}
      <div className="grid gap-2 md:grid-cols-12 items-stretch">
        {/* LEFT CORNER (5 cols): BIG LOGO, NAME & SLOGAN IN PICTURE FRAME + CHAIR BACK + COUCH NEAR FRONT DOOR */}
        <div className="md:col-span-5 flex flex-col justify-between gap-2 rounded-xl border-2 border-blue-400/80 bg-white p-2 shadow-sm">
          {/* Big Logo, Name, Slogan in Left Corner inside Picture Frame */}
          <ComplianceHrPhotoFrame
            logoUrl={logoUrl}
            large={true}
            badgeLabel="Top-Left Corner Picture Frame"
          />

          {/* Couch Near Front Door + Front-Left Chair Back */}
          <div
            className="grid grid-cols-2 gap-1.5 rounded-xl border p-1.5"
            style={{
              borderColor: '#ec489966',
              background: 'linear-gradient(120deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.06) 50%, rgba(236,72,153,0.12) 100%)',
            }}
          >
            <div className="flex items-center gap-1.5 rounded-lg bg-white/95 p-1.5 shadow-sm">
              <ExecutiveChairFrontLeftSvg />
              <div className="min-w-0">
                <div className="text-[9px] font-extrabold uppercase text-blue-800">Front Left</div>
                <div className="text-[10px] font-extrabold leading-tight text-blue-950">Chair Back</div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-white/95 p-1 shadow-sm">
              <CouchNearFrontDoorSvg />
              <div className="text-[9px] font-extrabold text-pink-800 leading-none">
                Couch Near Front Door
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLOUR AREA (7 cols): Exact Ordered Text + Table with Modern Speaker, iPhone & Computer + 3-Door Cupboard */}
        <div
          className="md:col-span-7 rounded-2xl p-1.5 shadow-lg"
          style={{
            background:
              'linear-gradient(120deg, #2563eb 0%, #0ea5e9 22%, #10b981 38%, #7c3aed 50%, #eab308 64%, #ec4899 100%)',
          }}
        >
          <div
            className="flex h-full flex-col justify-between gap-2 rounded-xl border-2 border-white p-2 text-white shadow-inner"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <div className="grid gap-2 sm:grid-cols-12 items-stretch">
              {/* STRICT ORDERED BUSINESS & DEVELOPER DETAILS (7 cols) */}
              <div className="sm:col-span-7 flex flex-col justify-between gap-1.5 rounded-xl bg-white/95 p-2 text-foreground shadow-sm">
                <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-2 py-1 space-y-0.5">
                  <div className="text-xs font-extrabold text-blue-950">
                    Software: ComplianceHR Infinity
                  </div>
                  <div className="text-[10px] font-extrabold text-violet-800">
                    Complete Control. Greater Confidence.
                  </div>
                  <div className="text-[10px] font-extrabold text-pink-700">
                    Brighter Success
                  </div>
                </div>

                <div className="rounded-lg border border-pink-200 bg-pink-50/60 px-2 py-1 space-y-0.5 text-[10px] leading-snug">
                  <div className="font-extrabold text-blue-950">
                    Our Business Using Software:
                  </div>
                  <div className="font-extrabold text-violet-900">
                    Choices North Queensland
                  </div>
                  <div className="font-extrabold text-pink-700">
                    Choices NQ
                  </div>
                  <div className="pt-0.5 font-extrabold text-blue-950">
                    Developer: Kristy Lee Whelan
                  </div>
                  <div className="font-extrabold text-violet-800 break-all">
                    Email: kristyleebatkin@live.com.au
                  </div>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg px-2 py-1 text-white"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold">
                    <Clock className="h-3 w-3" /> Smart Clock
                  </span>
                  <span className="font-mono text-[10px] font-extrabold">
                    {timeStr} · {dateStr}
                  </span>
                </div>
              </div>

              {/* TABLE WITH MODERN SPEAKER, IPHONE & COMPUTER + COPIED PHOTO FRAME (5 cols) */}
              <div className="sm:col-span-5 flex flex-col justify-between gap-1.5">
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-white bg-white/95 p-2 text-center text-foreground shadow-sm">
                  <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wider text-violet-900">
                    Table · Speaker · iPhone · Computer
                  </div>
                  <OfficeTechTableSvg />
                  <div className="mt-1 text-[9px] font-bold text-blue-950">
                    Modern Speaker · iPhone · Computer
                  </div>
                </div>

                <ThreeDoorCupboardCompact />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ALL 45 MODULARS — MINIMISED ICONS & NAMES */}
      {showAllModulesMinimised && (
        <div className="rounded-xl border border-violet-300 bg-white/95 p-2 shadow-sm">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-950">
              All {MODULE_DIRECTORY.length} Modulars · Minimised Icons &amp; Names
            </span>
            <span className="text-[9px] font-extrabold text-pink-700">
              Complete Control. Greater Confidence. Brighter Success
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 md:grid-cols-9">
            {MODULE_DIRECTORY.map((mod) => {
              const Icon = mod.icon;
              const colour = moduleKeyColour(mod.key);
              return (
                <Link
                  key={mod.key}
                  to={mod.path}
                  className="flex items-center gap-1 rounded-md border px-1.5 py-1 text-left transition-transform hover:-translate-y-0.5"
                  style={{
                    borderColor: `${colour}55`,
                    background: `linear-gradient(135deg, ${colour}18 0%, #ffffff 90%)`,
                  }}
                  title={mod.label}
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white"
                    style={{ background: colour }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <span className="truncate text-[9px] font-extrabold text-foreground leading-none">
                    {mod.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SMALL VAULT AT BOTTOM */}
      <SmallSafeVaultBar />
    </div>
  );
}