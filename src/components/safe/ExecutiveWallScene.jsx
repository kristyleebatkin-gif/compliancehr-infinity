import React, { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import {
  Lock, FolderLock, MessagesSquare, Inbox, Siren, History, Mail, NotebookPen,
  LayoutGrid, ListTodo, Lightbulb, BookMarked, Radio, Sparkles, Video, Briefcase,
  LayoutDashboard, Users, Heart, UserRound, Building2, ArrowRight, LogIn,
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
        className="w-full rounded-xl p-1.5 shadow-[0_10px_24px_-6px_rgba(15,23,42,0.35)] ring-2 ring-amber-300"
        style={{ background: frameAccent }}
      >
        {/* Inner White Matboard & Screenshot Canvas */}
        <div className="h-full w-full overflow-hidden rounded-lg border-2 border-amber-200 bg-white p-1.5">
          {children}
        </div>
      </div>

      {/* Subtle Brass Wall Plaque Label under Picture */}
      {title && (
        <div className="mt-0.5 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[7.5px] font-extrabold uppercase tracking-wider text-amber-950 shadow-sm">
          {title}
        </div>
      )}
    </div>
  );
}

/**
 * Prominent Office Chair + Office Table with Speaker (plus PC Monitor & Phone)
 * positioned right in front of the Office Wall.
 */
function OfficeTableWithSpeakerAndChairSvg({ className = '' }) {
  return (
    <svg
      viewBox="0 0 860 155"
      className={className}
      aria-label="Office Table with Speaker and Executive Chair"
    >
      <defs>
        <linearGradient id="officeGradMain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="48%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="chairLeatherGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
        <linearGradient id="tableWoodGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#5b21b6" />
          <stop offset="100%" stopColor="#9d174d" />
        </linearGradient>
      </defs>

      {/* Subtle Office Floor Carpet Runner under Chair & Table */}
      <ellipse cx="430" cy="144" rx="390" ry="9" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="1.5" />

      {/* ==================== EXECUTIVE OFFICE CHAIR (LEFT / FRONT) ==================== */}
      <g transform="translate(85, 8)">
        {/* Headrest */}
        <rect x="38" y="0" width="76" height="22" rx="9" fill="url(#chairLeatherGrad)" stroke="#f9a8d4" strokeWidth="2.2" />
        {/* Tufted High Backrest */}
        <path
          d="M24 24 Q76 16 128 24 L120 92 Q76 100 32 92 Z"
          fill="url(#chairLeatherGrad)"
          stroke="#93c5fd"
          strokeWidth="2.4"
        />
        {/* Cushion Stitching Lines */}
        <line x1="40" y1="45" x2="112" y2="45" stroke="#fbcfe8" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="38" y1="68" x2="114" y2="68" stroke="#fbcfe8" strokeWidth="1.5" strokeOpacity="0.7" />
        {/* Padded Armrests */}
        <path d="M8 54 Q18 48 26 56 L26 88 Q14 88 8 78 Z" fill="#1e40af" stroke="#93c5fd" strokeWidth="1.8" />
        <path d="M144 54 Q134 48 126 56 L126 88 Q138 88 144 78 Z" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.8" />
        {/* Plush Seat Cushion */}
        <rect x="26" y="92" width="100" height="14" rx="7" fill="#312e81" stroke="#c4b5fd" strokeWidth="2" />
        {/* Pneumatic Cylinder & 5-Star Castor Base */}
        <rect x="70" y="106" width="12" height="18" fill="#475569" />
        <path d="M34 126 L118 126" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M76 122 L42 132 M76 122 L110 132" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="38" cy="134" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
        <circle cx="76" cy="134" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
        <circle cx="114" cy="134" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
        <text x="76" y="146" textAnchor="middle" fill="#1e3a8a" fontSize="9.5" fontWeight="800">
          EXECUTIVE CHAIR
        </text>
      </g>

      {/* ==================== OFFICE TABLE WITH SPEAKER (CENTER / RIGHT) ==================== */}
      <g transform="translate(295, 12)">
        {/* ---- STUDIO OFFICE SPEAKER ON THE TABLE (PROMINENT) ---- */}
        <g transform="translate(55, 6)">
          {/* Main Speaker Tower Cabinet */}
          <rect
            x="0"
            y="0"
            width="58"
            height="72"
            rx="9"
            fill="#0f172a"
            stroke="#f472b6"
            strokeWidth="2.5"
          />
          {/* Speaker Top Tweeter */}
          <circle cx="29" cy="20" r="10" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
          <circle cx="29" cy="20" r="4" fill="#38bdf8" />
          {/* Speaker Main Sub-Woofer Cone */}
          <circle cx="29" cy="48" r="16" fill="#312e81" stroke="#c084fc" strokeWidth="2.2" />
          <circle cx="29" cy="48" r="9" fill="#7c3aed" stroke="#f9a8d4" strokeWidth="1.5" />
          <circle cx="29" cy="48" r="3.5" fill="#ec4899" />
          {/* Sound Wave Accents */}
          <path d="M-8 22 Q-14 34 -8 46" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M66 22 Q72 34 66 46" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" />
          <text x="29" y="-4" textAnchor="middle" fill="#7c3aed" fontSize="8.5" fontWeight="800">
            OFFICE SPEAKER
          </text>
        </g>

        {/* ---- WIDESCREEN PC MONITOR ON THE TABLE ---- */}
        <g transform="translate(155, 4)">
          <rect x="0" y="0" width="146" height="58" rx="7" fill="#0f172a" stroke="#93c5fd" strokeWidth="2.2" />
          <rect x="5" y="5" width="136" height="44" rx="4" fill="url(#officeGradMain)" />
          <rect x="12" y="11" width="52" height="7" rx="2" fill="#ffffff" fillOpacity="0.92" />
          <rect x="12" y="22" width="38" height="20" rx="2.5" fill="#ffffff" fillOpacity="0.88" />
          <rect x="54" y="22" width="38" height="20" rx="2.5" fill="#ffffff" fillOpacity="0.88" />
          <rect x="96" y="22" width="38" height="20" rx="2.5" fill="#ffffff" fillOpacity="0.88" />
          {/* Stand */}
          <rect x="63" y="58" width="20" height="12" fill="#475569" />
          <rect x="45" y="69" width="56" height="5" rx="2.5" fill="#94a3b8" />
        </g>

        {/* ---- SECOND MATCHING SPEAKER / DESK PHONE ON RIGHT SIDE OF TABLE ---- */}
        <g transform="translate(335, 22)">
          <rect x="0" y="0" width="64" height="52" rx="7" fill="#1e1b4b" stroke="#f9a8d4" strokeWidth="2" />
          <rect x="8" y="8" width="14" height="36" rx="5" fill="#312e81" stroke="#a5b4fc" strokeWidth="1.2" />
          <rect x="26" y="8" width="30" height="12" rx="2" fill="#38bdf8" />
          <circle cx="32" cy="28" r="2.2" fill="#ffffff" />
          <circle cx="41" cy="28" r="2.2" fill="#ffffff" />
          <circle cx="50" cy="28" r="2.2" fill="#ffffff" />
          <circle cx="32" cy="36" r="2.2" fill="#ffffff" />
          <circle cx="41" cy="36" r="2.2" fill="#ffffff" />
          <circle cx="50" cy="36" r="2.2" fill="#ec4899" />
        </g>

        {/* ---- OFFICE TABLE TOP & LEGS ---- */}
        <rect
          x="0"
          y="76"
          width="455"
          height="14"
          rx="6"
          fill="url(#tableWoodGrad)"
          stroke="#f9a8d4"
          strokeWidth="2"
        />
        {/* Table Under-frame & Drawers */}
        <rect x="24" y="90" width="16" height="44" rx="3" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.2" />
        <rect x="165" y="90" width="125" height="34" rx="4" fill="#312e81" stroke="#c4b5fd" strokeWidth="1.5" />
        <line x1="165" y1="107" x2="290" y2="107" stroke="#a5b4fc" strokeWidth="1.2" />
        <circle cx="227" cy="99" r="2.5" fill="#fde68a" />
        <circle cx="227" cy="116" r="2.5" fill="#fde68a" />
        <rect x="415" y="90" width="16" height="44" rx="3" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.2" />

        <text x="227" y="138" textAnchor="middle" fill="#5b21b6" fontSize="9.5" fontWeight="800">
          OFFICE TABLE WITH SPEAKER, PC &amp; PHONE
        </text>
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
          {/* Smart Vault right beside Employee Log */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      {/* Top Ceiling Crown Moulding / Gallery Lighting Bar with Office View vs View Profiles Switcher */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-white"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-amber-200 shadow-[0_0_10px_#fde68a]" />
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-white">
            {viewMode === 'office'
              ? 'ComplianceHR Infinity · Executive Office Wall, Table, Speaker & Chair'
              : 'ComplianceHR Infinity · Employee & Participant Profiles View'}
          </span>
        </div>

        {/* User View Mode Toggle: Office View vs View Profiles + Sign In */}
        <div className="flex items-center gap-1.5">
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
          <Link
            to="/login"
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9.5px] font-extrabold text-blue-950 shadow-sm hover:bg-pink-50"
          >
            <LogIn className="h-3 w-3 text-blue-600" />
            Sign In
          </Link>
        </div>
      </div>

      {viewMode === 'profiles' ? (
        <ProfilesQuickDirectoryView />
      ) : (
        <div className="bg-white p-2 sm:p-2.5">
          {/* OFFICE WALL WITH HANGING FRAMED SCREENSHOTS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
            {/* LEFT / CENTER WALL AREA (7 cols):
                Top Row: Picture 1 (Logo Screenshot) + Picture 2 ("Compliance management, simplified end to end." with Slogan Screenshot)
                Bottom Row: Picture 3 (All 45 Modules Squashed Together Screenshot) */}
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
                    <div className="flex h-20 flex-col items-center justify-center rounded bg-white px-2 py-1 text-center">
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

              {/* PICTURE 3: Screenshot of All 45 Modules Squashed Together */}
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

            {/* RIGHT SIDE OF THE OFFICE WALL (5 cols):
                Picture 4: Screenshot of Communication Centre Modulars & Today's Roster Overview
                with the Squashed Silver Screen mounted directly underneath it */}
            <div className="md:col-span-5 flex flex-col gap-1.5">
              <WallHangingPictureFrame title="Communication Centre Modulars & Today's Roster">
                <CommunicationCentreScreenshot showRosterAbove={showRosterAbove} />
              </WallHangingPictureFrame>

              <WallHangingPictureFrame
                title="Silver Screen · Weather & NDIS News"
                frameAccent="linear-gradient(135deg, #64748b 0%, #cbd5e1 50%, #475569 100%)"
              >
                <SilverScreenSplit />
              </WallHangingPictureFrame>
            </div>
          </div>

          {/* OFFICE FLOOR SCENE: TABLE WITH A SPEAKER AND AN EXECUTIVE CHAIR IN FRONT OF THE WALL */}
          <div className="mt-2 rounded-xl border-2 border-purple-300 bg-white px-3 py-1 shadow-sm">
            <OfficeTableWithSpeakerAndChairSvg className="mx-auto h-28 sm:h-32 w-full max-w-4xl" />
          </div>
        </div>
      )}

      {/* Bottom Office Baseboard Trim */}
      <div
        className="h-2 w-full border-t-2 border-amber-300"
        style={{ background: SQUISHED_GRADIENT }}
      />
    </div>
  );
}