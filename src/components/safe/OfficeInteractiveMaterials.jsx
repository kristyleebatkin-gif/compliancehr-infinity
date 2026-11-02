import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, FolderLock,
  ClipboardCheck, AlertTriangle, Calendar, Award, ArrowRight,
  FileText, BadgeCheck, Siren, ListTodo,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import MasterComplianceAuditForms from '@/components/compliance/MasterComplianceAuditForms';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import PricingSection from '@/components/landing/PricingSection';
import ObsidianSmartRemote from '@/components/common/ObsidianSmartRemote';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';
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
    { key: 'rostering', label: '1. Roster & Shifts Screen', path: '/roster', color: '#0072FF', summary: 'Live Shift Coverage, Screening Alerts, Availability, Sign-Off & Invoicing.' },
    { key: 'our-staff', label: 'Employee Profiles Screen', path: '/our-employees', color: '#0A2B6D', summary: 'Live Staff Directory, HR Compliance, Screening, Contracts & Staff ID Badges.' },
    { key: 'our-participants', label: 'Participant Profiles Screen', path: '/our-participants', color: '#5A00D6', summary: 'NDIS Plans, Goals, Consents, Medications, Risk Controls & Shift Notes.' },
    { key: 'communications', label: 'Comms & Shift Notes Screen', path: '/communications', color: '#A100FF', summary: 'Active Alerts, Automated Log, Shift Notes, Team Feed, Inbox & Smart Vault.' },
    { key: 'compliance', label: 'Compliance & Audit Screen', path: '/compliance', color: '#FF2E9A', summary: '8 NDIS Practice Standards, Master Checklists, Evidence Map & Audit Pack PDF.' },
    { key: 'tasks', label: 'Shared To-Do & Tasks Screen', path: '/tasks', color: '#FF6EDB', summary: 'Team Command Board, Overdue Escalations, Digital Sign-Off & Leaderboard.' },
  ];

  const activeModule =
    quickScreens.find((q) => q.key === selectedScreen) ||
    MODULE_DIRECTORY.find((m) => m.key === selectedScreen) ||
    quickScreens[0];

  return (
    <ObsidianSmartRemote
      compact
      title="6. Office Smart Screen #2"
      subtitle={activeModule.summary || `${companyName} live office screen`}
      channels={quickScreens.map((scr) => ({
        key: scr.key,
        label: scr.label.replace(' Screen', '').replace(/^1\.\s*/, ''),
        sub: scr.summary,
      }))}
      activeKey={activeModule.key}
      onSelectChannel={onSelectScreen}
      confirmHref={activeModule.path || '/dashboard'}
      confirmLabel={`Open ${activeModule.label.replace(' Screen', '')}`}
      columnsClass="grid-cols-2 sm:grid-cols-3"
    />
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
      <div className="rounded-xl border-2 border-[#0A2B6D]/30 bg-white p-2.5 shadow-sm">
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
        <div className="flex flex-col items-center justify-center text-center mb-2">
          <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-blue-200 bg-white p-1 shadow-2xs">
            <Image src={logoUrl || DEFAULT_LOGO} alt="Logo" fittingType="fit" className="h-full w-full object-contain" />
          </div>
          <div className="mt-1 truncate text-xs font-extrabold text-blue-950">ComplianceHR Infinity</div>
          <div className="text-[9px] font-extrabold">
            <span style={{ color: '#0072FF' }}>Complete Control.</span>{' '}
            <span style={{ color: '#5A00D6' }}>Greater Confidence.</span>{' '}
            <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[9.5px]">
          <div className="flex items-center justify-between gap-1.5 rounded border border-blue-200 bg-white px-2 py-1">
            <span className="font-bold text-blue-700">Software</span>
            <span className="font-extrabold text-blue-950 whitespace-nowrap">ComplianceHR Infinity</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 rounded border border-purple-200 bg-white px-2 py-1">
            <span className="font-bold text-purple-700">Business</span>
            <span className="font-extrabold text-purple-950 whitespace-nowrap">{resolvedBusinessName}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 rounded border border-pink-200 bg-white px-2 py-1">
            <span className="font-bold text-pink-700">Developer</span>
            <span className="font-extrabold text-pink-950 whitespace-nowrap">Kristy Lee Whelan</span>
          </div>
          <div className="sm:col-span-2 flex items-center justify-between gap-1.5 rounded border border-indigo-200 bg-white px-2 py-1">
            <span className="font-bold text-indigo-700">Email</span>
            <span className="font-extrabold text-indigo-950 whitespace-nowrap">kristyleebatkin@live.com.au</span>
          </div>
        </div>
      </div>

      {/* Smart Vault & Document Subjects */}
      <div className="rounded-xl border-2 border-[#0A2B6D]/30 bg-white p-2.5 shadow-sm">
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
            { label: 'NDIS Registration & Audit', path: '/company-safe', color: '#0072FF' },
            { label: 'Insurance & Certificates', path: '/company-safe', color: '#0A2B6D' },
            { label: 'Policies & Procedures', path: '/documents', color: '#5A00D6' },
            { label: 'Employee HR Contracts', path: '/hr', color: '#A100FF' },
            { label: 'Participant Agreements', path: '/our-participants', color: '#FF2E9A' },
            { label: 'Board & Audit Packs', path: '/compliance', color: '#00C6FF' },
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
      <div className="rounded-xl border-2 border-[#0A2B6D]/30 bg-white p-2.5 shadow-sm">
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
      color: '#0072FF',
      icon: ClipboardCheck,
    },
    {
      title: 'Shared To-Do & Task Command',
      stat: `${counts.tasks} Tracked Tasks`,
      desc: 'Team tasks, sign-off workflows, overdue alerts & seasonal task leaderboard.',
      path: '/tasks',
      color: '#0A2B6D',
      icon: ListTodo,
    },
    {
      title: 'Incident Clinic & NDIS Reporting',
      stat: `${counts.incidents} Logged Incidents`,
      desc: '24-hour & 5-day NDIS reportable timelines, photo evidence, WHS & root-cause actions.',
      path: '/incidents',
      color: '#5A00D6',
      icon: Siren,
    },
    {
      title: 'Risk Register & Take-5 Safety',
      stat: `${counts.risks} Active Risk Controls`,
      desc: 'Hierarchy of controls, home & individual risk assessments, emergency drills & MSDS.',
      path: '/risks',
      color: '#A100FF',
      icon: AlertTriangle,
    },
    {
      title: 'Rostering, Shifts & Invoicing',
      stat: `${counts.shifts} Scheduled Shifts`,
      desc: 'Worker screening validation, shift notes, NDIS price guide & automated invoicing.',
      path: '/roster',
      color: '#FF2E9A',
      icon: Calendar,
    },
    {
      title: 'Training Academy & Certificates',
      stat: `${counts.certificates} Staff Credentials`,
      desc: 'AI course builder, knowledge quizzes, expiry reminders & printable certificates.',
      path: '/training',
      color: '#00C6FF',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-1.5 bg-white p-0.5">
      <InfinityCoreEngine compact={true} />
      <BusinessHealthComplianceIntelligenceDashboard compact={true} />
      <MasterComplianceAuditForms compact={true} />
      <PricingSection compact={true} />
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
              background: '#ffffff',
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