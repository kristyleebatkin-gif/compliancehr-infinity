import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Clock, Lock } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

const DEFAULT_SOFTWARE_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/04a0fc5c9_generated_b2aad3e7.png';

function ExecutiveChairFrontLeftSvg() {
  return (
    <svg viewBox="0 0 130 135" className="h-14 w-14 shrink-0 drop-shadow-sm" aria-label="Executive Chair Back Front Left">
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

function CouchNearFrontDoorSvg() {
  return (
    <svg viewBox="0 0 250 110" className="h-16 w-36 shrink-0 drop-shadow-sm" aria-label="Reception Couch Near Front Door">
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
      {/* 3 Couch Back Cushions */}
      <rect x="20" y="33" width="38" height="26" rx="6" fill="#ffffff" fillOpacity="0.22" />
      <rect x="63" y="33" width="38" height="26" rx="6" fill="#ffffff" fillOpacity="0.22" />
      <rect x="106" y="33" width="38" height="26" rx="6" fill="#ffffff" fillOpacity="0.22" />
      {/* Couch Rolled Armrests */}
      <rect x="4" y="42" width="16" height="36" rx="8" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
      <rect x="144" y="42" width="16" height="36" rx="8" fill="#db2777" stroke="#ffffff" strokeWidth="2" />
      {/* Couch Seat Deck */}
      <rect x="14" y="60" width="136" height="20" rx="8" fill="url(#couchSquished)" stroke="#ffffff" strokeWidth="2.5" />
      {/* Couch Legs */}
      <rect x="20" y="80" width="6" height="14" rx="2" fill="#1e293b" />
      <rect x="138" y="80" width="6" height="14" rx="2" fill="#1e293b" />

      {/* Front Door right next to the Couch */}
      <rect x="174" y="6" width="66" height="94" rx="6" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="3" />
      <rect x="180" y="12" width="54" height="82" rx="4" fill="url(#couchSquished)" stroke="#ffffff" strokeWidth="1.5" />
      {/* Glass Window Panel in Front Door */}
      <rect x="188" y="18" width="38" height="32" rx="4" fill="#e0f2fe" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1.5" />
      <text x="207" y="37" textAnchor="middle" fill="#1e3a8a" fontSize="8" fontWeight="900">WELCOME</text>
      {/* Lower Door Panel */}
      <rect x="188" y="56" width="38" height="30" rx="3" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeWidth="1" />
      {/* Gold Door Handle */}
      <circle cx="226" cy="54" r="3.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

/**
 * Photo Frame ONLY including:
 *   Software: ComplianceHR Infinity
 *   Complete Control. Greater Confidence.
 *   Brighter Success
 */
export function ComplianceHrPhotoFrame({ logoUrl, large = false, badgeLabel = '' }) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;
  return (
    <div
      className={`rounded-2xl p-1.5 shadow-lg ${large ? 'ring-2 ring-amber-300/90' : ''}`}
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div
        className={`rounded-xl border-[3px] border-amber-300 bg-white text-center shadow-inner ${
          large ? 'p-3' : 'p-2'
        }`}
      >
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
        <div
          className={`mx-auto flex items-center justify-center overflow-hidden rounded-xl border-2 border-pink-400 bg-white p-1 shadow-sm ${
            large ? 'h-20 w-28 sm:h-24 sm:w-36' : 'h-12 w-16'
          }`}
        >
          <Image
            src={frameSrc}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </div>
        <div
          className={`mt-1 font-extrabold tracking-tight text-blue-950 ${
            large ? 'text-xs sm:text-sm' : 'text-[11px]'
          }`}
        >
          Software: ComplianceHR Infinity
        </div>
        <div
          className="mt-1 rounded-lg px-2 py-1 text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className={large ? 'text-[11px] font-extrabold leading-tight' : 'text-[9px] font-extrabold leading-tight'}>
            Complete Control. Greater Confidence.
          </div>
          <div className={large ? 'text-[11px] font-extrabold leading-tight' : 'text-[9px] font-extrabold leading-tight'}>
            Brighter Success
          </div>
        </div>
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
            className="flex items-center justify-between rounded-md border border-white px-2 py-1.5 text-white shadow-sm"
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

export default function ExecutiveWallScene({ logoUrl, showAllModulesMinimised = true }) {
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
      className="relative overflow-hidden rounded-2xl border-2 p-2.5 sm:p-3 shadow-panel space-y-2.5"
      style={{
        borderColor: '#7c3aed55',
        background:
          'linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(124,58,237,0.06) 50%, rgba(236,72,153,0.12) 100%)',
      }}
    >
      {/* Squashed Side-by-Side Grid: Left (4 cols = 1x) & Top-Right Colour Area (8 cols = 2x Twice the Size) */}
      <div className="grid gap-2.5 md:grid-cols-12 items-stretch">
        {/* LEFT COLUMN (1x = 4 cols): Top-Left Photo Frame + Front-Left Chair Back + Couch Near Front Door */}
        <div className="md:col-span-4 flex flex-col justify-between gap-2 rounded-xl border-2 border-blue-400/80 bg-white p-2 shadow-sm">
          {/* Top-Left Photo Frame (ONLY ComplianceHR Infinity in exact order) */}
          <ComplianceHrPhotoFrame logoUrl={logoUrl} large={false} />

          {/* Front-Left Chair Back + Couch Near Front Door (Squashed Side by Side) */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-1.5 rounded-xl border p-1.5"
            style={{
              borderColor: '#ec489966',
              background: 'linear-gradient(120deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.06) 50%, rgba(236,72,153,0.12) 100%)',
            }}
          >
            {/* Front Left Chair Back */}
            <div className="flex items-center gap-1.5 rounded-lg bg-white/90 p-1.5 shadow-sm">
              <ExecutiveChairFrontLeftSvg />
              <div className="min-w-0">
                <div className="text-[9px] font-extrabold uppercase text-blue-800">Front Left</div>
                <div className="text-[10px] font-extrabold leading-tight text-blue-950">Chair Back</div>
              </div>
            </div>

            {/* Couch Near Front Door */}
            <div className="flex flex-col items-center justify-center rounded-lg bg-white/90 p-1.5 shadow-sm">
              <CouchNearFrontDoorSvg />
              <div className="text-[9px] font-extrabold text-pink-800 leading-none">
                Couch Near Front Door
              </div>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT COLOUR AREA (2x TWICE THE SIZE = 8 cols): Strict Ordered Text + Copied BIGGER Photo Frame in Top Corner + Clock + 3-Door Cupboard */}
        <div
          className="md:col-span-8 rounded-2xl p-1.5 shadow-lg"
          style={{
            background:
              'linear-gradient(120deg, #2563eb 0%, #0ea5e9 22%, #10b981 38%, #7c3aed 50%, #eab308 64%, #ec4899 100%)',
          }}
        >
          <div
            className="flex h-full flex-col justify-between gap-2 rounded-xl border-2 border-white p-2.5 text-white shadow-inner"
            style={{ background: SQUISHED_GRADIENT }}
          >
            {/* Top Row: Exact Ordered Business/Software/Developer List on Left + BIGGER Copied Photo Frame in Top Corner */}
            <div className="grid gap-2.5 sm:grid-cols-12 items-start">
              {/* STRICT ORDER CARD (7 cols) */}
              <div className="sm:col-span-7 flex flex-col justify-between gap-2 rounded-xl bg-white/95 p-2.5 text-foreground shadow-sm">
                {/* Exact Order Block 1: Software */}
                <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-2 space-y-0.5">
                  <div className="text-xs sm:text-sm font-extrabold text-blue-950">
                    Software: ComplianceHR Infinity
                  </div>
                  <div className="text-[11px] font-extrabold text-violet-800">
                    Complete Control. Greater Confidence.
                  </div>
                  <div className="text-[11px] font-extrabold text-pink-700">
                    Brighter Success
                  </div>
                </div>

                {/* Exact Order Block 2: Our Business Using Software + Developer */}
                <div className="rounded-lg border border-pink-200 bg-pink-50/60 p-2 space-y-0.5 text-[11px] leading-snug">
                  <div className="font-extrabold text-blue-950">
                    Our Business Using Software:
                  </div>
                  <div className="font-extrabold text-violet-900">
                    Choices North Queensland
                  </div>
                  <div className="font-extrabold text-pink-700">
                    Choices NQ
                  </div>
                  <div className="pt-1 font-extrabold text-blue-950">
                    Developer: Kristy Lee Whelan
                  </div>
                  <div className="font-extrabold text-violet-800 break-all">
                    Email: kristyleebatkin@live.com.au
                  </div>
                </div>

                {/* Compact Live Smart Clock bar */}
                <div
                  className="flex items-center justify-between rounded-lg px-2.5 py-1 text-white"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold">
                    <Clock className="h-3 w-3" /> Smart Wall Clock
                  </span>
                  <span className="font-mono text-[11px] font-extrabold">
                    {timeStr} · {dateStr}
                  </span>
                </div>
              </div>

              {/* TOP CORNER: COPIED & BIGGER PHOTO FRAME (5 cols) — ONLY ComplianceHR Infinity */}
              <div className="sm:col-span-5 flex flex-col justify-between gap-2">
                <ComplianceHrPhotoFrame
                  logoUrl={logoUrl}
                  large={true}
                  badgeLabel="Top Corner Frame"
                />
              </div>
            </div>

            {/* Bottom of Top-Right Colour Area: 3-Door Cupboard */}
            <ThreeDoorCupboardCompact />
          </div>
        </div>
      </div>

      {/* Minimised Icons & Modular Names — Display All 45 Platform Modules Squashed to Fit */}
      {showAllModulesMinimised && (
        <div className="rounded-xl border border-violet-300 bg-white/95 p-2 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-950">
              All {MODULE_DIRECTORY.length} Platform Modules · Minimised Icons &amp; Modular Names
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
                <a
                  key={mod.key}
                  href={mod.path}
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
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}