import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid, Users, Heart, MessagesSquare, ListTodo, Siren, AlertTriangle,
  Calendar, ShieldCheck, Award, FolderLock, DollarSign,
  Search, ExternalLink, UserRound, Layers,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';
export const DEFAULT_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';
export const FULL_SLOGAN = 'Complete Control. Greater Confidence. Brighter Success.';

export const MODULAR_SCREEN_DECKS = [
  {
    key: 'our-staff',
    label: 'Employee Profiles & HR',
    shortLabel: 'Employee Profiles',
    category: 'People & Profiles',
    path: '/our-employees',
    color: '#2563eb',
    icon: Users,
    description: 'Staff directory, HR files, NDIS worker screening, contracts & badges.',
    highlights: [
      { id: 'h1', title: 'Staff Directory & HR Files', subtitle: 'Screening, Police Check, Blue Card & Contracts', badge: 'HR Live' },
      { id: 'h2', title: 'Staff ID Badges & Onboarding', subtitle: 'Verified NDIS Worker Credentials & Appraisals', badge: 'Cleared' },
    ],
  },
  {
    key: 'our-participants',
    label: 'Participant Profiles & Plans',
    shortLabel: 'Participant Profiles',
    category: 'People & Profiles',
    path: '/our-participants',
    color: '#e11d48',
    icon: Heart,
    description: 'Participant profiles, NDIS plans, goals, consents, medications & safeguards.',
    highlights: [
      { id: 'p1', title: 'NDIS Support Plans & Budgets', subtitle: 'Goals, Support Shifts, Medications & Consents', badge: 'NDIS Plan' },
      { id: 'p2', title: 'Participant Risk & Safeguards', subtitle: 'Triggers, Control Measures & 3-Monthly Reviews', badge: 'Active' },
    ],
  },
  {
    key: 'my-profile',
    label: 'General Personal Profile & Work',
    shortLabel: 'My General Profile',
    category: 'People & Profiles',
    path: '/my-profile',
    color: '#db2777',
    icon: UserRound,
    description: 'Personal profile details, assigned work, my documents, availability & staff tag.',
    highlights: [
      { id: 'm1', title: 'My Personal Details & My Work', subtitle: 'Self-service profile, shifts, tasks & availability', badge: 'Self-Service' },
      { id: 'm2', title: 'My Documents & Digital Name Tag', subtitle: 'Uploaded certificates, signed policies & ID badge', badge: 'Ready' },
    ],
  },
  {
    key: 'communications',
    label: 'Communication Centre & Shift Notes',
    shortLabel: 'Comms & Shift Notes',
    category: 'Operations & Comms',
    path: '/communications',
    color: '#0891b2',
    icon: MessagesSquare,
    description: 'Live alerts, shift notes, employee log, team feed, banter, inbox & AI compose.',
    highlights: [
      { id: 'c1', title: 'Shift Notes & Unified Comms Diary', subtitle: 'Auto-routed participant & staff communication logs', badge: 'Live Feed' },
      { id: 'c2', title: 'Active Alerts, Inbox & Team Banter', subtitle: 'Instant broadcasts, templates, video & AI compose', badge: '16 Modulars' },
    ],
  },
  {
    key: 'tasks',
    label: 'Tasks & Shared To-Do Board',
    shortLabel: 'Tasks & To-Do',
    category: 'Operations & Comms',
    path: '/tasks',
    color: '#ef4444',
    icon: ListTodo,
    description: 'Assigned tasks, priority queue, digital sign-offs, overdue alerts & leaderboard.',
    highlights: [
      { id: 't1', title: 'Shared To-Do Command Board', subtitle: 'Priority tasks, responsible staff & digital sign-off', badge: 'Command' },
      { id: 't2', title: 'Task Competition & Overdue Alerts', subtitle: 'Automated reminders, 30-task reports & rankings', badge: 'Tracked' },
    ],
  },
  {
    key: 'rostering',
    label: 'Rostering & Shift Coverage',
    shortLabel: 'Rostering & Shifts',
    category: 'Operations & Comms',
    path: '/roster',
    color: '#6366f1',
    icon: Calendar,
    description: 'Daily shift roster, worker screening validation, leave feed & timesheets.',
    highlights: [
      { id: 'r1', title: 'Weekly Shift Roster & Heat Map', subtitle: 'Live staff allocation, open shifts & sign-off', badge: 'Roster' },
      { id: 'r2', title: 'Screening Validation & Leave Feed', subtitle: 'Blocks expired credentials & syncs availability', badge: 'Verified' },
    ],
  },
  {
    key: 'compliance',
    label: 'Business Health & Compliance Intelligence + Master Audit (CHR-AUD-001/002)',
    shortLabel: 'Compliance & Intelligence',
    category: 'Compliance & Safety',
    path: '/compliance',
    color: '#6d28d9',
    icon: ShieldCheck,
    description: '98.7% Business Health & Compliance Intelligence · 8 Pillars · 17 Audit Categories · 356 Checkpoints · 12 Printable A4 Docs.',
    highlights: [
      { id: 'a0', title: 'Business Health & Compliance Intelligence Dashboard', subtitle: '98.7% Readiness · 8 Pillars · Predictive 14/30/60/90d Expiry Radar', badge: '98.7% Health' },
      { id: 'a1', title: 'ComplianceHR Infinity · Governance Audit (CHR-AUD-001)', subtitle: '17 Audit Categories | 356 Checkpoints · Kristy Lee Whelan', badge: 'Page 1 of 11' },
      { id: 'a2', title: '12 Standard 2026 Printable Office Templates (A4)', subtitle: 'Smart-Filled & Blank Ruled Office Print Masters + Multi-Page PDF Pack', badge: 'A4 Print' },
    ],
  },
  {
    key: 'incidents',
    label: 'Incidents & Reportable Events',
    shortLabel: 'Incidents',
    category: 'Compliance & Safety',
    path: '/incidents',
    color: '#dc2626',
    icon: Siren,
    description: 'Incident register, 24h/5d NDIS notifications, investigations & root-cause actions.',
    highlights: [
      { id: 'i1', title: 'NDIS 24-Hour & 5-Day Notification', subtitle: 'Reportable incident workflow, WHS & photo evidence', badge: '24h / 5d' },
      { id: 'i2', title: 'Investigations & Corrective Actions', subtitle: 'Root-cause analysis, follow-ups & trend analytics', badge: 'Monitored' },
    ],
  },
  {
    key: 'risks',
    label: 'Risk Register & Controls',
    shortLabel: 'Risks & Safety',
    category: 'Compliance & Safety',
    path: '/risks',
    color: '#ea580c',
    icon: AlertTriangle,
    description: 'Organisational, clinical & participant risk assessments and control measures.',
    highlights: [
      { id: 'rk1', title: 'Enterprise & Participant Risk Matrix', subtitle: 'Likelihood × Consequence ratings & mitigation plans', badge: 'Matrix' },
      { id: 'rk2', title: 'Take-5 Safety, Drills & MSDS Checks', subtitle: 'Hierarchy of controls, home assessments & kits', badge: 'Controls' },
    ],
  },
  {
    key: 'training',
    label: 'Training & Certificates',
    shortLabel: 'Training & Certs',
    category: 'Workforce & Safe',
    path: '/training',
    color: '#0d9488',
    icon: Award,
    description: 'Mandatory staff training modules, competency quizzes & expiring certificates.',
    highlights: [
      { id: 'tr1', title: 'LMS Courses & AI Competency Quizzes', subtitle: 'NDIS orientation, infection control & manual handling', badge: 'Academy' },
      { id: 'tr2', title: 'Certificate Expiry & Renewal Alerts', subtitle: 'Automated 14-day & 30-day credential reminders', badge: 'Tracked' },
    ],
  },
  {
    key: 'company-safe',
    label: 'Company Safe & Smart Vault',
    shortLabel: 'Company Safe',
    category: 'Workforce & Safe',
    path: '/company-safe',
    color: '#7c3aed',
    icon: FolderLock,
    description: 'Business identity, NDIS registration credentials, policies & document vault.',
    highlights: [
      { id: 'cs1', title: 'Official Business Identity & Safe', subtitle: 'Software · Business · Developer · Email & ABN', badge: 'Locked Safe' },
      { id: 'cs2', title: 'Smart Document Vault & Policies', subtitle: 'Versioned policies, acknowledgements & templates', badge: 'Vault' },
    ],
  },
  {
    key: 'invoicing',
    label: 'Invoicing, Quotes & Finance',
    shortLabel: 'Invoicing & Finance',
    category: 'Workforce & Safe',
    path: '/invoicing',
    color: '#16a34a',
    icon: DollarSign,
    description: 'NDIS claims, client invoices, service quotes, receipts & bank reconciliation.',
    highlights: [
      { id: 'f1', title: 'NDIS Price Guide Invoicing & PRODA', subtitle: 'Automated shift-to-invoice billing & aged receivables', badge: 'Billing' },
      { id: 'f2', title: 'Quotes, Receipts & Bank Reconciliation', subtitle: 'AI receipt scanner, 3-way match & purchase orders', badge: 'Finance' },
    ],
  },
];

async function fetchLiveScreenRecords(moduleKey) {
  try {
    switch (moduleKey) {
      case 'our-staff':
      case 'human-resources':
      case 'my-profile': {
        const res = await base44.entities.StaffProfile.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.full_name || r.email || 'Staff Member',
          subtitle: [r.role_title || r.position || 'Staff', r.employment_type].filter(Boolean).join(' · '),
          badge: r.status || 'Active',
          to: `/our-employees/${r.id}`,
        }));
      }
      case 'our-participants':
      case 'intake':
      case 'goals': {
        const res = await base44.entities.ParticipantProfile.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.full_name || 'Participant',
          subtitle: [r.ndis_number && `NDIS: ${r.ndis_number}`, r.support_type].filter(Boolean).join(' · ') || 'Participant Profile',
          badge: r.status || 'Active',
          to: `/our-participants/${r.id}`,
        }));
      }
      case 'communications': {
        const res = await base44.entities.CommunicationEntry.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.subject || r.entry_kind || 'Communication Entry',
          subtitle: [r.person_name, r.sender_name, r.entry_date].filter(Boolean).join(' · ') || (r.body || '').slice(0, 50),
          badge: r.entry_kind || 'Log',
          to: '/communications',
        }));
      }
      case 'tasks': {
        const res = await base44.entities.TodoTask.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.title || 'Task',
          subtitle: [r.assigned_to && `Assigned: ${r.assigned_to}`, r.due_date && `Due: ${r.due_date}`, r.module].filter(Boolean).join(' · '),
          badge: r.status || r.priority || 'Open',
          to: '/tasks',
        }));
      }
      case 'incidents':
      case 'incident-analytics':
      case 'emergency-response': {
        const res = await base44.entities.Incident.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.title || 'Incident Record',
          subtitle: [r.category, r.participant_name, r.date_occurred].filter(Boolean).join(' · '),
          badge: `${r.severity || 'Medium'} · ${r.status || 'Reported'}`,
          to: `/incidents/${r.id}`,
        }));
      }
      case 'risks': {
        const res = await base44.entities.Risk.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.title || 'Risk Entry',
          subtitle: [r.category, r.owner && `Owner: ${r.owner}`, r.control_measures].filter(Boolean).join(' · '),
          badge: `${r.rating || 'Medium'} · ${r.status || 'Identified'}`,
          to: '/risks',
        }));
      }
      case 'rostering': {
        const res = await base44.entities.Shift.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: `${r.participant_name || 'Shift'} — ${r.staff_name || 'Unassigned'}`,
          subtitle: [r.date || r.shift_date, r.start_time && `${r.start_time}–${r.end_time || ''}`].filter(Boolean).join(' · '),
          badge: r.status || 'Scheduled',
          to: '/roster',
        }));
      }
      case 'compliance':
      case 'auditor-portal':
      case 'quality': {
        const res = await base44.entities.ComplianceIssue.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.title || r.issue_title || 'Compliance Item',
          subtitle: [r.category || r.standard, r.owner].filter(Boolean).join(' · '),
          badge: r.status || r.severity || 'Active',
          to: '/compliance',
        }));
      }
      case 'training':
      case 'certificates': {
        const res = await base44.entities.Certificate.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.title || r.certificate_name || 'Staff Certificate',
          subtitle: [r.staff_name || r.employee_name, r.expiry_date && `Exp: ${r.expiry_date}`].filter(Boolean).join(' · '),
          badge: r.status || 'Current',
          to: '/certificates',
        }));
      }
      case 'documents':
      case 'company-safe': {
        const res = await base44.entities.EmployeeDocument.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.title || r.document_type || 'Document',
          subtitle: [r.employee_name, r.document_type, r.expiry_date && `Exp: ${r.expiry_date}`].filter(Boolean).join(' · '),
          badge: r.status || 'Current',
          to: '/documents',
        }));
      }
      case 'invoicing':
      case 'quotes':
      case 'receipts': {
        const res = await base44.entities.Invoice.list({ sort: '-created_date', limit: 4 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.invoice_number ? `Invoice #${r.invoice_number} — ${r.participant_name || r.client_name || ''}` : (r.title || 'Invoice'),
          subtitle: [r.issue_date, r.total_amount != null && `$${Number(r.total_amount).toFixed(2)}`].filter(Boolean).join(' · '),
          badge: r.status || 'Issued',
          to: '/invoicing',
        }));
      }
      default:
        return [];
    }
  } catch {
    return [];
  }
}

export default function ModularScreenDataSelector({
  selectedModulars = ['our-staff', 'our-participants', 'communications', 'compliance'],
  activeScreen = 'our-staff',
  onSelectActiveScreen,
  onToggleModular,
  onSelectPreset,
  logoUrl = DEFAULT_LOGO,
  companyName = 'ComplianceHR Infinity',
  modeLabel = 'General Profile · Select Modulars & Data',
  compact = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll45Picker, setShowAll45Picker] = useState(false);
  const [recordsByModule, setRecordsByModule] = useState({});

  const effectiveSelected = useMemo(() => {
    const list = Array.isArray(selectedModulars) && selectedModulars.length > 0
      ? selectedModulars
      : [activeScreen || 'our-staff'];
    return list.includes(activeScreen) ? list : [activeScreen, ...list];
  }, [selectedModulars, activeScreen]);

  useEffect(() => {
    let active = true;
    effectiveSelected.forEach((modKey) => {
      if (recordsByModule[modKey]) return;
      fetchLiveScreenRecords(modKey).then((rows) => {
        if (!active) return;
        setRecordsByModule((prev) => ({ ...prev, [modKey]: rows }));
      });
    });
    return () => { active = false; };
  }, [effectiveSelected]);

  const resolveMeta = (key) => {
    const deck = MODULAR_SCREEN_DECKS.find((d) => d.key === key);
    if (deck) return deck;
    const mod = MODULE_DIRECTORY.find((m) => m.key === key);
    if (mod) {
      return {
        key: mod.key,
        label: mod.label,
        shortLabel: mod.label,
        category: mod.group || 'Module',
        path: mod.path,
        color: moduleKeyColour(mod.key),
        icon: mod.icon || LayoutGrid,
        description: `Live ${mod.label} records, compliance actions, and operational workspace.`,
        highlights: [
          { id: `${mod.key}-1`, title: `${mod.label} Register & Live Data`, subtitle: 'Real-time records, audit trail & exports', badge: 'Live' },
          { id: `${mod.key}-2`, title: `${mod.label} Compliance & Workflows`, subtitle: 'Automated alerts, tasks & NDIS alignment', badge: 'Active' },
        ],
      };
    }
    return MODULAR_SCREEN_DECKS[0];
  };

  const presets = [
    { label: 'People & Profiles (4)', keys: ['my-profile', 'our-staff', 'our-participants', 'communications'] },
    { label: 'Comms, Roster & Tasks (4)', keys: ['communications', 'rostering', 'tasks', 'incidents'] },
    { label: 'Audit, Risk & Safety (4)', keys: ['compliance', 'incidents', 'risks', 'company-safe'] },
    { label: 'Safe, HR & Finance (4)', keys: ['company-safe', 'training', 'invoicing', 'our-staff'] },
  ];

  return (
    <div className="rounded-lg border border-purple-400 bg-white p-1.5 space-y-1">
      {/* Compact Header Bar with Logo + Full Slogan */}
      <div
        className="flex flex-wrap items-center justify-between gap-1 rounded-md px-2 py-1 text-white"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5">
            <Image src={logoUrl || DEFAULT_LOGO} alt="Logo" fittingType="fit" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <Layers className="h-2.5 w-2.5 shrink-0 text-amber-200" />
              <span className="truncate text-[8.5px] font-extrabold uppercase tracking-wider">
                {modeLabel}
              </span>
            </div>
            <div className="truncate text-[7px] font-extrabold text-amber-100">
              {companyName} · {FULL_SLOGAN}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAll45Picker((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[7.5px] font-extrabold text-blue-950 shadow-sm hover:bg-pink-50"
        >
          <LayoutGrid className="h-2.5 w-2.5 text-pink-600" />
          {showAll45Picker ? 'Hide All 45' : `All ${MODULE_DIRECTORY.length} Modulars`}
        </button>
      </div>

      {/* Quick Preset Packs + Search Filter in One Tight Row */}
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div className="flex flex-wrap items-center gap-0.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelectPreset && onSelectPreset(preset.keys)}
              className="rounded border border-purple-300 bg-purple-50/80 px-1.5 py-0.5 text-[7px] font-extrabold text-purple-950 hover:bg-purple-100"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[110px] max-w-[170px]">
          <Search className="pointer-events-none absolute left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-purple-600" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter modulars…"
            className="h-5 w-full rounded border border-purple-300 bg-white pl-5 pr-1.5 text-[7.5px] font-bold text-blue-950 placeholder:text-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Core 12 Modular Screen Check-Pills — Zero Gap Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-0.5">
        {MODULAR_SCREEN_DECKS.map((deck) => {
          const Icon = deck.icon;
          const isChecked = effectiveSelected.includes(deck.key);
          const isFocused = activeScreen === deck.key;
          return (
            <div
              key={deck.key}
              className={`flex items-center justify-between gap-0.5 rounded border px-1 py-0.5 transition-all ${
                isFocused ? 'ring-1 ring-pink-500' : ''
              }`}
              style={{
                borderColor: deck.color,
                borderLeftWidth: '3px',
                background: isChecked
                  ? `linear-gradient(135deg, ${deck.color}22 0%, #ffffff 85%)`
                  : '#ffffff',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (onSelectActiveScreen) onSelectActiveScreen(deck.key);
                  if (!isChecked && onToggleModular) onToggleModular(deck.key);
                }}
                className="flex items-center gap-1 min-w-0 flex-1 text-left"
              >
                <span
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white"
                  style={{ background: deck.color }}
                >
                  <Icon className="h-2 w-2" />
                </span>
                <span className="truncate text-[7.2px] font-extrabold text-blue-950">
                  {deck.shortLabel}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleModular && onToggleModular(deck.key)}
                className={`shrink-0 rounded px-1 text-[6.5px] font-extrabold ${
                  isChecked
                    ? 'bg-pink-600 text-white'
                    : 'border border-purple-200 bg-white text-purple-900'
                }`}
              >
                {isChecked ? '✓' : '+'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Expandable Full 45-Module Selector Drawer */}
      {showAll45Picker && (
        <div className="rounded-lg border border-purple-300 bg-purple-50/40 p-1.5 space-y-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-0.5 max-h-40 overflow-y-auto">
            {MODULE_DIRECTORY.filter((m) =>
              !searchQuery.trim() ||
              m.label.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((mod) => {
              const Icon = mod.icon;
              const colour = moduleKeyColour(mod.key);
              const selected = effectiveSelected.includes(mod.key);
              return (
                <button
                  key={mod.key}
                  type="button"
                  onClick={() => {
                    if (onSelectActiveScreen) onSelectActiveScreen(mod.key);
                    if (onToggleModular) onToggleModular(mod.key);
                  }}
                  className={`flex items-center justify-between gap-0.5 rounded border bg-white px-1 py-0.5 text-left ${
                    selected ? 'ring-1 ring-pink-500 bg-pink-50/40' : ''
                  }`}
                  style={{ borderColor: colour, borderLeftWidth: '3px' }}
                >
                  <span className="flex items-center gap-1 min-w-0">
                    <span
                      className="flex h-3 w-3 shrink-0 items-center justify-center rounded text-white"
                      style={{ background: colour }}
                    >
                      <Icon className="h-2 w-2" />
                    </span>
                    <span className="truncate text-[7px] font-extrabold text-blue-950">{mod.label}</span>
                  </span>
                  <span className={`shrink-0 rounded px-0.5 text-[6px] font-extrabold ${selected ? 'bg-pink-600 text-white' : 'text-purple-800'}`}>
                    {selected ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Modular Screen Data Cards — last:odd:col-span-full eliminates any empty grid slot */}
      <div className={`grid grid-cols-1 ${effectiveSelected.length > 1 && !compact ? 'sm:grid-cols-2' : ''} gap-1`}>
        {effectiveSelected.map((modKey) => {
          const meta = resolveMeta(modKey);
          const Icon = meta.icon || LayoutGrid;
          const liveRows = recordsByModule[modKey] || [];
          const displayRows = (liveRows.length > 0 ? liveRows : (meta.highlights || [])).filter((r) =>
            !searchQuery.trim() ||
            `${r.title} ${r.subtitle} ${r.badge}`.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return (
            <div
              key={modKey}
              className="last:odd:col-span-full flex flex-col justify-between rounded-lg border bg-white p-1.5"
              style={{
                borderColor: meta.color,
                borderTopWidth: '3px',
                background: `linear-gradient(145deg, ${meta.color}12 0%, #ffffff 80%)`,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-1 border-b border-purple-100 pb-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                      style={{ background: meta.color }}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[9px] font-extrabold text-blue-950">
                        {meta.label}
                      </div>
                      <div className="truncate text-[7px] font-bold text-purple-800">
                        {meta.description}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={meta.path || '/dashboard'}
                    className="shrink-0 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[7px] font-extrabold text-white"
                    style={{ background: meta.color }}
                  >
                    Open <ExternalLink className="h-2 w-2" />
                  </Link>
                </div>

                <div className="mt-1 space-y-0.5">
                  {displayRows.slice(0, 3).map((row) => (
                    <Link
                      key={row.id}
                      to={row.to || meta.path || '/dashboard'}
                      className="flex items-center justify-between gap-1 rounded border border-purple-100 bg-white px-1.5 py-0.5 hover:border-purple-300"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[8px] font-extrabold text-blue-950">
                          {row.title}
                        </div>
                        {row.subtitle && (
                          <div className="truncate text-[7px] font-semibold text-purple-800">
                            {row.subtitle}
                          </div>
                        )}
                      </div>
                      <span
                        className="shrink-0 rounded-full px-1.5 py-0 text-[6.5px] font-extrabold text-white"
                        style={{ background: meta.color }}
                      >
                        {row.badge}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}