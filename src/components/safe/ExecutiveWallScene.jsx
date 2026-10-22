import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Clock, Lock, Vault, FolderLock, MessagesSquare, Inbox, Siren, History, Mail, NotebookPen, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import SilverScreenSplit from '@/components/safe/SilverScreenSplit';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

const DEFAULT_SOFTWARE_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/04a0fc5c9_generated_b2aad3e7.png';

function ExecutiveChairFrontLeftSvg() {
  return (
    <svg viewBox="0 0 130 135" className="h-11 w-11 shrink-0" aria-label="Executive Chair Back Front Left">
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
      <rect x="38" y="10" width="54" height="14" rx="6" fill="#ffffff" />
      <line x1="38" y1="36" x2="92" y2="36" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="48" x2="92" y2="48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="60" x2="92" y2="60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 50 C10 50, 10 80, 24 84" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
      <path d="M104 50 C120 50, 120 80, 106 84" fill="none" stroke="#db2777" strokeWidth="6" strokeLinecap="round" />
      <rect x="20" y="70" width="90" height="18" rx="9" fill="url(#chairBackSquished)" stroke="#ffffff" strokeWidth="2.5" />
      <rect x="61" y="88" width="8" height="22" rx="2" fill="#1e3a8a" />
      <path d="M65 110 L28 124 M65 110 L102 124 M65 110 L46 128 M65 110 L84 128 M65 110 L65 129" stroke="#1e3a8a" strokeWidth="4.5" strokeLinecap="round" />
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
    <svg viewBox="0 0 250 110" className="h-12 w-28 shrink-0" aria-label="Reception Couch Near Front Door">
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
      <rect x="20" y="33" width="38" height="26" rx="6" fill="#dbeafe" />
      <rect x="63" y="33" width="38" height="26" rx="6" fill="#ede9fe" />
      <rect x="106" y="33" width="38" height="26" rx="6" fill="#fce7f3" />
      <rect x="4" y="42" width="16" height="36" rx="8" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
      <rect x="144" y="42" width="16" height="36" rx="8" fill="#db2777" stroke="#ffffff" strokeWidth="2" />
      <rect x="14" y="60" width="136" height="20" rx="8" fill="url(#couchSquished)" stroke="#ffffff" strokeWidth="2.5" />
      <rect x="20" y="80" width="6" height="14" rx="2" fill="#1e3a8a" />
      <rect x="138" y="80" width="6" height="14" rx="2" fill="#1e3a8a" />
      {/* Front Door right next to the Couch */}
      <rect x="174" y="6" width="66" height="94" rx="6" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="3" />
      <rect x="180" y="12" width="54" height="82" rx="4" fill="url(#couchSquished)" stroke="#ffffff" strokeWidth="1.5" />
      <rect x="188" y="18" width="38" height="32" rx="4" fill="#e0f2fe" stroke="#ffffff" strokeWidth="1.5" />
      <text x="207" y="37" textAnchor="middle" fill="#1e3a8a" fontSize="8" fontWeight="900">DOOR</text>
      <rect x="188" y="56" width="38" height="30" rx="3" fill="#ede9fe" stroke="#ffffff" strokeWidth="1" />
      <circle cx="226" cy="54" r="3.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

export function OfficeTechTableSvg() {
  return (
    <svg viewBox="0 0 280 115" className="h-14 w-36 shrink-0" aria-label="Table with Modern Speaker, iPhone and Computer">
      <defs>
        <linearGradient id="techScreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* 1. Modern Smart Speaker on Left of Table */}
      <rect x="24" y="32" width="34" height="44" rx="14" fill="#1e3a8a" stroke="#ec4899" strokeWidth="2" />
      <ellipse cx="41" cy="37" rx="12" ry="3.5" fill="url(#techScreenGrad)" />
      <circle cx="35" cy="50" r="1.5" fill="#ffffff" />
      <circle cx="41" cy="50" r="1.5" fill="#ffffff" />
      <circle cx="47" cy="50" r="1.5" fill="#ffffff" />
      <circle cx="35" cy="58" r="1.5" fill="#ffffff" />
      <circle cx="41" cy="58" r="1.5" fill="#ffffff" />
      <circle cx="47" cy="58" r="1.5" fill="#ffffff" />

      {/* 2. iPhone in Middle of Table */}
      <rect x="76" y="42" width="24" height="34" rx="5" fill="#1e3a8a" stroke="#38bdf8" strokeWidth="2" />
      <rect x="79" y="45" width="18" height="27" rx="3" fill="url(#techScreenGrad)" />
      <rect x="85" y="46" width="6" height="2" rx="1" fill="#ffffff" />
      <circle cx="88" cy="69" r="1.2" fill="#ffffff" />

      {/* 3. Desktop Computer Monitor & Keyboard on Right of Table */}
      <rect x="122" y="10" width="128" height="54" rx="6" fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" />
      <rect x="127" y="14" width="118" height="44" rx="3" fill="url(#techScreenGrad)" />
      <text x="186" y="34" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">ComplianceHR</text>
      <text x="186" y="46" textAnchor="middle" fill="#fde047" fontSize="8" fontWeight="800">INFINITY</text>
      <rect x="178" y="64" width="16" height="9" fill="#93c5fd" />
      <rect x="164" y="72" width="44" height="4" rx="2" fill="#2563eb" />
      <rect x="148" y="75" width="76" height="3" rx="1.5" fill="#dbeafe" />

      {/* Modern Office Table Surface & Legs */}
      <rect x="8" y="76" width="264" height="9" rx="4" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
      <rect x="24" y="85" width="8" height="26" rx="2" fill="#1e3a8a" />
      <rect x="248" y="85" width="8" height="26" rx="2" fill="#1e3a8a" />
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
      className="rounded-2xl p-1.5 shadow-md ring-2 ring-amber-300"
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div className="rounded-xl border-[3px] border-amber-300 bg-white p-2 text-center">
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
          className={`mx-auto flex items-center justify-center overflow-hidden rounded-xl border-2 border-pink-400 bg-white p-1.5 ${
            large ? 'h-20 w-32 sm:h-24 sm:w-40' : 'h-14 w-24'
          }`}
        >
          <Image
            src={frameSrc}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="mt-1 text-xs sm:text-sm font-extrabold tracking-tight text-blue-950">
          Software: ComplianceHR Infinity
        </div>
        <div
          className="mt-1 rounded-lg px-2 py-1 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className="text-[10px] font-extrabold leading-tight">
            Complete Control. Greater Confidence.
          </div>
          <div className="text-[10px] font-extrabold leading-tight">
            Brighter Success
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmallSafeVaultBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-violet-300 bg-white px-2.5 py-1.5">
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <Vault className="h-3.5 w-3.5" />
        </span>
        <div>
          <div className="text-[10px] font-extrabold text-blue-950">
            Small Safe Vault · Under Inbox &amp; Company Safe
          </div>
          <div className="text-[9px] font-bold text-violet-800">
            Inbox &amp; safe records locked and audit-ready
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Link
          to="/company-safe"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-extrabold text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <Lock className="h-2.5 w-2.5" /> Safe
        </Link>
        <Link
          to="/documents"
          className="inline-flex items-center gap-1 rounded-lg border border-violet-300 bg-violet-50 px-2 py-0.5 text-[9px] font-extrabold text-violet-900 hover:bg-violet-100"
        >
          <FolderLock className="h-2.5 w-2.5" /> Vault
        </Link>
      </div>
    </div>
  );
}

function CommunicationCentreAboveSilverScreen() {
  const quickLinks = [
    { label: 'Alerts', icon: Siren, to: '/communications', color: '#dc2626' },
    { label: 'Auto Log', icon: History, to: '/communications', color: '#1e3a8a' },
    { label: 'Inbox', icon: Inbox, to: '/communications', color: '#0369a1' },
    { label: 'Send Email', icon: Mail, to: '/communications', color: '#16a34a' },
    { label: 'Enter Shift Notes', icon: NotebookPen, to: '/communications', color: '#d97706' },
  ];

  return (
    <div className="rounded-xl border-2 border-blue-400 bg-white p-2 space-y-1.5">
      {/* Squashed Communication Centre Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg px-2.5 py-1 text-white"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-1.5">
          <MessagesSquare className="h-3.5 w-3.5 text-white" />
          <span className="text-[11px] font-extrabold text-white">
            Communication Centre (Above Silver Screen)
          </span>
        </div>
        <Link
          to="/communications"
          className="rounded bg-white px-2 py-0.5 text-[9px] font-extrabold text-purple-900 hover:bg-pink-50"
        >
          Open Centre
        </Link>
      </div>

      {/* Squashed Alert & Automated Headers + Quick Comm Links */}
      <div className="grid grid-cols-5 gap-1">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-1 rounded-md border px-1.5 py-1 text-[9px] font-extrabold text-white"
              style={{ background: item.color, borderColor: item.color }}
            >
              <Icon className="h-2.5 w-2.5 shrink-0 text-white" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Small Vault directly under Inbox inside Communication Centre */}
      <SmallSafeVaultBar />
    </div>
  );
}

export default function ExecutiveWallScene({ logoUrl, showRosterAbove = true }) {
  const [now, setNow] = useState(() => new Date());
  const [middleTab, setMiddleTab] = useState('all'); // 'left' | 'all' | 'right'

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
    /* Solid opaque white blockout background — zero background bleed */
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500 bg-white p-2.5 shadow-md space-y-2">
      {/* 1. ROSTER FITTED ABOVE */}
      {showRosterAbove && <RosterMiniOverview />}

      {/* 2. TOP 3-TAB BAR WITH MODULES IN THE MIDDLE TAB */}
      <div className="grid grid-cols-3 gap-1.5 rounded-xl border-2 border-purple-300 bg-white p-1">
        <button
          type="button"
          onClick={() => setMiddleTab('left')}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] sm:text-xs font-extrabold transition-all ${
            middleTab === 'left'
              ? 'text-white shadow-sm'
              : 'border border-blue-200 bg-blue-50 text-blue-950 hover:bg-blue-100'
          }`}
          style={middleTab === 'left' ? { background: '#2563eb' } : undefined}
        >
          <span>1. Left Office · Logo Frame &amp; Couch</span>
        </button>

        <button
          type="button"
          onClick={() => setMiddleTab('all')}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] sm:text-xs font-extrabold transition-all ${
            middleTab === 'all'
              ? 'text-white shadow-sm'
              : 'border border-purple-200 bg-purple-50 text-purple-950 hover:bg-purple-100'
          }`}
          style={middleTab === 'all' ? { background: SQUISHED_GRADIENT } : undefined}
        >
          <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
          <span>2. Middle Tab · All {MODULE_DIRECTORY.length} Modules (Full Office View)</span>
        </button>

        <button
          type="button"
          onClick={() => setMiddleTab('right')}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] sm:text-xs font-extrabold transition-all ${
            middleTab === 'right'
              ? 'text-white shadow-sm'
              : 'border border-pink-200 bg-pink-50 text-pink-950 hover:bg-pink-100'
          }`}
          style={middleTab === 'right' ? { background: '#ec4899' } : undefined}
        >
          <span>3. Other Side · Comm Centre &amp; Silver Screen</span>
        </button>
      </div>

      {/* 3. THREE-PART OFFICE LAYOUT: Left Side | Middle Tab (All Modules Fitting Well) | Other Side (Comm Centre Above Silver Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch bg-white">
        {/* LEFT SIDE OF OFFICE (4 cols) */}
        {(middleTab === 'all' || middleTab === 'left') && (
          <div
            className={`${
              middleTab === 'left' ? 'lg:col-span-12' : 'lg:col-span-3'
            } flex flex-col justify-between gap-2 rounded-xl border-2 border-blue-400 bg-white p-2`}
          >
            <ComplianceHrPhotoFrame
              logoUrl={logoUrl}
              large={true}
              badgeLabel="Left Corner Picture Frame"
            />

            {/* Ordered Business & Developer Details */}
            <div className="rounded-xl border border-pink-300 bg-pink-50 px-2.5 py-1.5 space-y-0.5 text-[10px] leading-snug">
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

            {/* Front-Left Chair Back + Couch Near Front Door */}
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-blue-300 bg-blue-50 p-1.5">
              <div className="flex items-center gap-1 rounded-lg bg-white p-1">
                <ExecutiveChairFrontLeftSvg />
                <div className="min-w-0">
                  <div className="text-[8px] font-extrabold uppercase text-blue-800">Front Left</div>
                  <div className="text-[9px] font-extrabold leading-tight text-blue-950">Chair Back</div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg bg-white p-1">
                <CouchNearFrontDoorSvg />
                <div className="text-[8px] font-extrabold text-pink-800 leading-none">
                  Couch &amp; Front Door
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MIDDLE TAB: ALL 45 MODULES FITTING WELL (5 cols) */}
        <div
          className={`${
            middleTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'
          } flex flex-col justify-between rounded-xl border-2 border-purple-500 bg-white p-2`}
        >
          <div
            className="mb-1.5 flex items-center justify-between rounded-lg px-2.5 py-1 text-white"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold">
              <LayoutGrid className="h-3.5 w-3.5" /> Middle Tab · All {MODULE_DIRECTORY.length} Modules
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">
              Click any module
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {MODULE_DIRECTORY.map((mod) => {
              const Icon = mod.icon;
              const colour = moduleKeyColour(mod.key);
              return (
                <Link
                  key={mod.key}
                  to={mod.path}
                  className="flex items-center gap-1.5 rounded-lg border bg-white px-2 py-1 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  style={{
                    borderColor: colour,
                    borderLeftWidth: '4px',
                  }}
                  title={mod.label}
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white"
                    style={{ background: colour }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[9.5px] font-extrabold text-blue-950 leading-tight">
                    {mod.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* OTHER SIDE OF OFFICE (RIGHT SIDE, 4 cols): Communication Centre Above + Silver Screen Below + Table with Speaker, iPhone & Computer */}
        {(middleTab === 'all' || middleTab === 'right') && (
          <div
            className={`${
              middleTab === 'right' ? 'lg:col-span-12' : 'lg:col-span-4'
            } flex flex-col justify-between gap-2 rounded-xl border-2 border-pink-400 bg-white p-2`}
          >
            {/* Communication Centre ABOVE Silver Screen */}
            <CommunicationCentreAboveSilverScreen />

            {/* Silver Screen on Other Side of Office: Live Weather on One Half + NDIS News & Updates on Other Half */}
            <SilverScreenSplit />

            {/* Office Table with Modern Speaker, iPhone & Computer + Smart Clock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 rounded-xl border border-purple-300 bg-purple-50 p-1.5 items-center">
              <div className="flex flex-col items-center justify-center rounded-lg bg-white p-1.5 text-center">
                <div className="text-[8px] font-extrabold uppercase tracking-wider text-violet-900">
                  Table · Speaker · iPhone · Computer
                </div>
                <OfficeTechTableSvg />
              </div>

              <div className="flex flex-col justify-between gap-1.5 rounded-lg bg-white p-2">
                <div
                  className="rounded-lg px-2 py-1 text-white"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <div className="inline-flex items-center gap-1 text-[9px] font-extrabold">
                    <Clock className="h-3 w-3" /> Office Smart Clock
                  </div>
                  <div className="font-mono text-[10px] font-extrabold">
                    {timeStr}
                  </div>
                  <div className="text-[9px] font-bold">{dateStr}</div>
                </div>
                <div className="rounded-lg border border-pink-300 bg-pink-50 px-2 py-1 text-[9px] font-extrabold text-pink-900">
                  3-Door Cupboard · Company Safe, NDIS &amp; HR, Certificates Locked
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}