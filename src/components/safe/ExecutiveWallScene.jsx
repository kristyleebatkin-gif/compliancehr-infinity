import React, { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import {
  Lock, FolderLock, MessagesSquare, Inbox, Siren, History, Mail, NotebookPen,
  LayoutGrid, ListTodo, Lightbulb, BookMarked, Radio, Sparkles, Video, Briefcase,
  LayoutDashboard, Users, Heart, UserRound, Building2, ArrowRight, LogIn,
  ShieldCheck, Monitor, Columns, Eye, ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import SilverScreenSplit from '@/components/safe/SilverScreenSplit';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';
import {
  CompanySafeMaterialPanel,
  ComplianceAndOperationsMaterialPanel,
  LogoWithFullSloganCard,
  LogoBrandedOfficeSecondScreen,
  DEFAULT_LOGO,
  FULL_SLOGAN,
} from '@/components/safe/OfficeInteractiveMaterials';
import ModularScreenDataSelector, { MODULAR_SCREEN_DECKS } from '@/components/safe/ModularScreenDataSelector';
import MasterComplianceAuditForms from '@/components/compliance/MasterComplianceAuditForms';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

const DEFAULT_SOFTWARE_LOGO = DEFAULT_LOGO;

/**
 * Reusable Hanging Wall Frame — makes each screenshot look like a real framed picture
 * hanging on an office wall from a brass pin & wire.
 */
function WallHangingPictureFrame({ title, children, className = '', frameAccent = SQUISHED_GRADIENT }) {
  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Outer Gallery Frame with Integrated Brass Plaque Header — Zero Vertical Gap */}
      <div
        className="flex h-full w-full flex-col rounded-lg p-0.5 shadow-sm ring-1 ring-amber-300"
        style={{ background: frameAccent }}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-center gap-1 px-1.5 py-0.5 text-[6.8px] font-extrabold uppercase tracking-wider text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            <span className="truncate">{title}</span>
          </div>
        )}
        <div className="flex-1 w-full overflow-hidden rounded-md border border-amber-200 bg-white p-1">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Complete Designed Office Equipment Scene:
 * - Executive Chair (Front-Left)
 * - Office Table with Studio Speaker, Interactive Widescreen PC Monitor (with Logo & Slogan) & Office Phone
 * - Executive Couch, Indoor Plant & Company Safe Vault (with Logo Emblem)
 */
function OfficeEquipmentWithInteractiveScreen({
  selectedMonitorFeed,
  onSelectMonitorFeed,
  onSelectDataTab,
}) {
  const feeds = [
    { id: 'overview', label: '45 Modules Live', title: '45 MODULES HUB', sub: FULL_SLOGAN, dataTab: 'modules' },
    { id: 'profiles', label: 'Staff & Participants', title: 'PEOPLE PROFILES', sub: 'Employees · Participants · Intake', dataTab: 'profiles' },
    { id: 'comms', label: 'Comms & Roster', title: 'COMMS & ROSTER', sub: 'Alerts · Shift Notes · Smart Vault', dataTab: 'compliance' },
    { id: 'safe', label: 'Company Safe', title: 'COMPANY SAFE VAULT', sub: 'Identity · Badges · NDIS Evidence', dataTab: 'safe' },
  ];
  const currentFeed = feeds.find((f) => f.id === selectedMonitorFeed) || feeds[0];

  return (
    <div className="rounded-xl border-2 border-purple-300 bg-white px-2 py-1.5 shadow-sm">
      {/* Interactive PC Monitor & Speaker Channel Controls Bar */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1 border-b border-purple-100 pb-1">
        <div className="flex items-center gap-1 text-[8px] font-extrabold text-blue-950">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <Monitor className="h-2.5 w-2.5" /> Desk PC Monitor &amp; Speaker
          </span>
          <span className="text-purple-800">Select screen material:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              type="button"
              onClick={() => {
                onSelectMonitorFeed(feed.id);
                if (onSelectDataTab) onSelectDataTab(feed.dataTab);
              }}
              className={`rounded-full border px-2 py-0.5 text-[7.5px] font-extrabold transition-all ${
                selectedMonitorFeed === feed.id
                  ? 'border-pink-500 text-white shadow-sm'
                  : 'border-purple-300 bg-white text-purple-950 hover:bg-purple-50'
              }`}
              style={selectedMonitorFeed === feed.id ? { background: SQUISHED_GRADIENT } : undefined}
            >
              {feed.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox="0 0 980 152"
        className="mx-auto h-24 sm:h-28 w-full"
        aria-label="Office Table with Speaker, PC Monitor, Chair, Couch and Safe"
      >
        <defs>
          <linearGradient id="officeGradMain" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0072FF" />
            <stop offset="25%" stopColor="#0A2B6D" />
            <stop offset="50%" stopColor="#5A00D6" />
            <stop offset="75%" stopColor="#A100FF" />
            <stop offset="100%" stopColor="#FF2E9A" />
          </linearGradient>
          <linearGradient id="chairLeatherGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0A2B6D" />
            <stop offset="50%" stopColor="#5A00D6" />
            <stop offset="100%" stopColor="#FF2E9A" />
          </linearGradient>
          <linearGradient id="tableWoodGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0A2B6D" />
            <stop offset="50%" stopColor="#5A00D6" />
            <stop offset="100%" stopColor="#A100FF" />
          </linearGradient>
        </defs>

        {/* Office Floor Rug under the Furniture */}
        <ellipse cx="490" cy="142" rx="465" ry="9" fill="#F5F0FF" stroke="#C084FC" strokeWidth="1.5" />

        {/* ==================== 1. INDOOR OFFICE PLANT (FAR LEFT) ==================== */}
        <g transform="translate(16, 36)">
          <path d="M24 62 C8 44, 6 24, 20 12 C26 26, 26 44, 24 62 Z" fill="#00C6FF" />
          <path d="M28 62 C28 36, 36 12, 48 4 C50 24, 42 44, 28 62 Z" fill="#0072FF" />
          <path d="M32 62 C44 42, 56 30, 66 26 C58 44, 46 54, 32 62 Z" fill="#C084FC" />
          <polygon points="14,62 46,62 41,96 19,96" fill="url(#officeGradMain)" stroke="#FF6EDB" strokeWidth="1.5" />
          <rect x="11" y="58" width="38" height="6" rx="2" fill="#0A2B6D" />
        </g>

        {/* ==================== 2. EXECUTIVE OFFICE CHAIR (FRONT-LEFT) ==================== */}
        <g transform="translate(95, 6)">
          <rect x="38" y="0" width="76" height="22" rx="9" fill="url(#chairLeatherGrad)" stroke="#f9a8d4" strokeWidth="2.2" />
          <path
            d="M24 24 Q76 16 128 24 L120 90 Q76 98 32 90 Z"
            fill="url(#chairLeatherGrad)"
            stroke="#93c5fd"
            strokeWidth="2.4"
          />
          <line x1="40" y1="45" x2="112" y2="45" stroke="#fbcfe8" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="38" y1="66" x2="114" y2="66" stroke="#fbcfe8" strokeWidth="1.5" strokeOpacity="0.7" />
          <path d="M8 52 Q18 46 26 54 L26 86 Q14 86 8 76 Z" fill="#1e40af" stroke="#93c5fd" strokeWidth="1.8" />
          <path d="M144 52 Q134 46 126 54 L126 86 Q138 86 144 76 Z" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.8" />
          <rect x="26" y="90" width="100" height="14" rx="7" fill="#312e81" stroke="#c4b5fd" strokeWidth="2" />
          <rect x="70" y="104" width="12" height="18" fill="#475569" />
          <path d="M34 124 L118 124" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M76 120 L42 130 M76 120 L110 130" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="38" cy="132" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
          <circle cx="76" cy="132" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
          <circle cx="114" cy="132" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
          <text x="76" y="145" textAnchor="middle" fill="#1e3a8a" fontSize="9.5" fontWeight="800">
            EXECUTIVE CHAIR
          </text>
        </g>

        {/* ==================== 3. OFFICE TABLE WITH SPEAKER, PC & PHONE (CENTER) ==================== */}
        <g transform="translate(270, 10)">
          {/* ---- STUDIO OFFICE SPEAKER ON THE TABLE ---- */}
          <g transform="translate(28, 6)">
            <rect x="0" y="0" width="58" height="70" rx="9" fill="#0f172a" stroke="#f472b6" strokeWidth="2.5" />
            <circle cx="29" cy="19" r="9.5" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
            <circle cx="29" cy="19" r="3.8" fill="#38bdf8" />
            <circle cx="29" cy="47" r="15.5" fill="#312e81" stroke="#c084fc" strokeWidth="2.2" />
            <circle cx="29" cy="47" r="8.5" fill="#7c3aed" stroke="#f9a8d4" strokeWidth="1.5" />
            <circle cx="29" cy="47" r="3.5" fill="#ec4899" />
            <path d="M-7 20 Q-13 33 -7 46" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M65 20 Q71 33 65 46" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" />
            <text x="29" y="-3" textAnchor="middle" fill="#7c3aed" fontSize="8.5" fontWeight="800">
              OFFICE SPEAKER
            </text>
          </g>

          {/* ---- INTERACTIVE WIDESCREEN PC MONITOR ON THE TABLE ---- */}
          <g transform="translate(116, 2)">
            <rect x="0" y="0" width="186" height="60" rx="7" fill="#0f172a" stroke="#93c5fd" strokeWidth="2.2" />
            <rect x="5" y="5" width="176" height="46" rx="4" fill="url(#officeGradMain)" />
            <text x="93" y="19" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
              COMPLIANCEHR INFINITY · {currentFeed.title}
            </text>
            <text x="93" y="30" textAnchor="middle" fill="#fde68a" fontSize="6.8" fontWeight="700">
              {currentFeed.sub}
            </text>
            <rect x="16" y="36" width="46" height="10" rx="2.5" fill="#ffffff" fillOpacity="0.92" />
            <rect x="69" y="36" width="46" height="10" rx="2.5" fill="#ffffff" fillOpacity="0.92" />
            <rect x="122" y="36" width="46" height="10" rx="2.5" fill="#ffffff" fillOpacity="0.92" />
            <rect x="83" y="60" width="20" height="10" fill="#475569" />
            <rect x="62" y="69" width="62" height="5" rx="2.5" fill="#94a3b8" />
          </g>

          {/* ---- OFFICE DESK PHONE ---- */}
          <g transform="translate(322, 22)">
            <rect x="0" y="0" width="62" height="52" rx="7" fill="#1e1b4b" stroke="#f9a8d4" strokeWidth="2" />
            <rect x="7" y="8" width="14" height="36" rx="5" fill="#312e81" stroke="#a5b4fc" strokeWidth="1.2" />
            <rect x="25" y="8" width="30" height="12" rx="2" fill="#38bdf8" />
            <circle cx="31" cy="28" r="2.2" fill="#ffffff" />
            <circle cx="40" cy="28" r="2.2" fill="#ffffff" />
            <circle cx="49" cy="28" r="2.2" fill="#ffffff" />
            <circle cx="31" cy="36" r="2.2" fill="#ffffff" />
            <circle cx="40" cy="36" r="2.2" fill="#ffffff" />
            <circle cx="49" cy="36" r="2.2" fill="#ec4899" />
          </g>

          {/* ---- OFFICE TABLE TOP & DRAWERS ---- */}
          <rect
            x="0"
            y="74"
            width="415"
            height="14"
            rx="6"
            fill="url(#tableWoodGrad)"
            stroke="#f9a8d4"
            strokeWidth="2"
          />
          <rect x="22" y="88" width="15" height="44" rx="3" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.2" />
          <rect x="148" y="88" width="120" height="34" rx="4" fill="#312e81" stroke="#c4b5fd" strokeWidth="1.5" />
          <line x1="148" y1="105" x2="268" y2="105" stroke="#a5b4fc" strokeWidth="1.2" />
          <circle cx="208" cy="97" r="2.5" fill="#fde68a" />
          <circle cx="208" cy="113" r="2.5" fill="#fde68a" />
          <rect x="378" y="88" width="15" height="44" rx="3" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.2" />

          <text x="208" y="136" textAnchor="middle" fill="#5b21b6" fontSize="9.5" fontWeight="800">
            OFFICE TABLE WITH SPEAKER, PC &amp; PHONE
          </text>
        </g>

        {/* ==================== 4. EXECUTIVE COUCH & COMPANY SAFE VAULT (RIGHT) ==================== */}
        <g transform="translate(705, 34)">
          <rect x="10" y="12" width="142" height="42" rx="11" fill="url(#officeGradMain)" stroke="#93c5fd" strokeWidth="1.8" />
          <line x1="57" y1="16" x2="57" y2="52" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.6" />
          <line x1="105" y1="16" x2="105" y2="52" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.6" />
          <rect x="0" y="28" width="18" height="46" rx="7" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />
          <rect x="144" y="28" width="18" height="46" rx="7" fill="#db2777" stroke="#f9a8d4" strokeWidth="1.5" />
          <rect x="12" y="50" width="138" height="24" rx="6" fill="url(#officeGradMain)" stroke="#f9a8d4" strokeWidth="1.5" />
          <rect x="18" y="74" width="8" height="14" rx="2" fill="#1e1b4b" />
          <rect x="136" y="74" width="8" height="14" rx="2" fill="#1e1b4b" />
          <text x="81" y="102" textAnchor="middle" fill="#7c3aed" fontSize="8.5" fontWeight="800">
            EXECUTIVE LOUNGE COUCH
          </text>

          <g transform="translate(174, 4)">
            <rect x="0" y="0" width="76" height="84" rx="8" fill="url(#officeGradMain)" stroke="#fde68a" strokeWidth="2" />
            <rect x="6" y="6" width="64" height="72" rx="5" fill="#1e1b4b" fillOpacity="0.4" stroke="#ffffff" strokeWidth="1" />
            <circle cx="34" cy="42" r="14" fill="#ffffff" stroke="#ec4899" strokeWidth="2" />
            <circle cx="34" cy="42" r="5" fill="#7c3aed" />
            <path d="M48 34 L58 34 M48 50 L58 50" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
            <text x="38" y="98" textAnchor="middle" fill="#be185d" fontSize="8.5" fontWeight="800">
              COMPANY SAFE
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function ComplianceHrPhotoFrame({ logoUrl }) {
  return (
    <WallHangingPictureFrame title="Logo & Full Slogan">
      <LogoWithFullSloganCard logoUrl={logoUrl} />
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
          <div className="truncate text-[8.5px] font-extrabold text-white">
            ComplianceHR Infinity Smart Vault · {FULL_SLOGAN}
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
  { key: 'task-dashboard', label: 'Tasks', icon: LayoutDashboard, color: '#0072FF' },
  { key: 'todo', label: 'To-Do Board', icon: ListTodo, color: '#0A2B6D' },
  { key: 'guide', label: 'Tips & Teamwork', icon: Lightbulb, color: '#5A00D6' },
  { key: 'templates', label: 'Templates', icon: BookMarked, color: '#A100FF' },
  { key: 'banter', label: 'Team Banter', icon: MessagesSquare, color: '#FF2E9A' },
  { key: 'feed', label: 'Team Feed', icon: Radio, color: '#A100FF' },
  { key: 'shoutouts', label: 'Shoutouts', icon: Sparkles, color: '#5A00D6' },
  { key: 'video', label: 'Video Calls', icon: Video, color: '#0A2B6D' },
  { key: 'complaints', label: 'Complaints', icon: MessagesSquare, color: '#0072FF' },
  { key: 'ai', label: 'AI Compose', icon: Sparkles, color: '#00C6FF' },
  { key: 'diary', label: 'Diary', icon: MessagesSquare, color: '#5A00D6' },
  { key: 'inbox', label: 'Inbox', icon: Inbox, color: '#A100FF' },
  { key: 'email', label: 'Send Email', icon: Mail, color: '#FF2E9A' },
  { key: 'shift-notes', label: 'Enter Shift Notes', icon: NotebookPen, color: '#FF6EDB' },
  { key: 'employee-log', label: 'Employee Log', icon: Briefcase, color: '#C084FC' },
];

function CommunicationCentreScreenshot({ showRosterAbove = true, onSelectSecondScreen }) {
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {COMM_CENTRE_MODULARS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectSecondScreen && onSelectSecondScreen(item.key === 'task-dashboard' || item.key === 'todo' ? 'tasks' : 'communications')}
                className="flex items-center gap-1 rounded border px-1.5 py-1 text-left text-[7px] font-extrabold text-blue-950 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: `${item.color}88`,
                  borderTopWidth: '2px',
                  borderTopColor: item.color,
                  background: `linear-gradient(165deg, ${item.color}22 0%, #ffffff 90%)`,
                }}
                title={`Select ${item.label} modular screen to review`}
              >
                <span
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white"
                  style={{ background: item.color }}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <span className="min-w-0 leading-tight">{item.label}</span>
              </button>
            );
          })}
          {/* Smart Vault right beside Employee Log */}
          <Link
            to="/company-safe"
            className="flex items-center gap-1 rounded border border-pink-400 px-1.5 py-1 text-[7px] font-extrabold text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
            title="ComplianceHR Infinity Smart Vault"
          >
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5">
              <Image
                src={DEFAULT_SOFTWARE_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="min-w-0 leading-tight">Smart Vault</span>
          </Link>
        </div>

        <SmallSafeVaultBar />
      </div>
    </div>
  );
}

/**
 * Interactive Profiles & Data Display View — rendered beside the Office View (or full width)
 * so users can compare and use both the unique Office Experience and the direct Data Display Choice!
 */
function ProfilesAndDataDisplayColumn({
  logoUrl,
  companyName,
  activeDataTab,
  setActiveDataTab,
  secondScreenKey,
  onSelectSecondScreen,
  selectedModulars,
  onToggleModular,
  onSelectPreset,
}) {
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

  const dataTabs = [
    { id: 'modular-picker', label: 'Select Modulars & Data', icon: LayoutGrid },
    { id: 'profiles', label: 'General Profiles', icon: Users },
    { id: 'safe', label: 'Safe & Identity', icon: Lock },
    { id: 'compliance', label: 'Compliance & Plans', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-full flex-col rounded-xl border-2 border-purple-500 bg-white p-1.5 shadow-sm space-y-1">
      {/* Header Banner of View 2 (General Profile & Modular Data Display Choice) with Logo + Full Slogan */}
      <div className="flex-1 space-y-1">
        <div
          className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 shadow">
              <Image
                src={logoUrl || DEFAULT_SOFTWARE_LOGO}
                alt="ComplianceHR Infinity Logo"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                VIEW 2 · GENERAL PROFILE &amp; SELECTABLE MODULAR DATA
              </div>
              <div className="truncate text-[8px] font-extrabold text-amber-100">
                {FULL_SLOGAN}
              </div>
            </div>
          </div>

          <span className="rounded-full bg-white px-2 py-0.5 text-[7.5px] font-extrabold text-purple-950 shadow-sm">
            Custom Data Choice
          </span>
        </div>

        {/* Data Display Choice Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {dataTabs.map((t) => {
            const Icon = t.icon;
            const active = activeDataTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveDataTab(t.id)}
                className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[8.5px] font-extrabold transition-all ${
                  active
                    ? 'border-pink-500 text-white shadow-sm'
                    : 'border-purple-200 bg-purple-50/50 text-blue-950 hover:bg-purple-100/70'
                }`}
                style={active ? { background: SQUISHED_GRADIENT } : undefined}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Interactive Modular Screen & Data Review Selector */}
        {activeDataTab === 'modular-picker' && (
          <ModularScreenDataSelector
            selectedModulars={selectedModulars}
            activeScreen={secondScreenKey}
            onSelectActiveScreen={onSelectSecondScreen}
            onToggleModular={onToggleModular}
            onSelectPreset={onSelectPreset}
            logoUrl={logoUrl || DEFAULT_SOFTWARE_LOGO}
            companyName={companyName}
            modeLabel="General Profile · Select Modulars & Data to Review"
          />
        )}

        {/* Tab 2: General Profiles Directory */}
        {activeDataTab === 'profiles' && (
          <div className="space-y-2 pt-0.5">
            <div className="grid grid-cols-1 gap-1.5">
              <Link
                to="/my-profile"
                className="group flex items-center justify-between rounded-xl border-2 border-blue-400 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-2.5 py-2 shadow-sm transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[11px] font-extrabold text-blue-950">My General Profile &amp; Work</div>
                    <div className="text-[9px] font-bold text-blue-700">Personal details, documents, name tag &amp; tasks</div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
              </Link>

              <Link
                to="/our-employees"
                className="group flex items-center justify-between rounded-xl border-2 border-purple-400 bg-gradient-to-r from-purple-50 via-white to-pink-50 px-2.5 py-2 shadow-sm transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow">
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[11px] font-extrabold text-purple-950">Our Employee Profiles ({staff.length})</div>
                    <div className="text-[9px] font-bold text-purple-700">Staff files, HR compliance, shifts &amp; badges</div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-purple-600" />
              </Link>

              <Link
                to="/our-participants"
                className="group flex items-center justify-between rounded-xl border-2 border-pink-400 bg-gradient-to-r from-pink-50 via-white to-amber-50 px-2.5 py-2 shadow-sm transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-600 text-white shadow">
                    <Heart className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[11px] font-extrabold text-pink-950">Our Participant Profiles ({participants.length})</div>
                    <div className="text-[9px] font-bold text-pink-700">NDIS plans, goals, consents, risks &amp; shift notes</div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-pink-600" />
              </Link>
            </div>

            {/* Live Directory Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="rounded-xl border border-purple-300 bg-white p-2">
                <div
                  className="mb-1.5 flex items-center justify-between rounded px-2 py-0.5 text-white"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <span className="text-[9px] font-extrabold">Employee Directory</span>
                  <Link to="/our-employees" className="rounded bg-white px-1.5 py-0 text-[7.5px] font-extrabold text-purple-900">
                    Open All
                  </Link>
                </div>
                {loading ? (
                  <div className="py-2 text-center text-[9px] font-bold text-purple-700">Loading staff…</div>
                ) : staff.length === 0 ? (
                  <Link to="/our-employees" className="block py-2 text-center text-[9px] font-extrabold text-purple-800 underline">
                    Open Employee Profiles Directory →
                  </Link>
                ) : (
                  <div className="space-y-1">
                    {staff.slice(0, 4).map((person) => (
                      <Link
                        key={person.id}
                        to={`/our-employees/${person.id}`}
                        className="flex items-center gap-1.5 rounded border border-purple-200 bg-purple-50/50 px-1.5 py-1 hover:bg-purple-100"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[8px] font-extrabold text-white">
                          {(person.full_name || 'S')[0]}
                        </span>
                        <span className="truncate text-[8.5px] font-extrabold text-purple-950">{person.full_name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-pink-300 bg-white p-2">
                <div
                  className="mb-1.5 flex items-center justify-between rounded px-2 py-0.5 text-white"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <span className="text-[9px] font-extrabold">Participant Directory</span>
                  <Link to="/our-participants" className="rounded bg-white px-1.5 py-0 text-[7.5px] font-extrabold text-pink-900">
                    Open All
                  </Link>
                </div>
                {loading ? (
                  <div className="py-2 text-center text-[9px] font-bold text-pink-700">Loading participants…</div>
                ) : participants.length === 0 ? (
                  <Link to="/our-participants" className="block py-2 text-center text-[9px] font-extrabold text-pink-800 underline">
                    Open Participant Profiles Directory →
                  </Link>
                ) : (
                  <div className="space-y-1">
                    {participants.slice(0, 4).map((person) => (
                      <Link
                        key={person.id}
                        to={`/our-participants/${person.id}`}
                        className="flex items-center gap-1.5 rounded border border-pink-200 bg-pink-50/50 px-1.5 py-1 hover:bg-pink-100"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pink-600 text-[8px] font-extrabold text-white">
                          {(person.full_name || 'P')[0]}
                        </span>
                        <span className="truncate text-[8.5px] font-extrabold text-pink-950">{person.full_name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeDataTab === 'safe' && (
          <CompanySafeMaterialPanel companyName={companyName} logoUrl={logoUrl || DEFAULT_SOFTWARE_LOGO} />
        )}

        {activeDataTab === 'compliance' && (
          <ComplianceAndOperationsMaterialPanel />
        )}
      </div>

      {/* Logo-Branded Office Item Showing Another Screen in the Office (Also synced with the selected modulars) */}
      <LogoBrandedOfficeSecondScreen
        logoUrl={logoUrl || DEFAULT_SOFTWARE_LOGO}
        selectedScreen={secondScreenKey}
        onSelectScreen={onSelectSecondScreen}
        companyName={companyName}
      />
    </div>
  );
}

const LAYOUT_CHOICES = [
  { id: 'both', label: 'Both Views Side-by-Side', icon: Columns },
  { id: 'office', label: 'Office View Only', icon: Building2 },
  { id: 'profiles', label: 'Profiles & Data View Only', icon: Users },
];

export default function ExecutiveWallScene({
  logoUrl,
  companyName = 'ComplianceHR Infinity',
  showRosterAbove = true,
  defaultViewMode,
}) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;
  const [viewMode, setViewMode] = useState(() => {
    if (defaultViewMode) return defaultViewMode;
    const saved = localStorage.getItem('chr-workspace-view-mode');
    return saved || 'both';
  });
  const [monitorFeed, setMonitorFeed] = useState('overview');
  const [activeDataTab, setActiveDataTab] = useState('modular-picker');
  const [secondScreenKey, setSecondScreenKey] = useState('rostering');
  const [selectedModulars, setSelectedModulars] = useState(['rostering', 'our-staff', 'our-participants', 'communications']);

  const handleToggleModular = (modKey) => {
    setSelectedModulars((prev) =>
      prev.includes(modKey)
        ? prev.length > 1
          ? prev.filter((k) => k !== modKey)
          : prev
        : [...prev, modKey]
    );
  };

  const handleSelectScreenInOffice = (modKey) => {
    setSecondScreenKey(modKey);
    setSelectedModulars((prev) => (prev.includes(modKey) ? prev : [modKey, ...prev.slice(0, 3)]));
  };

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
      {/* Top Ceiling Crown Moulding / Gallery Lighting Bar with Side-by-Side & Single View Switcher */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-white"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5 shadow">
            <Image src={frameSrc} alt="Logo" fittingType="fit" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[9.5px] font-extrabold uppercase tracking-wider text-white">
              {companyName} · {FULL_SLOGAN}
            </div>
          </div>
        </div>

        {/* View Comparison Switcher: Both Views Beside Each Other vs Office Only vs Profiles/Data Only */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex flex-wrap items-center gap-1 rounded-full bg-white/20 p-0.5 backdrop-blur-sm">
            {LAYOUT_CHOICES.map((choice) => {
              const Icon = choice.icon;
              const active = viewMode === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => selectMode(choice.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold transition-all ${
                    active
                      ? 'bg-white text-blue-950 shadow-sm'
                      : 'text-white hover:bg-white/15'
                  }`}
                >
                  <Icon className={`h-2.5 w-2.5 ${active ? 'text-pink-600' : 'text-white'}`} />
                  {choice.label}
                </button>
              );
            })}
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[8.5px] font-extrabold text-blue-950 shadow-sm hover:bg-pink-50"
          >
            <LogIn className="h-2.5 w-2.5 text-blue-600" />
            Sign In
          </Link>
        </div>
      </div>

      {/* MAIN BODY: Responsive Layout for Both Views Beside Each Other ('both') or Single View ('office' / 'profiles') */}
      <div className="bg-white p-1.5">
        <div
          className={
            viewMode === 'both'
              ? 'grid grid-cols-1 xl:grid-cols-12 gap-2 items-stretch'
              : 'space-y-2'
          }
        >
          {/* ==================== VIEW 1: THE UNIQUE EXECUTIVE OFFICE EXPERIENCE ==================== */}
          {(viewMode === 'both' || viewMode === 'office') && (
            <div
              className={`${
                viewMode === 'both' ? 'xl:col-span-7' : 'w-full'
              } flex flex-col rounded-xl border-2 border-blue-500 bg-white p-1.5 shadow-sm space-y-1.5`}
            >
              {/* View 1 Header Badge */}
              <div
                className="flex flex-wrap items-center justify-between gap-1 rounded-md px-2 py-1 text-white shadow-sm"
                style={{ background: SQUISHED_GRADIENT }}
              >
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-amber-200" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wider">
                    VIEW 1 · UNIQUE EXECUTIVE OFFICE EXPERIENCE (WALL, TABLE, SPEAKER, CHAIR &amp; SCREENS)
                  </span>
                </div>
                <span className="rounded-full bg-white px-1.5 py-0 text-[7px] font-extrabold text-blue-950">
                  Interactive Office Room
                </span>
              </div>

              {/* OFFICE WALL WITH HANGING FRAMED SCREENSHOTS — Equal-Height Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 items-stretch">
                <div className="lg:col-span-7 flex flex-col gap-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 items-stretch">
                    {/* PICTURE 1: Updated Logo with Full Slogan Shown */}
                    <WallHangingPictureFrame title="Logo & Full Slogan" className="h-full">
                      <LogoWithFullSloganCard
                        logoUrl={frameSrc}
                        companyName={companyName}
                        compact={true}
                      />
                    </WallHangingPictureFrame>

                    {/* PICTURE 2: Screenshot of "Compliance management, simplified end to end." with Slogan */}
                    <WallHangingPictureFrame title="Headline & Full Slogan" className="h-full">
                      <div className="flex h-full flex-col items-center justify-center rounded bg-white px-1.5 py-1 text-center">
                        <div className="font-editorial text-[11px] sm:text-xs font-bold leading-tight text-blue-950">
                          Compliance management,
                          <span className="block font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                            simplified end to end.
                          </span>
                        </div>
                        <div
                          className="mt-1 w-full rounded-md px-1.5 py-0.5 text-[7px] font-extrabold uppercase leading-tight tracking-wide text-white shadow-sm"
                          style={{ background: SQUISHED_GRADIENT }}
                        >
                          {FULL_SLOGAN}
                        </div>
                      </div>
                    </WallHangingPictureFrame>
                  </div>

                  {/* PICTURE 3: Screenshot of All 45 Modules (flex-1 so bottom aligns with Silver Screen) */}
                  <WallHangingPictureFrame
                    title={`${companyName} · All ${MODULE_DIRECTORY.length} Modules`}
                    className="flex-1"
                  >
                    <div className="flex h-full flex-col justify-between gap-1 bg-white">
                      <div
                        className="flex flex-wrap items-center justify-between gap-1 rounded px-2 py-0.5 text-white"
                        style={{ background: SQUISHED_GRADIENT }}
                      >
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold">
                          <LayoutGrid className="h-2.5 w-2.5" /> {companyName}
                        </span>
                        <span className="text-[7px] font-extrabold">
                          Click any module to show on Office Screen #2 →
                        </span>
                      </div>

                      <div className="grid flex-1 content-between grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                        {MODULE_DIRECTORY.map((mod) => {
                          const Icon = mod.icon;
                          const colour = moduleKeyColour(mod.key);
                          const isSelected = secondScreenKey === mod.key || selectedModulars.includes(mod.key);
                          return (
                            <button
                              key={mod.key}
                              type="button"
                              onClick={() => handleSelectScreenInOffice(mod.key)}
                              className={`flex items-center gap-1 rounded border bg-white px-1.5 py-1 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                                isSelected ? 'ring-1 ring-pink-500 bg-pink-50/40' : ''
                              }`}
                              style={{
                                borderColor: colour,
                                borderLeftWidth: '3px',
                              }}
                              title={`Select ${mod.label} modular screen to review`}
                            >
                              <span
                                className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white"
                                style={{ background: colour }}
                              >
                                <Icon className="h-2.5 w-2.5" />
                              </span>
                              <span className="min-w-0 flex-1 text-[6.8px] font-extrabold text-blue-950 leading-tight">
                                {mod.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </WallHangingPictureFrame>
                </div>

                {/* RIGHT SIDE OF THE OFFICE WALL (5 cols):
                    Picture 4: Screenshot of Communication Centre Modulars & Today's Roster Overview
                    with the Squashed Silver Screen mounted directly underneath it */}
                <div className="lg:col-span-5 flex flex-col gap-1.5">
                  <WallHangingPictureFrame title="Communication Centre Modulars & Today's Roster">
                    <CommunicationCentreScreenshot
                      showRosterAbove={showRosterAbove}
                      onSelectSecondScreen={handleSelectScreenInOffice}
                    />
                  </WallHangingPictureFrame>

                  <WallHangingPictureFrame
                    title="Silver Screen · Weather & NDIS News"
                    frameAccent="linear-gradient(135deg, #64748b 0%, #cbd5e1 50%, #475569 100%)"
                    className="flex-1"
                  >
                    <SilverScreenSplit />
                  </WallHangingPictureFrame>
                </div>
              </div>

              {/* Full-Width Logo-Branded Office Smart Screen #2 directly beneath the equal-height wall frames */}
              <LogoBrandedOfficeSecondScreen
                logoUrl={frameSrc}
                selectedScreen={secondScreenKey}
                onSelectScreen={handleSelectScreenInOffice}
                companyName={companyName}
              />

              {viewMode === 'office' && (
                <ModularScreenDataSelector
                  selectedModulars={selectedModulars}
                  activeScreen={secondScreenKey}
                  onSelectActiveScreen={handleSelectScreenInOffice}
                  onToggleModular={handleToggleModular}
                  onSelectPreset={(keys) => {
                    setSelectedModulars(keys);
                    if (keys[0]) setSecondScreenKey(keys[0]);
                  }}
                  logoUrl={frameSrc}
                  companyName={companyName}
                  modeLabel="Enhanced Office Experience · Select Modulars & Data to Review"
                />
              )}

              {/* OFFICE FLOOR EQUIPMENT: CHAIR, TABLE WITH SPEAKER, PC MONITOR & PHONE, COUCH, PLANT & SAFE */}
              <OfficeEquipmentWithInteractiveScreen
                selectedMonitorFeed={monitorFeed}
                onSelectMonitorFeed={setMonitorFeed}
                onSelectDataTab={setActiveDataTab}
              />
            </div>
          )}

          {/* ==================== VIEW 2: GENERAL PROFILE & SELECTABLE MODULAR DATA DISPLAY (BESIDE THE OFFICE VIEW) ==================== */}
          {(viewMode === 'both' || viewMode === 'profiles') && (
            <div className={viewMode === 'both' ? 'xl:col-span-5' : 'w-full'}>
              <ProfilesAndDataDisplayColumn
                logoUrl={frameSrc}
                companyName={companyName}
                activeDataTab={activeDataTab}
                setActiveDataTab={setActiveDataTab}
                secondScreenKey={secondScreenKey}
                onSelectSecondScreen={handleSelectScreenInOffice}
                selectedModulars={selectedModulars}
                onToggleModular={handleToggleModular}
                onSelectPreset={(keys) => {
                  setSelectedModulars(keys);
                  if (keys[0]) setSecondScreenKey(keys[0]);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Infinity Core Engine + Recreated Master Compliance Audit Checklist Forms (CHR-AUD-001 & CHR-AUD-002) */}
      <div className="bg-white px-1 pb-1 space-y-1">
        <InfinityCoreEngine compact={true} />
        <MasterComplianceAuditForms />
      </div>

      {/* Bottom Office Baseboard Trim */}
      <div
        className="h-2 w-full border-t-2 border-amber-300"
        style={{ background: SQUISHED_GRADIENT }}
      />
    </div>
  );
}