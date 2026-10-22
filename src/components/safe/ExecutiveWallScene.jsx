import React, { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import {
  Lock, FolderLock, MessagesSquare, Inbox, Siren, History, Mail, NotebookPen,
  LayoutGrid, ListTodo, Lightbulb, BookMarked, Radio, Sparkles, Video, Briefcase,
  LayoutDashboard, Users, Heart, UserRound, Building2, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import SilverScreenSplit from '@/components/safe/SilverScreenSplit';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

const DEFAULT_SOFTWARE_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/04a0fc5c9_generated_b2aad3e7.png';

/**
 * Reusable Hanging Wall Frame — makes each screenshot look like a real framed picture
 * hanging on an office wall from a brass pin & wire.
 */
function WallHangingPictureFrame({ title, children, className = '', frameAccent = SQUISHED_GRADIENT }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Brass Nail & Hanging Wire on the Office Wall */}
      <div className="relative flex flex-col items-center">
        <div className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-600 shadow" />
        <svg viewBox="0 0 80 12" className="h-2.5 w-16 -mt-0.5 overflow-visible">
          <path d="M40 0 L6 12 M40 0 L74 12" stroke="#b45309" strokeWidth="1.8" fill="none" />
        </svg>
      </div>

      {/* Outer Gallery Frame */}
      <div
        className="w-full rounded-xl p-1.5 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.38)] ring-2 ring-amber-300"
        style={{ background: frameAccent }}
      >
        {/* Inner White Matboard & Screenshot Canvas */}
        <div className="h-full w-full overflow-hidden rounded-lg border-2 border-amber-200 bg-white p-1.5">
          {children}
        </div>
      </div>

      {/* Subtle Brass Wall Plaque Label under Picture */}
      {title && (
        <div className="mt-1 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[7.5px] font-extrabold uppercase tracking-wider text-amber-950 shadow-sm">
          {title}
        </div>
      )}
    </div>
  );
}

/**
 * Front-left Executive Chair Back SVG
 */
function ExecutiveChairFrontLeftSvg({ className = '' }) {
  return (
    <svg viewBox="0 0 110 88" className={className} aria-label="Executive Office Chair">
      <defs>
        <linearGradient id="execChairBackGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
      </defs>
      {/* Headrest */}
      <rect x="26" y="4" width="58" height="16" rx="7" fill="url(#execChairBackGrad)" stroke="#f9a8d4" strokeWidth="2" />
      {/* High Backrest */}
      <path d="M18 22 Q55 16 92 22 L86 68 Q55 73 24 68 Z" fill="url(#execChairBackGrad)" stroke="#93c5fd" strokeWidth="2" />
      <line x1="30" y1="36" x2="80" y2="36" stroke="#fbcfe8" strokeWidth="1.2" strokeOpacity="0.65" />
      <line x1="28" y1="50" x2="82" y2="50" stroke="#fbcfe8" strokeWidth="1.2" strokeOpacity="0.65" />
      {/* Armrests */}
      <path d="M8 44 Q14 40 20 46 L20 66 Q12 66 8 60 Z" fill="#1e40af" stroke="#93c5fd" strokeWidth="1.5" />
      <path d="M102 44 Q96 40 90 46 L90 66 Q98 66 102 60 Z" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.5" />
      {/* Seat & Base */}
      <rect x="22" y="68" width="66" height="9" rx="4.5" fill="#312e81" stroke="#c4b5fd" strokeWidth="1.5" />
      <rect x="51" y="77" width="8" height="7" fill="#475569" />
      <path d="M30 85 L80 85" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="86" r="2" fill="#1e293b" />
      <circle cx="55" cy="86" r="2" fill="#1e293b" />
      <circle cx="78" cy="86" r="2" fill="#1e293b" />
    </svg>
  );
}

/**
 * Executive Office Couch + Indoor Plant SVG
 */
function OfficeCouchAndPlantSvg({ className = '' }) {
  return (
    <svg viewBox="0 0 210 86" className={className} aria-label="Office Couch and Indoor Plant">
      <defs>
        <linearGradient id="couchGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Potted Plant on Left */}
      <g>
        <polygon points="10,58 28,58 25,82 13,82" fill="#d97706" stroke="#fde68a" strokeWidth="1.5" />
        <path d="M19 58 C10 42 4 34 8 24 C14 30 17 42 19 58" fill="#16a34a" />
        <path d="M19 58 C19 36 16 22 20 14 C24 24 22 40 19 58" fill="#22c55e" />
        <path d="M19 58 C27 42 33 32 30 22 C24 28 21 42 19 58" fill="#15803d" />
      </g>
      {/* Executive Couch */}
      <g transform="translate(38, 14)">
        <rect x="12" y="8" width="144" height="34" rx="10" fill="url(#couchGrad)" stroke="#f9a8d4" strokeWidth="2" />
        {/* Cushions */}
        <rect x="16" y="12" width="44" height="26" rx="6" fill="#1d4ed8" fillOpacity="0.55" stroke="#bfdbfe" strokeWidth="1" />
        <rect x="62" y="12" width="44" height="26" rx="6" fill="#6d28d9" fillOpacity="0.55" stroke="#ddd6fe" strokeWidth="1" />
        <rect x="108" y="12" width="44" height="26" rx="6" fill="#be185d" fillOpacity="0.55" stroke="#fbcfe8" strokeWidth="1" />
        {/* Armrests */}
        <rect x="2" y="20" width="14" height="34" rx="6" fill="#1e40af" stroke="#93c5fd" strokeWidth="1.5" />
        <rect x="152" y="20" width="14" height="34" rx="6" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.5" />
        {/* Seat Deck */}
        <rect x="12" y="38" width="144" height="16" rx="5" fill="url(#couchGrad)" stroke="#e9d5ff" strokeWidth="1.5" />
        {/* Legs */}
        <rect x="18" y="54" width="6" height="12" rx="2" fill="#b45309" />
        <rect x="144" y="54" width="6" height="12" rx="2" fill="#b45309" />
      </g>
    </svg>
  );
}

/**
 * Executive Office Desk with PC Monitor, Speaker, Conference Phone, Desk Lamp, Mug & Safe Vault SVG
 */
function OfficeDeskAndEquipmentSvg({ className = '' }) {
  return (
    <svg viewBox="0 0 520 92" className={className} aria-label="Office Desk with PC, Speaker, Phone, Lamp and Safe">
      <defs>
        <linearGradient id="deskTopGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="48%" stopColor="#5b21b6" />
          <stop offset="100%" stopColor="#9d174d" />
        </linearGradient>
        <linearGradient id="pcScreenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Brass Desk Lamp (Left of Desk) */}
      <g transform="translate(22, 6)">
        <ellipse cx="22" cy="52" rx="14" ry="4" fill="#b45309" stroke="#fde68a" strokeWidth="1.2" />
        <path d="M22 50 Q12 28 28 14" stroke="#d97706" strokeWidth="3" fill="none" />
        <polygon points="18,14 42,6 46,20 16,22" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.2" />
        {/* Warm Lamp Glow */}
        <polygon points="18,22 44,20 56,52 6,52" fill="#fde68a" fillOpacity="0.22" />
      </g>

      {/* Studio Office Speaker */}
      <g transform="translate(95, 18)">
        <rect x="0" y="0" width="28" height="40" rx="5" fill="#1e293b" stroke="#93c5fd" strokeWidth="1.5" />
        <circle cx="14" cy="12" r="5" fill="#3b82f6" stroke="#dbeafe" strokeWidth="1.2" />
        <circle cx="14" cy="28" r="8" fill="#7c3aed" stroke="#ede9fe" strokeWidth="1.2" />
        <circle cx="14" cy="28" r="3" fill="#ec4899" />
      </g>

      {/* Widescreen Executive PC Monitor + Keyboard */}
      <g transform="translate(142, 4)">
        <rect x="0" y="0" width="120" height="44" rx="6" fill="#0f172a" stroke="#c4b5fd" strokeWidth="2" />
        <rect x="4" y="4" width="112" height="34" rx="3" fill="url(#pcScreenGrad)" />
        {/* Mini UI bars inside PC screen */}
        <rect x="10" y="9" width="42" height="6" rx="2" fill="#ffffff" fillOpacity="0.9" />
        <rect x="56" y="9" width="52" height="6" rx="2" fill="#ffffff" fillOpacity="0.4" />
        <rect x="10" y="18" width="32" height="16" rx="2" fill="#ffffff" fillOpacity="0.85" />
        <rect x="45" y="18" width="32" height="16" rx="2" fill="#ffffff" fillOpacity="0.85" />
        <rect x="80" y="18" width="28" height="16" rx="2" fill="#ffffff" fillOpacity="0.85" />
        {/* Stand */}
        <rect x="52" y="44" width="16" height="8" fill="#64748b" />
        <rect x="36" y="51" width="48" height="4" rx="2" fill="#94a3b8" />
      </g>

      {/* Executive IP Office Phone */}
      <g transform="translate(282, 22)">
        <rect x="0" y="6" width="46" height="30" rx="5" fill="#1e1b4b" stroke="#f9a8d4" strokeWidth="1.5" />
        {/* Handset */}
        <rect x="-2" y="2" width="12" height="34" rx="5" fill="#312e81" stroke="#c4b5fd" strokeWidth="1.2" />
        {/* LCD Screen */}
        <rect x="14" y="10" width="28" height="9" rx="2" fill="#38bdf8" />
        {/* Keypad dots */}
        <circle cx="18" cy="24" r="1.8" fill="#e2e8f0" />
        <circle cx="26" cy="24" r="1.8" fill="#e2e8f0" />
        <circle cx="34" cy="24" r="1.8" fill="#e2e8f0" />
        <circle cx="18" cy="30" r="1.8" fill="#e2e8f0" />
        <circle cx="26" cy="30" r="1.8" fill="#e2e8f0" />
        <circle cx="34" cy="30" r="1.8" fill="#ec4899" />
      </g>

      {/* Coffee Mug & Notepad */}
      <g transform="translate(344, 32)">
        <rect x="0" y="4" width="18" height="20" rx="3" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
        <path d="M18 8 Q24 8 24 14 Q24 20 18 20" stroke="#ec4899" strokeWidth="2.5" fill="none" />
        <rect x="30" y="10" width="28" height="14" rx="2" fill="#ffffff" stroke="#7c3aed" strokeWidth="1.5" />
        <line x1="34" y1="15" x2="54" y2="15" stroke="#2563eb" strokeWidth="1.2" />
        <line x1="34" y1="19" x2="50" y2="19" stroke="#7c3aed" strokeWidth="1.2" />
      </g>

      {/* Executive Desk Surface & Legs */}
      <rect x="10" y="56" width="388" height="10" rx="4" fill="url(#deskTopGrad)" stroke="#fbcfe8" strokeWidth="1.5" />
      <rect x="28" y="66" width="12" height="24" rx="2" fill="#1e3a8a" />
      <rect x="190" y="66" width="60" height="22" rx="3" fill="#312e81" stroke="#a5b4fc" strokeWidth="1.2" />
      <circle cx="220" cy="73" r="2" fill="#fde68a" />
      <circle cx="220" cy="81" r="2" fill="#fde68a" />
      <rect x="368" y="66" width="12" height="24" rx="2" fill="#9d174d" />

      {/* Floor-standing Company Safe Vault on the Right */}
      <g transform="translate(416, 10)">
        <rect x="0" y="0" width="92" height="78" rx="8" fill="url(#deskTopGrad)" stroke="#fde68a" strokeWidth="2.2" />
        <rect x="6" y="6" width="80" height="66" rx="5" fill="#1e1b4b" fillOpacity="0.65" stroke="#f9a8d4" strokeWidth="1.2" />
        {/* Safe Combination Wheel */}
        <circle cx="34" cy="39" r="16" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
        <circle cx="34" cy="39" r="9" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="34" y1="23" x2="34" y2="28" stroke="#78350f" strokeWidth="2" />
        <line x1="34" y1="50" x2="34" y2="55" stroke="#78350f" strokeWidth="2" />
        <line x1="18" y1="39" x2="23" y2="39" stroke="#78350f" strokeWidth="2" />
        <line x1="45" y1="39" x2="50" y2="39" stroke="#78350f" strokeWidth="2" />
        {/* Safe Handle & Keypad */}
        <rect x="58" y="22" width="20" height="14" rx="2" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1" />
        <rect x="58" y="42" width="20" height="18" rx="3" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />
        <text x="46" y="16" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">COMPANY SAFE</text>
      </g>
    </svg>
  );
}

export function ComplianceHrPhotoFrame({ logoUrl }) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;
  return (
    <WallHangingPictureFrame title="Picture 1 · ComplianceHR Infinity Logo">
      <div className="flex flex-col items-center justify-center bg-white p-1 text-center">
        <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-white p-1">
          <Image
            src={frameSrc}
            alt="ComplianceHR Infinity Logo Screenshot"
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </WallHangingPictureFrame>
  );
}

export function SmallSafeVaultBar() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-pink-400 px-2 py-1 text-white shadow-sm"
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5 shadow-sm">
          <Image
            src={DEFAULT_SOFTWARE_LOGO}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[9px] font-extrabold text-white">
            ComplianceHR Infinity Smart Vault
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Link
          to="/company-safe"
          className="inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[8px] font-extrabold text-blue-950 hover:bg-pink-50"
        >
          <Lock className="h-2 w-2 text-pink-600" /> Safe
        </Link>
        <Link
          to="/documents"
          className="inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[8px] font-extrabold text-purple-950 hover:bg-pink-50"
        >
          <FolderLock className="h-2 w-2 text-purple-700" /> Vault
        </Link>
      </div>
    </div>
  );
}

/**
 * Screenshot 4: Full Communication Centre Modulars & Today's Roster Overview
 * (including Active Alerts & Automated Log lamps, all 15 Communication Centre modular tiles,
 * Smart Vault beside Employee Log, and SmallSafeVaultBar)
 */
const COMM_CENTRE_MODULARS = [
  { key: 'task-dashboard', label: 'Tasks', icon: LayoutDashboard, color: '#2563eb' },
  { key: 'todo', label: 'To-Do Board', icon: ListTodo, color: '#ea580c' },
  { key: 'guide', label: 'Tips & Teamwork', icon: Lightbulb, color: '#65a30d' },
  { key: 'templates', label: 'Templates', icon: BookMarked, color: '#ca8a04' },
  { key: 'banter', label: 'Team Banter', icon: MessagesSquare, color: '#db2777' },
  { key: 'feed', label: 'Team Feed', icon: Radio, color: '#0d9488' },
  { key: 'shoutouts', label: 'Shoutouts', icon: Sparkles, color: '#f43f5e' },
  { key: 'video', label: 'Video Calls', icon: Video, color: '#4f46e5' },
  { key: 'complaints', label: 'Complaints', icon: MessagesSquare, color: '#b91c1c' },
  { key: 'ai', label: 'AI Compose', icon: Sparkles, color: '#9333ea' },
  { key: 'diary', label: 'Diary', icon: MessagesSquare, color: '#0ea5e9' },
  { key: 'inbox', label: 'Inbox', icon: Inbox, color: '#0369a1' },
  { key: 'email', label: 'Send Email', icon: Mail, color: '#16a34a' },
  { key: 'shift-notes', label: 'Enter Shift Notes', icon: NotebookPen, color: '#d97706' },
  { key: 'employee-log', label: 'Employee Log', icon: Briefcase, color: '#c026d3' },
];

function CommunicationCentreScreenshot({ showRosterAbove = true }) {
  return (
    <div className="space-y-1 bg-white">
      {showRosterAbove && <RosterMiniOverview />}

      <div className="rounded-lg border border-blue-300 bg-white p-1.5 space-y-1">
        {/* Communication Centre Header Bar */}
        <div
          className="flex items-center justify-between gap-1 rounded px-2 py-0.5 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className="flex items-center gap-1">
            <MessagesSquare className="h-3 w-3 text-white" />
            <span className="text-[8.5px] font-extrabold text-white">
              Communication Centre Modulars
            </span>
          </div>
          <Link
            to="/communications"
            className="rounded bg-white px-1.5 py-0 text-[7.5px] font-extrabold text-purple-900 hover:bg-pink-50"
          >
            Open Centre
          </Link>
        </div>

        {/* Top Alert Lamps Screenshot Row (Active Alerts + Automated Log) */}
        <div className="grid grid-cols-2 gap-1">
          <Link
            to="/communications"
            className="flex items-center justify-between rounded border border-red-400 bg-red-600 px-1.5 py-0.5 text-[7.5px] font-extrabold text-white"
          >
            <span className="inline-flex items-center gap-1 truncate">
              <Siren className="h-2.5 w-2.5 shrink-0" /> Active Alerts
            </span>
            <span className="rounded bg-white px-1 text-[7px] font-extrabold text-red-700">LIVE</span>
          </Link>
          <Link
            to="/communications"
            className="flex items-center justify-between rounded border border-blue-400 bg-blue-900 px-1.5 py-0.5 text-[7.5px] font-extrabold text-white"
          >
            <span className="inline-flex items-center gap-1 truncate">
              <History className="h-2.5 w-2.5 shrink-0" /> Automated Log
            </span>
            <span className="rounded bg-white px-1 text-[7px] font-extrabold text-blue-900">LOG</span>
          </Link>
        </div>

        {/* All 15 Communication Centre Modular Tiles + Smart Vault beside Employee Log (16 tiles total in 4x4 grid) */}
        <div className="grid grid-cols-4 gap-1">
          {COMM_CENTRE_MODULARS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to="/communications"
                className="flex items-center gap-1 rounded border px-1 py-0.5 text-[7px] font-extrabold text-blue-950 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: `${item.color}88`,
                  borderTopWidth: '2px',
                  borderTopColor: item.color,
                  background: `linear-gradient(165deg, ${item.color}22 0%, #ffffff 90%)`,
                }}
                title={item.label}
              >
                <span
                  className="flex h-3 w-3 shrink-0 items-center justify-center rounded text-white"
                  style={{ background: item.color }}
                >
                  <Icon className="h-2 w-2" />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          {/* Smart Vault right beside Employee Log with ComplianceHR Infinity Logo & Colours */}
          <Link
            to="/company-safe"
            className="flex items-center gap-1 rounded border border-pink-400 px-1 py-0.5 text-[7px] font-extrabold text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
            title="ComplianceHR Infinity Smart Vault"
          >
            <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5">
              <Image
                src={DEFAULT_SOFTWARE_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="truncate">Smart Vault</span>
          </Link>
        </div>

        <SmallSafeVaultBar />
      </div>
    </div>
  );
}

/**
 * Interactive Profiles View — rendered when the user chooses "View Profiles" instead of "Office View"
 */
function ProfilesQuickDirectoryView() {
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.StaffProfile.list({ sort: '-created_date', limit: 12 }).catch(() => ({ items: [] })),
      base44.entities.ParticipantProfile.list({ sort: '-created_date', limit: 12 }).catch(() => ({ items: [] })),
    ]).then(([staffPage, partPage]) => {
      if (!active) return;
      setStaff(staffPage?.items || (Array.isArray(staffPage) ? staffPage : []));
      setParticipants(partPage?.items || (Array.isArray(partPage) ? partPage : []));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-3 bg-white p-3">
      {/* Top Quick Profile Portals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Link
          to="/my-profile"
          className="group flex items-center justify-between rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-extrabold text-blue-950">My Profile &amp; Work</div>
              <div className="text-[10px] font-bold text-blue-700">Personal details, documents, name tag &amp; tasks</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          to="/our-employees"
          className="group flex items-center justify-between rounded-xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-extrabold text-purple-950">Our Employee Profiles</div>
              <div className="text-[10px] font-bold text-purple-700">Staff files, HR compliance, shifts &amp; badges</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-purple-600 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          to="/our-participants"
          className="group flex items-center justify-between rounded-xl border-2 border-pink-400 bg-gradient-to-br from-pink-50 via-white to-amber-50 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-600 text-white shadow">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-extrabold text-pink-950">Our Participant Profiles</div>
              <div className="text-[10px] font-bold text-pink-700">NDIS plans, goals, consents, risks &amp; shift notes</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-pink-600 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Live Employee & Participant Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Employee Profiles Column */}
        <div className="rounded-xl border-2 border-purple-300 bg-white p-2.5">
          <div
            className="mb-2 flex items-center justify-between rounded-lg px-2.5 py-1 text-white"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold">
              <Users className="h-3.5 w-3.5" /> Employee Profiles ({staff.length})
            </span>
            <Link to="/our-employees" className="rounded bg-white px-2 py-0.5 text-[9px] font-extrabold text-purple-900">
              View All Employees
            </Link>
          </div>
          {loading ? (
            <div className="py-4 text-center text-xs font-bold text-purple-700">Loading employee profiles…</div>
          ) : staff.length === 0 ? (
            <div className="py-4 text-center text-xs font-bold text-purple-800">
              Open <Link to="/our-employees" className="underline">Our Employee Profiles</Link> to view or add staff records.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {staff.slice(0, 9).map((person) => (
                <Link
                  key={person.id}
                  to={`/our-employees/${person.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/60 px-2 py-1.5 text-left hover:border-purple-400 hover:bg-purple-100/70"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-extrabold text-white">
                    {(person.full_name || 'S')[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-extrabold text-purple-950">{person.full_name}</div>
                    <div className="truncate text-[8.5px] font-bold text-purple-700">{person.role || person.position || 'Staff'}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Participant Profiles Column */}
        <div className="rounded-xl border-2 border-pink-300 bg-white p-2.5">
          <div
            className="mb-2 flex items-center justify-between rounded-lg px-2.5 py-1 text-white"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold">
              <Heart className="h-3.5 w-3.5" /> Participant Profiles ({participants.length})
            </span>
            <Link to="/our-participants" className="rounded bg-white px-2 py-0.5 text-[9px] font-extrabold text-pink-900">
              View All Participants
            </Link>
          </div>
          {loading ? (
            <div className="py-4 text-center text-xs font-bold text-pink-700">Loading participant profiles…</div>
          ) : participants.length === 0 ? (
            <div className="py-4 text-center text-xs font-bold text-pink-800">
              Open <Link to="/our-participants" className="underline">Our Participant Profiles</Link> to view or add participant records.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {participants.slice(0, 9).map((person) => (
                <Link
                  key={person.id}
                  to={`/our-participants/${person.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50/60 px-2 py-1.5 text-left hover:border-pink-400 hover:bg-pink-100/70"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-600 text-[10px] font-extrabold text-white">
                    {(person.full_name || 'P')[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-extrabold text-pink-950">{person.full_name}</div>
                    <div className="truncate text-[8.5px] font-bold text-pink-700">{person.status || 'Active'}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExecutiveWallScene({
  logoUrl,
  companyName = 'ComplianceHR Infinity',
  showRosterAbove = true,
  defaultViewMode,
}) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;
  const [viewMode, setViewMode] = useState(() => {
    if (defaultViewMode) return defaultViewMode;
    return localStorage.getItem('chr-workspace-view-mode') || 'office';
  });

  useEffect(() => {
    const syncViewMode = (e) => {
      if (e?.detail?.mode) setViewMode(e.detail.mode);
    };
    window.addEventListener('chr-view-mode-change', syncViewMode);
    return () => window.removeEventListener('chr-view-mode-change', syncViewMode);
  }, []);

  const selectMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('chr-workspace-view-mode', mode);
    window.dispatchEvent(new CustomEvent('chr-view-mode-change', { detail: { mode } }));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-4 border-purple-700 bg-white shadow-xl">
      {/* Top Ceiling Crown Moulding / Gallery Lighting Bar with Office View vs Profiles View Switcher */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-white"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-amber-200 shadow-[0_0_10px_#fde68a]" />
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-white">
            {viewMode === 'office'
              ? 'ComplianceHR Infinity · Executive Office Wall & Equipment View'
              : 'ComplianceHR Infinity · Employee & Participant Profiles View'}
          </span>
        </div>

        {/* User View Mode Toggle: Office View vs View Profiles */}
        <div className="flex items-center gap-1 rounded-full bg-white/20 p-0.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => selectMode('office')}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold transition-all ${
              viewMode === 'office'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-white hover:bg-white/15'
            }`}
          >
            <Building2 className="h-3 w-3 text-pink-600" />
            Office View
          </button>
          <button
            type="button"
            onClick={() => selectMode('profiles')}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold transition-all ${
              viewMode === 'profiles'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-white hover:bg-white/15'
            }`}
          >
            <Users className="h-3 w-3 text-purple-600" />
            View Profiles
          </button>
        </div>
      </div>

      {viewMode === 'profiles' ? (
        <ProfilesQuickDirectoryView />
      ) : (
        <>
          {/* Main Office Wall Surface with Framed Screenshots Hanging on the Wall */}
          <div
            className="p-2 sm:p-2.5"
            style={{
              background:
                'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 45%, #fce7f3 88%, #e0e7ff 100%)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
              {/* LEFT / CENTER WALL AREA (7 cols):
                  Top Row: Picture 1 (Logo Screenshot) + Picture 2 ("Compliance management, simplified end to end." with Slogan Screenshot)
                  Bottom Row (Middle Tab under Business Name): Picture 3 (All 45 Modules Squashed Together Screenshot) */}
              <div className="md:col-span-7 flex flex-col gap-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-stretch">
                  {/* PICTURE 1: Screenshot of My Logo */}
                  <div className="sm:col-span-5">
                    <WallHangingPictureFrame title="Logo">
                      <div className="flex h-20 w-full items-center justify-center bg-white p-1">
                        <Image
                          src={frameSrc}
                          alt="ComplianceHR Infinity Logo"
                          fittingType="fit"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </WallHangingPictureFrame>
                  </div>

                  {/* PICTURE 2: Screenshot of "Compliance management, simplified end to end." with Slogan */}
                  <div className="sm:col-span-7">
                    <WallHangingPictureFrame title="Headline & Slogan">
                      <div className="flex h-20 flex-col items-center justify-center rounded bg-gradient-to-b from-violet-50 via-white to-pink-50 px-2 py-1 text-center">
                        <div className="font-editorial text-xs sm:text-sm font-bold leading-tight text-blue-950">
                          Compliance management,
                          <span className="block font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                            simplified end to end.
                          </span>
                        </div>
                        <div
                          className="mt-1 rounded-full px-2 py-0.5 text-[7.5px] font-extrabold uppercase tracking-wider text-white shadow-sm"
                          style={{ background: SQUISHED_GRADIENT }}
                        >
                          Complete Control. Greater Confidence. Brighter Success.
                        </div>
                      </div>
                    </WallHangingPictureFrame>
                  </div>
                </div>

                {/* PICTURE 3 (Middle Wall under Business Name): Screenshot of All 45 Modules Squashed Together */}
                <WallHangingPictureFrame title={`${companyName || 'ComplianceHR Infinity'} · All ${MODULE_DIRECTORY.length} Modules Squashed Together`}>
                  <div className="space-y-1 bg-white">
                    <div
                      className="flex items-center justify-between rounded px-2 py-0.5 text-white"
                      style={{ background: SQUISHED_GRADIENT }}
                    >
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold">
                        <LayoutGrid className="h-2.5 w-2.5" /> {companyName || 'ComplianceHR Infinity'}
                      </span>
                      <span className="text-[7.5px] font-extrabold">
                        {MODULE_DIRECTORY.length} Connected Modules
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-0.5">
                      {MODULE_DIRECTORY.map((mod) => {
                        const Icon = mod.icon;
                        const colour = moduleKeyColour(mod.key);
                        return (
                          <Link
                            key={mod.key}
                            to={mod.path}
                            className="flex items-center gap-1 rounded border bg-white px-1 py-0.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
                            style={{
                              borderColor: colour,
                              borderLeftWidth: '3px',
                            }}
                            title={mod.label}
                          >
                            <span
                              className="flex h-3 w-3 shrink-0 items-center justify-center rounded text-white"
                              style={{ background: colour }}
                            >
                              <Icon className="h-2 w-2" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[7px] font-extrabold text-blue-950 leading-tight">
                              {mod.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </WallHangingPictureFrame>
              </div>

              {/* OTHER SIDE OF THE OFFICE WALL (5 cols):
                  Picture 4: Screenshot of Communication Centre Modulars & Today's Roster Overview
                  with the Squashed Silver Screen mounted directly underneath it on the wall */}
              <div className="md:col-span-5 flex flex-col gap-1.5">
                {/* PICTURE 4: Screenshot of Communication Centre Modulars & Today's Roster Overview */}
                <WallHangingPictureFrame title="Communication Centre Modulars & Today's Roster">
                  <CommunicationCentreScreenshot showRosterAbove={showRosterAbove} />
                </WallHangingPictureFrame>

                {/* Mounted Silver Screen directly underneath Communication Centre on the other side of the wall */}
                <WallHangingPictureFrame
                  title="Silver Screen · Weather & NDIS News"
                  frameAccent="linear-gradient(135deg, #64748b 0%, #cbd5e1 50%, #475569 100%)"
                >
                  <SilverScreenSplit />
                </WallHangingPictureFrame>
              </div>
            </div>

            {/* OFFICE FLOOR & FURNITURE / EQUIPMENT SCENE (Executive Chair, Couch, Plant, Desk, PC, Speaker, Phone, Lamp & Safe) */}
            <div className="mt-2 rounded-xl border-2 border-purple-300 bg-gradient-to-b from-white/90 via-violet-50/90 to-pink-100/80 px-2 pt-1.5 pb-1 shadow-inner">
              <div className="grid grid-cols-12 items-end gap-1">
                {/* Front-Left Executive Chair */}
                <div className="col-span-3 sm:col-span-2 flex flex-col items-center">
                  <ExecutiveChairFrontLeftSvg className="h-14 w-full" />
                  <span className="text-[7px] font-extrabold uppercase tracking-wider text-blue-950">
                    Executive Chair
                  </span>
                </div>

                {/* Executive Lounge Couch & Office Plant */}
                <div className="col-span-9 sm:col-span-3 flex flex-col items-center">
                  <OfficeCouchAndPlantSvg className="h-14 w-full" />
                  <span className="text-[7px] font-extrabold uppercase tracking-wider text-purple-950">
                    Office Lounge &amp; Plant
                  </span>
                </div>

                {/* Executive Desk with PC Monitor, Speaker, Phone, Desk Lamp, Coffee & Safe Vault */}
                <div className="col-span-12 sm:col-span-7 flex flex-col items-center">
                  <OfficeDeskAndEquipmentSvg className="h-16 w-full" />
                  <span className="text-[7px] font-extrabold uppercase tracking-wider text-pink-950">
                    Executive Desk · PC · Speaker · Phone · Lamp · Company Safe
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Office Baseboard Trim */}
      <div
        className="h-2 w-full border-t-2 border-amber-300"
        style={{ background: SQUISHED_GRADIENT }}
      />
    </div>
  );
}