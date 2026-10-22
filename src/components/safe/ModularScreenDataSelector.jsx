import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid, Users, Heart, MessagesSquare, ListTodo, Siren, AlertTriangle,
  Calendar, ShieldCheck, Award, FolderLock, FileText, DollarSign, CheckSquare,
  Search, ExternalLink, Sparkles, Monitor, Building2, UserRound, Eye, Layers,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
export const DEFAULT_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';
export const FULL_SLOGAN = 'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Curated Modular Screen Groups so users can quickly select individual modular screens
 * or combine multiple modular data feeds to review in either Enhanced Office or General Profile mode.
 */
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
  },
  {
    key: 'compliance',
    label: 'Compliance & NDIS Audits',
    shortLabel: 'Compliance & Audits',
    category: 'Compliance & Safety',
    path: '/compliance',
    color: '#6d28d9',
    icon: ShieldCheck,
    description: '8 NDIS Practice Standards, internal audits, compliance issues & evidence pack.',
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
  },
];

/**
 * Fetches live records for any selected modular key so the user can review real data
 * immediately inside either the Enhanced Office Screen or the General Profile / Data panel.
 */
async function fetchLiveScreenRecords(moduleKey) {
  try {
    switch (moduleKey) {
      case 'our-staff':
      case 'human-resources':
      case 'my-profile': {
        const res = await base44.entities.StaffProfile.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.ParticipantProfile.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.CommunicationEntry.list({ sort: '-created_date', limit: 6 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.subject || r.entry_kind || 'Communication Entry',
          subtitle: [r.person_name, r.sender_name, r.entry_date].filter(Boolean).join(' · ') || (r.body || '').slice(0, 60),
          badge: r.entry_kind || 'Log',
          to: '/communications',
        }));
      }
      case 'tasks': {
        const res = await base44.entities.TodoTask.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.Incident.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.Risk.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.Shift.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.ComplianceIssue.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.Certificate.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.EmployeeDocument.list({ sort: '-created_date', limit: 6 });
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
        const res = await base44.entities.Invoice.list({ sort: '-created_date', limit: 6 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.invoice_number ? `Invoice #${r.invoice_number} — ${r.participant_name || r.client_name || ''}` : (r.title || 'Invoice'),
          subtitle: [r.issue_date, r.total_amount != null && `$${Number(r.total_amount).toFixed(2)}`].filter(Boolean).join(' · '),
          badge: r.status || 'Issued',
          to: '/invoicing',
        }));
      }
      default: {
        const mod = MODULE_DIRECTORY.find((m) => m.key === moduleKey);
        const res = await base44.entities.TodoTask.list({ sort: '-created_date', limit: 4 }).catch(() => ({ items: [] }));
        const items = res?.items || (Array.isArray(res) ? res : []);
        return items.map((r) => ({
          id: r.id,
          title: r.title || `${mod?.label || 'Module'} Action`,
          subtitle: [r.module || mod?.label, r.assigned_to, r.due_date].filter(Boolean).join(' · '),
          badge: r.status || 'Active',
          to: mod?.path || '/dashboard',
        }));
      }
    }
  } catch {
    return [];
  }
}

/**
 * Interactive Modular Screen & Data Review Workspace
 * Allows users to select 1 or multiple modular screens to review live data in either
 * the Enhanced Office Experience or the General Profile / Data View.
 */
export default function ModularScreenDataSelector({
  selectedModulars = ['our-staff', 'communications'],
  activeScreen = 'our-staff',
  onSelectActiveScreen,
  onToggleModular,
  onSelectPreset,
  logoUrl = DEFAULT_LOGO,
  companyName = 'ComplianceHR Infinity',
  modeLabel = 'General Profile & Modular Data Review',
  compact = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll45Picker, setShowAll45Picker] = useState(false);
  const [recordsByModule, setRecordsByModule] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

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
      setLoadingMap((prev) => ({ ...prev, [modKey]: true }));
      fetchLiveScreenRecords(modKey).then((rows) => {
        if (!active) return;
        setRecordsByModule((prev) => ({ ...prev, [modKey]: rows }));
        setLoadingMap((prev) => ({ ...prev, [modKey]: false }));
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
      };
    }
    return MODULAR_SCREEN_DECKS[0];
  };

  const presets = [
    { label: 'People & Profiles Pack', keys: ['my-profile', 'our-staff', 'our-participants'] },
    { label: 'Daily Comms & Roster Pack', keys: ['communications', 'rostering', 'tasks'] },
    { label: 'Audit & Safety Pack', keys: ['compliance', 'incidents', 'risks'] },
    { label: 'Safe, HR & Finance Pack', keys: ['company-safe', 'training', 'invoicing'] },
  ];

  return (
    <div className="rounded-xl border-2 border-purple-400 bg-white p-2 shadow-sm space-y-2">
      {/* Header Bar with Logo + Full Slogan & Preset Packs */}
      <div
        className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-white shadow-sm"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 shadow">
            <Image src={logoUrl || DEFAULT_LOGO} alt="Logo" fittingType="fit" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 shrink-0 text-amber-200" />
              <span className="truncate text-[9.5px] font-extrabold uppercase tracking-wider">
                {modeLabel}
              </span>
            </div>
            <div className="truncate text-[7.5px] font-extrabold text-amber-100">
              {companyName} · {FULL_SLOGAN}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAll45Picker((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8px] font-extrabold text-blue-950 shadow-sm hover:bg-pink-50"
        >
          <LayoutGrid className="h-2.5 w-2.5 text-pink-600" />
          {showAll45Picker ? 'Hide All 45 Modulars' : `Choose from All ${MODULE_DIRECTORY.length} Modulars`}
        </button>
      </div>

      {/* Quick Preset Bundles + Search Filter */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[8px] font-extrabold uppercase tracking-wider text-purple-900">
            Review Packs:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelectPreset && onSelectPreset(preset.keys)}
              className="rounded-full border border-purple-300 bg-purple-50/70 px-2 py-0.5 text-[7.5px] font-extrabold text-purple-950 hover:bg-purple-100"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[140px] max-w-[220px]">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-purple-600" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter modulars or data…"
            className="h-6 w-full rounded-full border border-purple-300 bg-white pl-6 pr-2 text-[8.5px] font-bold text-blue-950 placeholder:text-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Core 12 Modular Screen Check-Pills (Click to focus, check to compare multiple modulars at once) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[8px] font-extrabold text-blue-950">
          <span>Select Modular Screens to Review ({effectiveSelected.length} active):</span>
          <span className="text-purple-700">Click any modular to toggle or focus its live data</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {MODULAR_SCREEN_DECKS.map((deck) => {
            const Icon = deck.icon;
            const isChecked = effectiveSelected.includes(deck.key);
            const isFocused = activeScreen === deck.key;
            return (
              <div
                key={deck.key}
                className={`flex items-center justify-between gap-1 rounded-lg border px-1.5 py-1 transition-all ${
                  isFocused
                    ? 'ring-2 ring-pink-500 shadow-sm'
                    : isChecked
                    ? 'shadow-sm'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  borderColor: deck.color,
                  borderLeftWidth: '3px',
                  background: isChecked
                    ? `linear-gradient(135deg, ${deck.color}22 0%, #ffffff 80%)`
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
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white"
                    style={{ background: deck.color }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <span className="truncate text-[8px] font-extrabold text-blue-950">
                    {deck.shortLabel}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleModular && onToggleModular(deck.key)}
                  title={isChecked ? 'Remove from review' : 'Add to review'}
                  className={`rounded px-1 py-0.2 text-[7px] font-extrabold ${
                    isChecked
                      ? 'bg-pink-600 text-white'
                      : 'border border-purple-300 bg-white text-purple-900'
                  }`}
                >
                  {isChecked ? '✓ On' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Full 45-Module Selector Drawer */}
      {showAll45Picker && (
        <div className="rounded-xl border-2 border-purple-300 bg-purple-50/30 p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[8.5px] font-extrabold text-purple-950">
            <span>All {MODULE_DIRECTORY.length} Platform Modulars — Click any module to add/review its screen:</span>
            <button
              type="button"
              onClick={() => setShowAll45Picker(false)}
              className="rounded bg-purple-200 px-1.5 py-0.5 text-[7.5px] font-extrabold text-purple-950"
            >
              Done
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 max-h-48 overflow-y-auto pr-1">
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
                  className={`flex items-center justify-between gap-1 rounded border bg-white px-1.5 py-1 text-left transition-all ${
                    selected ? 'ring-2 ring-pink-500 bg-pink-50/40' : 'hover:bg-purple-50'
                  }`}
                  style={{ borderColor: colour, borderLeftWidth: '3px' }}
                >
                  <span className="flex items-center gap-1 min-w-0">
                    <span
                      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white"
                      style={{ background: colour }}
                    >
                      <Icon className="h-2 w-2" />
                    </span>
                    <span className="truncate text-[7.5px] font-extrabold text-blue-950">{mod.label}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded px-1 text-[6.5px] font-extrabold ${
                      selected ? 'bg-pink-600 text-white' : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    {selected ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Modular Screen Data Cards */}
      <div className={`grid grid-cols-1 ${effectiveSelected.length > 1 && !compact ? 'sm:grid-cols-2' : ''} gap-2`}>
        {effectiveSelected.map((modKey) => {
          const meta = resolveMeta(modKey);
          const Icon = meta.icon || LayoutGrid;
          const rows = (recordsByModule[modKey] || []).filter((r) =>
            !searchQuery.trim() ||
            `${r.title} ${r.subtitle} ${r.badge}`.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const isLoading = loadingMap[modKey];

          return (
            <div
              key={modKey}
              className="flex flex-col justify-between rounded-xl border-2 bg-white p-2 shadow-sm"
              style={{
                borderColor: meta.color,
                borderTopWidth: '4px',
                background: `linear-gradient(145deg, ${meta.color}12 0%, #ffffff 75%)`,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 border-b border-purple-100 pb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{ background: meta.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-extrabold text-blue-950">
                        {meta.label}
                      </div>
                      <div className="truncate text-[7.5px] font-bold text-purple-800">
                        {meta.description}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={meta.path || '/dashboard'}
                    className="shrink-0 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[7.5px] font-extrabold text-white shadow-sm"
                    style={{ background: meta.color }}
                  >
                    Open <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>

                {/* Live Records List for this Selected Modular Screen */}
                <div className="mt-1.5 space-y-1">
                  {isLoading ? (
                    <div className="py-2 text-center text-[8.5px] font-bold text-purple-700">
                      Loading live {meta.shortLabel} data…
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-purple-200 bg-white/80 p-2 text-center">
                      <div className="text-[8.5px] font-extrabold text-blue-950">
                        {meta.label} Screen Ready
                      </div>
                      <div className="text-[7.5px] font-semibold text-purple-800">
                        Click Open above to add or inspect full {meta.shortLabel} records.
                      </div>
                    </div>
                  ) : (
                    rows.slice(0, 4).map((row) => (
                      <Link
                        key={row.id}
                        to={row.to || meta.path || '/dashboard'}
                        className="flex items-center justify-between gap-1.5 rounded-lg border border-purple-100 bg-white px-2 py-1 hover:border-purple-300 hover:bg-purple-50/40 transition-all"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[8.5px] font-extrabold text-blue-950">
                            {row.title}
                          </div>
                          {row.subtitle && (
                            <div className="truncate text-[7.5px] font-semibold text-purple-800">
                              {row.subtitle}
                            </div>
                          )}
                        </div>
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-extrabold text-white"
                          style={{ background: meta.color }}
                        >
                          {row.badge}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between border-t border-purple-100 pt-1 text-[7.5px] font-extrabold text-purple-900">
                <span>Showing live {meta.shortLabel} modular data</span>
                <Link to={meta.path || '/dashboard'} className="underline hover:text-pink-600">
                  Full {meta.shortLabel} Screen →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}