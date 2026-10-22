import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, Heart, UserRound, Lock, FolderLock,
  ClipboardCheck, AlertTriangle, Calendar, Award, ArrowRight,
  FileText, BadgeCheck, Siren, ListTodo, Monitor, ExternalLink,
  LayoutGrid, MessagesSquare, Sparkles, CheckCircle2,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import MasterComplianceAuditForms from '@/components/compliance/MasterComplianceAuditForms';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
export const DEFAULT_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';
export const FULL_SLOGAN = 'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Reusable Logo + Full Slogan Lockup — guarantees the logo and the full slogan
 * ("Complete Control. Greater Confidence. Brighter Success.") are always shown together.
 */
export function LogoWithFullSloganCard({ logoUrl, compact = false, companyName = 'ComplianceHR Infinity' }) {
  const src = logoUrl || DEFAULT_LOGO;
  return (
    <div className="flex flex-col items-center justify-center rounded bg-white p-1 text-center">
      <div className={`flex w-full items-center justify-center overflow-hidden rounded bg-white ${compact ? 'h-12' : 'h-16'}`}>
        <Image
          src={src}
          alt={`${companyName} — ${FULL_SLOGAN}`}
          fittingType="fit"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="text-[9.5px] font-extrabold leading-tight tracking-tight text-blue-950">
        {companyName}
      </div>
      <div
        className="mt-0.5 w-full rounded-md px-1.5 py-0.5 text-[7px] font-extrabold uppercase leading-tight tracking-wide text-white shadow-sm"
        style={{ background: SQUISHED_GRADIENT }}
      >
        {FULL_SLOGAN}
      </div>
    </div>
  );
}

/**
 * Logo-Branded Office Item Showing Another Screen in the Office:
 * An interactive Executive Smart Kiosk / Dual-Screen Office Display Station
 * featuring the ComplianceHR Infinity Logo + Full Slogan on its top crown and showing
 * another live screen inside the office!
 */
export function LogoBrandedOfficeSecondScreen({
  logoUrl,
  selectedScreen,
  onSelectScreen,
  companyName = 'ComplianceHR Infinity',
}) {
  const quickScreens = [
    { key: 'our-staff', label: 'Employee Profiles Screen', path: '/our-employees', color: '#2563eb', summary: 'Live Staff Directory, HR Compliance, Screening, Contracts & Staff ID Badges.' },
    { key: 'our-participants', label: 'Participant Profiles Screen', path: '/our-participants', color: '#e11d48', summary: 'NDIS Plans, Goals, Consents, Medications, Risk Controls & Shift Notes.' },
    { key: 'communications', label: 'Comms & Shift Notes Screen', path: '/communications', color: '#0891b2', summary: 'Active Alerts, Automated Log, Shift Notes, Team Feed, Inbox & Smart Vault.' },
    { key: 'compliance', label: 'Compliance & Audit Screen', path: '/compliance', color: '#6d28d9', summary: '8 NDIS Practice Standards, Master Checklists, Evidence Map & Audit Pack PDF.' },
    { key: 'rostering', label: 'Roster & Shifts Screen', path: '/roster', color: '#6366f1', summary: 'Live Shift Coverage, Screening Alerts, Availability, Sign-Off & Invoicing.' },
    { key: 'tasks', label: 'Shared To-Do & Tasks Screen', path: '/tasks', color: '#ef4444', summary: 'Team Command Board, Overdue Escalations, Digital Sign-Off & Leaderboard.' },
  ];

  const activeModule =
    MODULE_DIRECTORY.find((m) => m.key === selectedScreen) ||
    quickScreens.find((q) => q.key === selectedScreen) ||
    quickScreens[0];
  const activeColor = moduleKeyColour(activeModule.key || 'dashboard');

  return (
    <div className="rounded-lg border-2 border-amber-400 bg-white p-1.5 shadow-sm">
      {/* Top Branded Bezel with Logo & Full Slogan on the Office Display Item */}
      <div
        className="flex flex-wrap items-center justify-between gap-1 rounded-md px-2 py-1 text-white shadow-sm"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 shadow">
            <Image
              src={logoUrl || DEFAULT_LOGO}
              alt="ComplianceHR Infinity Logo"
              fittingType="fit"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                {companyName} · Office Smart Screen #2
              </span>
              <span className="rounded-full bg-amber-300 px-1.5 py-0 text-[7px] font-extrabold text-blue-950">
                LIVE OFFICE ITEM
              </span>
            </div>
            <div className="truncate text-[8px] font-extrabold text-amber-100">
              {FULL_SLOGAN}
            </div>
          </div>
        </div>

        <Link
          to={activeModule.path || '/dashboard'}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8px] font-extrabold text-blue-950 shadow-sm hover:bg-pink-50"
        >
          Open Screen <ExternalLink className="h-2.5 w-2.5 text-pink-600" />
        </Link>
      </div>

      {/* Screen Selector Pills on the Branded Office Display Item */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <span className="text-[8px] font-extrabold uppercase tracking-wider text-purple-900 mr-1">
          Show Screen:
        </span>
        {quickScreens.map((scr) => {
          const isSelected = ( activeModule.key === scr.key );
          return (
            <button
              key={scr.key}
              type="button"
              onClick={() => onSelectScreen(scr.key)}
              className={`rounded-full border px-2 py-0.5 text-[7.5px] font-extrabold transition-all ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'border-purple-200 bg-purple-50/60 text-blue-950 hover:bg-purple-100'
              }`}
              style={isSelected ? { background: scr.color, borderColor: scr.color } : undefined}
            >
              {scr.label}
            </button>
          );
        })}
      </div>

      {/* The Generated Office Display Screen Body with Live Branded Watermark & Selected Screen Content */}
      <div
        className="mt-1.5 rounded-lg border-2 p-2"
        style={{
          borderColor: activeColor,
          background: `linear-gradient(135deg, ${activeColor}15 0%, #ffffff 65%)`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-purple-200 bg-white p-1 shadow-sm">
              <Image
                src={logoUrl || DEFAULT_LOGO}
                alt="Logo on Office Item"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Monitor className="h-3 w-3 shrink-0" style={{ color: activeColor }} />
                <span className="truncate text-[10.5px] font-extrabold text-blue-950">
                  Now Showing in Office: {activeModule.label}
                </span>
              </div>
              <p className="text-[8.5px] font-bold text-blue-900/85 leading-snug">
                {activeModule.summary ||
                  `Live interactive ${activeModule.label} workspace displayed on your branded ComplianceHR Infinity office screen.`}
              </p>
              <div className="mt-0.5 text-[7.5px] font-extrabold text-purple-800">
                {companyName} — {FULL_SLOGAN}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              to={activeModule.path || '/dashboard'}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[8.5px] font-extrabold text-white shadow-sm"
              style={{ background: activeColor }}
            >
              Launch {activeModule.label} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Material 1: Company Safe, Business Identity & Staff Badge Material
 */
export function CompanySafeMaterialPanel({ companyName = 'ComplianceHR Infinity', logoUrl }) {
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.BusinessDetails.list({ sort: '-updated_date', limit: 1 })
      .then((res) => {
        if (!active) return;
        const list = res?.items || (Array.isArray(res) ? res : []);
        if (list[0]) setBusiness(list[0]);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const resolvedBusinessName = business?.business_name || business?.trading_name || companyName || 'ComplianceHR Infinity';

  return (
    <div className="space-y-2 bg-white p-1">
      {/* Ordered Business Identity Card */}
      <div className="rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50/70 via-white to-violet-50/60 p-2.5 shadow-sm">
        <div
          className="mb-2 flex items-center justify-between rounded-lg px-2.5 py-1 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
            <Lock className="h-3 w-3" /> Official Business Identity
          </span>
          <Link to="/company-safe" className="rounded bg-white px-1.5 py-0.5 text-[8px] font-extrabold text-blue-950">
            Open Safe
          </Link>
        </div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-blue-200 bg-white p-1 shadow-sm">
            <Image src={logoUrl || DEFAULT_LOGO} alt="Logo" fittingType="fit" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-extrabold text-blue-950">ComplianceHR Infinity</div>
            <div className="text-[9px] font-extrabold text-pink-700">
              {FULL_SLOGAN}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[9.5px]">
          <div className="flex items-center justify-between rounded border border-blue-200 bg-white px-2 py-1">
            <span className="font-bold text-blue-700">Software</span>
            <span className="font-extrabold text-blue-950">ComplianceHR Infinity</span>
          </div>
          <div className="flex items-center justify-between rounded border border-purple-200 bg-white px-2 py-1">
            <span className="font-bold text-purple-700">Business</span>
            <span className="font-extrabold text-purple-950 truncate max-w-[120px]">{resolvedBusinessName}</span>
          </div>
          <div className="flex items-center justify-between rounded border border-pink-200 bg-white px-2 py-1">
            <span className="font-bold text-pink-700">Developer</span>
            <span className="font-extrabold text-pink-950">Chad</span>
          </div>
          <div className="flex items-center justify-between rounded border border-indigo-200 bg-white px-2 py-1">
            <span className="font-bold text-indigo-700">Email</span>
            <span className="font-extrabold text-indigo-950 truncate">compliancehr@outlook.com</span>
          </div>
        </div>
      </div>

      {/* Smart Vault & Document Subjects */}
      <div className="rounded-xl border-2 border-purple-400 bg-gradient-to-br from-purple-50/70 via-white to-pink-50/60 p-2.5 shadow-sm">
        <div
          className="mb-1.5 flex items-center justify-between rounded-lg px-2.5 py-1 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
            <FolderLock className="h-3 w-3" /> Smart Vault &amp; Safe Categories
          </span>
          <Link to="/documents" className="rounded bg-white px-1.5 py-0.5 text-[8px] font-extrabold text-purple-950">
            Open Vault
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'NDIS Registration & Audit', path: '/company-safe', color: '#7c3aed' },
            { label: 'Insurance & Certificates', path: '/company-safe', color: '#2563eb' },
            { label: 'Policies & Procedures', path: '/documents', color: '#db2777' },
            { label: 'Employee HR Contracts', path: '/hr', color: '#0d9488' },
            { label: 'Participant Agreements', path: '/our-participants', color: '#ea580c' },
            { label: 'Board & Audit Packs', path: '/compliance', color: '#16a34a' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-1.5 rounded-lg border bg-white px-2 py-1 text-[8.5px] font-extrabold text-blue-950 shadow-sm hover:-translate-y-0.5 transition-all"
              style={{ borderColor: item.color, borderLeftWidth: '3px' }}
            >
              <FileText className="h-3 w-3 shrink-0" style={{ color: item.color }} />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Staff Badge & Security Posture Preview */}
      <div className="rounded-xl border-2 border-pink-400 bg-gradient-to-br from-pink-50/70 via-white to-amber-50/50 p-2.5 shadow-sm">
        <div
          className="mb-1.5 flex items-center justify-between rounded-lg px-2.5 py-1 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
            <BadgeCheck className="h-3 w-3" /> Staff ID Badge &amp; Security
          </span>
          <Link to="/company-safe" className="rounded bg-white px-1.5 py-0.5 text-[8px] font-extrabold text-pink-950">
            Badge Studio
          </Link>
        </div>
        <div className="rounded-xl border border-purple-300 bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2 rounded-lg p-1.5 text-white" style={{ background: SQUISHED_GRADIENT }}>
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-white p-0.5">
              <Image src={logoUrl || DEFAULT_LOGO} alt="Badge Logo" fittingType="fit" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[9px] font-extrabold">VERIFIED STAFF CREDENTIAL · {resolvedBusinessName}</div>
              <div className="truncate text-[7.5px] opacity-95">{FULL_SLOGAN}</div>
            </div>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1 text-[8px]">
            <div className="rounded bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 font-extrabold text-emerald-900">
              NDIS Worker Cleared
            </div>
            <div className="rounded bg-blue-50 border border-blue-300 px-1.5 py-0.5 font-extrabold text-blue-900">
              First Aid &amp; CPR Current
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Material 2: Live Compliance, Tasks, Incidents & Audit Readiness Material
 */
export function ComplianceAndOperationsMaterialPanel() {
  const [counts, setCounts] = useState({
    tasks: 0,
    incidents: 0,
    risks: 0,
    shifts: 0,
    certificates: 0,
    audits: 0,
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.TodoTask.count().catch(() => 0),
      base44.entities.Incident.count().catch(() => 0),
      base44.entities.Risk.count().catch(() => 0),
      base44.entities.Shift.count().catch(() => 0),
      base44.entities.Certificate.count().catch(() => 0),
      base44.entities.InternalAudit.count().catch(() => 0),
    ]).then(([tasks, incidents, risks, shifts, certificates, audits]) => {
      if (!active) return;
      setCounts({ tasks, incidents, risks, shifts, certificates, audits });
    });
    return () => { active = false; };
  }, []);

  const cards = [
    {
      title: 'Compliance & Audit Readiness',
      stat: `${counts.audits} Audits · 8 NDIS Standards`,
      desc: 'Master checklists, NDIS practice standards, evidence mapping & 1-click PDF board packs.',
      path: '/compliance',
      color: '#6d28d9',
      icon: ClipboardCheck,
    },
    {
      title: 'Shared To-Do & Task Command',
      stat: `${counts.tasks} Tracked Tasks`,
      desc: 'Team tasks, sign-off workflows, overdue alerts & seasonal task leaderboard.',
      path: '/tasks',
      color: '#ef4444',
      icon: ListTodo,
    },
    {
      title: 'Incident Clinic & NDIS Reporting',
      stat: `${counts.incidents} Logged Incidents`,
      desc: '24-hour & 5-day NDIS reportable timelines, photo evidence, WHS & root-cause actions.',
      path: '/incidents',
      color: '#dc2626',
      icon: Siren,
    },
    {
      title: 'Risk Register & Take-5 Safety',
      stat: `${counts.risks} Active Risk Controls`,
      desc: 'Hierarchy of controls, home & individual risk assessments, emergency drills & MSDS.',
      path: '/risks',
      color: '#ea580c',
      icon: AlertTriangle,
    },
    {
      title: 'Rostering, Shifts & Invoicing',
      stat: `${counts.shifts} Scheduled Shifts`,
      desc: 'Worker screening validation, shift notes, NDIS price guide & automated invoicing.',
      path: '/roster',
      color: '#4f46e5',
      icon: Calendar,
    },
    {
      title: 'Training Academy & Certificates',
      stat: `${counts.certificates} Staff Credentials`,
      desc: 'AI course builder, knowledge quizzes, expiry reminders & printable certificates.',
      path: '/training',
      color: '#0d9488',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-1.5 bg-white p-0.5">
      <MasterComplianceAuditForms compact={true} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white">
        {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.title}
            to={c.path}
            className="group flex flex-col justify-between rounded-xl border-2 bg-white p-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{
              borderColor: `${c.color}88`,
              borderTopWidth: '4px',
              borderTopColor: c.color,
              background: `linear-gradient(145deg, ${c.color}14 0%, #ffffff 70%)`,
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-sm"
                  style={{ background: c.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[8px] font-extrabold text-white"
                  style={{ background: c.color }}
                >
                  {c.stat}
                </span>
              </div>
              <div className="mt-1 text-[10.5px] font-extrabold text-blue-950">{c.title}</div>
              <p className="mt-0.5 text-[8.5px] font-semibold text-blue-900/80 leading-snug">{c.desc}</p>
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[8.5px] font-extrabold" style={{ color: c.color }}>
              Open Material <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        );
      })}
      </div>
    </div>
  );
}