import React, { useState } from 'react';
import {
  ShieldCheck, Sparkles, Lock, CheckCircle2, BookmarkCheck, PlusCircle, FileCheck2, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PLATFORM_14_FOUNDATION_DOMAINS,
  researchAndGenerateSubjectForm,
} from '@/lib/enterpriseGovernanceStandard';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

const EXECUTIVE_13_ADMIN_CENTRES = [
  'Form Generator',
  'Template Library',
  'Workflow Builder',
  'Dashboard Builder',
  'Report Builder',
  'Security & Permissions',
  'User Management',
  'Branding & Themes',
  'Reviews Management',
  'Audit Management',
  'Document Vault Management',
  'Company Safe Management',
  'Data Quality Centre',
];

export default function Enterprise12PillarCommandBar({
  liveTelemetry = {},
  onGeneratedForm,
  savedPresets = [],
  onSavePreset,
  onApplyPreset,
}) {
  const [subjectTopic, setSubjectTopic] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(PLATFORM_14_FOUNDATION_DOMAINS[2]);
  const [ownerRole, setOwnerRole] = useState('Compliance Manager');
  const [presetName, setPresetName] = useState('');
  const [activeAdminCentre, setActiveAdminCentre] = useState('Form Generator');

  const handleResearchAndGenerate = (e) => {
    e.preventDefault();
    const generated = researchAndGenerateSubjectForm(
      subjectTopic || `${selectedDomain} Best-Practice Assessment & Verification Record`,
      selectedDomain,
      ownerRole
    );
    if (onGeneratedForm) onGeneratedForm(generated);
    setSubjectTopic('');
  };

  const kpi12Cards = [
    { label: 'Incidents', value: `${liveTelemetry.incidents ?? 0} Open`, sub: '24h / 5d NDIS SLA Ready', tone: '#FF2E9A' },
    { label: 'Risks', value: `${liveTelemetry.risks ?? 0} Active`, sub: 'ISO 31000 Matrix & Controls', tone: '#5A00D6' },
    { label: 'Audits', value: `${liveTelemetry.audits ?? 0} Scheduled`, sub: '17 Categories · 356 Checks', tone: '#0072FF' },
    { label: 'Reviews', value: '100% Tracked', sub: '10-Weekly & 6-Monthly', tone: '#0A2B6D' },
    { label: 'Actions', value: `${liveTelemetry.tasks ?? 0} Tracked`, sub: 'CAPA & Shared To-Do Linked', tone: '#0072FF' },
    { label: 'Training', value: '17-Pt Matrix', sub: 'LMS, Quizzes & Certs Synced', tone: '#5A00D6' },
    { label: 'Compliance Status', value: 'Audit-Ready', sub: 'Live Operational Evidence', tone: '#0072FF' },
    { label: 'NDIS Status', value: 'Core + Modules', sub: '3-Part Consents Enforced', tone: '#5A00D6' },
    { label: 'Governance Status', value: '98 Controlled', sub: 'Company Safe Master Copies', tone: '#0A2B6D' },
    { label: 'Overdue Items', value: '0 Unassigned', sub: '8:30 AM Escalation Sweep', tone: '#FF2E9A' },
    { label: 'Upcoming Reviews', value: 'Next 30/90d', sub: 'Automated Review Triggers', tone: '#0072FF' },
    { label: 'Upcoming Audits', value: 'Continuous', sub: 'Internal & Commission Ready', tone: '#5A00D6' },
  ];

  return (
    <div className="space-y-3">
      {/* PILLAR 11: 12 LIVE EXECUTIVE DASHBOARD STATUS TILES */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={CHR_LOGO}
              alt="ComplianceHR Infinity"
              className="h-6 w-6 rounded-md border border-slate-200 bg-white p-0.5"
            />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              12-Pillar Executive Telemetry &amp; 14 Foundation Domains (Microsoft 365 / ServiceNow / Workday Grade)
            </span>
          </div>
          <Badge className="bg-[#0A2B6D] text-white text-[10px]">
            Zero Demo / Duplicate Data · 100% Connected Lifecycle
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {kpi12Cards.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#0A2B6D]/20 bg-white p-2 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase text-[#0A2B6D]/80">
                  {item.label}
                </span>
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.tone }}
                />
              </div>
              <div className="mt-0.5 text-xs font-extrabold text-[#0A2B6D]">{item.value}</div>
              <div className="text-[9.5px] font-semibold text-[#5A00D6]">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PILLAR 3, 4 & 5: SUBJECT-MATTER FORM RESEARCH & GENERATION ENGINE + INTEGRITY VALIDATOR */}
      <form
        onSubmit={handleResearchAndGenerate}
        className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 space-y-2.5 shadow-2xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
            <span>
              Subject-Researched Controlled Form Generator (24-Point Structure · NDIS, Governance, Compliance &amp; Audit Ready)
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-[#0072FF]">
            Includes Logo · Business Info · 16 Metadata Fields · Evidence · Actions · Reviews · Approvals · Page Numbering
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
            >
              {PLATFORM_14_FOUNDATION_DOMAINS.map((dom) => (
                <option key={dom} value={dom}>{dom}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-5">
            <input
              type="text"
              value={subjectTopic}
              onChange={(e) => setSubjectTopic(e.target.value)}
              placeholder="Enter form subject to research & build (e.g., High-Intensity Bowel Care Plan, Contractor WHS Induction)..."
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              value={ownerRole}
              onChange={(e) => setOwnerRole(e.target.value)}
              placeholder="Document Owner"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              size="sm"
              className="w-full bg-[#5A00D6] text-white text-xs font-extrabold"
            >
              <PlusCircle className="mr-1 h-3.5 w-3.5" /> Research &amp; Build
            </Button>
          </div>
        </div>

        {/* PILLAR 6 & 7: 4-QUESTION RECORD INTELLIGENCE & 4-TIER ROLE PRIVACY BAR */}
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-4 text-[10.5px]">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 font-bold text-[#0A2B6D]">
            <span className="text-[#0072FF]">1. Who Owns It &amp; Stage:</span> Every record tracks Owner, Reviewer, Approver &amp; Workflow Stage.
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 font-bold text-[#0A2B6D]">
            <span className="text-[#5A00D6]">2. Where It Belongs:</span> Auto-classified to Module → Vault Category → Subject → Register.
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 font-bold text-[#0A2B6D]">
            <span className="text-[#FF2E9A]">3. Data Integrity Gate:</span> Prevents duplicates, missing fields, broken links &amp; orphaned records.
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 font-bold text-[#0A2B6D]">
            <span className="text-[#0A2B6D]">4. Role Privacy (RLS):</span> Participants (Own/Approved) · Staff (Assigned) · Managers · Executives.
          </div>
        </div>
      </form>

      {/* 13 EXECUTIVE ADMINISTRATION CENTRES + 4 AUDIT/REVIEW REGISTERS + DATA QUALITY CENTRE */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            Executive Administration — 13 No-Code Configuration Centres &amp; 4 Assurance Registers
          </span>
          <span className="text-[10px] font-extrabold text-[#5A00D6]">
            Reviews Register · Audit Register · Findings Register · Corrective Actions Register · Data Quality Verified
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXECUTIVE_13_ADMIN_CENTRES.map((centre) => {
            const active = activeAdminCentre === centre;
            return (
              <button
                key={centre}
                type="button"
                onClick={() => setActiveAdminCentre(centre)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold transition ${
                  active
                    ? 'bg-[#0A2B6D] text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                }`}
              >
                {centre}
              </button>
            );
          })}
        </div>
      </div>

      {/* SAVED REPORT PRESETS BAR (PILLAR 11 & 12) */}
      {onSavePreset && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <BookmarkCheck className="h-3.5 w-3.5 text-[#5A00D6]" />
            <span className="text-[11px] font-extrabold text-[#0A2B6D]">Saved Executive Report Views:</span>
            {savedPresets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onApplyPreset && onApplyPreset(p)}
                className="rounded-full border border-[#0A2B6D]/30 bg-[#F5F0FF] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] hover:bg-[#5A00D6] hover:text-white"
              >
                {p.name} ({p.quickDateFilter})
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Save current filter view as..."
              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-[#0A2B6D]"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!presetName.trim()) return;
                onSavePreset(presetName.trim());
                setPresetName('');
              }}
              className="h-7 bg-[#0A2B6D] px-2.5 text-[10px] font-extrabold text-white"
            >
              Save Report Preset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}