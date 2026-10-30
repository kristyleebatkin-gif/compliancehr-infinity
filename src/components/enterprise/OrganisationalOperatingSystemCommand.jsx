import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Activity, Users, Heart, AlertTriangle, ShieldAlert,
  ClipboardCheck, Sparkles, ArrowRight, RefreshCw,
  Cpu, Layers, Eye, Zap, Award, Lock, BarChart3, Search, PlusCircle,
  Clock, Bell, FileCheck2, Building2, Target, GraduationCap,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 16%, #5A00D6 40%, #A100FF 68%, #FF2E9A 100%)';

const FIVE_MASTER_LAYERS = [
  { id: 'people', step: '01', label: 'PEOPLE', sub: 'Employees, Participants, Contractors, Volunteers & Suppliers', route: '/our-employees', color: '#0072FF' },
  { id: 'work', step: '02', label: 'WORK', sub: 'Rosters, Shifts, Tasks, Goals, Programs, Projects & Fleet', route: '/roster', color: '#0A2B6D' },
  { id: 'compliance', step: '03', label: 'COMPLIANCE', sub: 'NDIS, Aged Care, WHS, Privacy, Governance & Audits', route: '/compliance', color: '#5A00D6' },
  { id: 'evidence', step: '04', label: 'EVIDENCE', sub: 'Document Vault, Company Safe, Signatures, OCR & Version Control', route: '/documents', color: '#A100FF' },
  { id: 'intelligence', step: '05', label: 'INTELLIGENCE', sub: 'Analytics, reporting and assistant entry points', route: '/analytics', color: '#FF2E9A' },
];

const ASSURANCE_17_STAGES = [
  'Identify', 'Intake', 'Document', 'Assess', 'Train', 'Support', 'Control',
  'Monitor', 'Review', 'Act', 'Correct', 'Improve', 'Evidence', 'Report',
  'Audit', 'Verify', 'Improve Again',
];

const UNIVERSAL_18_ENGINES = [
  { name: 'Intake Engine', route: '/intake', sub: 'Participant and employee intake workspaces' },
  { name: 'Assessment Engine', route: '/checklists', sub: 'Assessments and checklists' },
  { name: 'Checklist Engine', route: '/checklists', sub: 'Working and audit checklists' },
  { name: 'Review Engine', route: '/review-due', sub: 'Open review schedules and due dates' },
  { name: 'Goal Engine', route: '/goals', sub: 'Participant & staff goals, notes & funding' },
  { name: 'Training Engine', route: '/training', sub: 'Training records, skills and certificates' },
  { name: 'Action Engine', route: '/tasks', sub: 'Tasks and improvement actions' },
  { name: 'Audit Engine', route: '/auditor-portal', sub: 'Internal audit records and evidence review' },
  { name: 'Incident Engine', route: '/incidents', sub: 'Incident records and investigations' },
  { name: 'Improvement Engine', route: '/quality', sub: 'Continuous improvement & lessons learned' },
  { name: 'Evidence Engine', route: '/documents', sub: 'Document Vault and Company Safe' },
  { name: 'Workflow Engine', route: '/operations-centre', sub: 'Workflow records and process overview' },
  { name: 'Notification Engine', route: '/notifications', sub: 'Open notifications and alerts' },
  { name: 'Escalation Engine', route: '/compliance', sub: 'Review overdue tasks and compliance items' },
  { name: 'Communication Engine', route: '/communications', sub: 'Email, messages, calls, meetings & surveys' },
  { name: 'Search Engine', route: '/universal-storage', sub: 'Open record and document search' },
  { name: 'Reporting Engine', route: '/analytics', sub: 'Available report views and exports' },
  { name: 'AI Engine', route: '/assistant', sub: 'Assistant and knowledge resources' },
];

const AI_6_COPILOTS = [
  {
    role: 'Compliance Review',
    focus: 'Obligations · Evidence · Open findings',
    insight: 'Review obligations, mapped evidence and open findings in the Compliance Centre.',
    route: '/compliance',
    color: '#0072FF',
  },
  {
    role: 'Risk Review',
    focus: 'Risk ratings · Controls · Review dates',
    insight: 'Review risk ratings, controls, owners and scheduled reviews in Risk Management.',
    route: '/risks',
    color: '#5A00D6',
  },
  {
    role: 'Incident Review',
    focus: 'Incident records · Investigations · Follow-up',
    insight: 'Review incident records and applicable reporting deadlines in Incident Management.',
    route: '/incidents',
    color: '#FF2E9A',
  },
  {
    role: 'Workforce Review',
    focus: 'Screening · Qualifications · Training records',
    insight: 'Review staff screening, qualifications and training records in Workforce and Training.',
    route: '/training',
    color: '#0A2B6D',
  },
  {
    role: 'Executive Reporting',
    focus: 'Source records · Management reporting',
    insight: 'Open the executive workspace to review source records and prepare management reporting.',
    route: '/operations-centre',
    color: '#A100FF',
  },
  {
    role: 'Knowledge Resources',
    focus: 'Open the assistant and knowledge resources',
    insight: 'Open the Assistant page for available help and knowledge resources.',
    route: '/assistant',
    color: '#0072FF',
  },
];

const ACCEPTANCE_22_CHECKS = [
  'Every obligation is mapped',
  'Every compliance requirement has evidence',
  'Every action has ownership',
  'Every incident has workflow',
  'Every review has scheduling',
  'Every audit has evidence',
  'Every finding has corrective action',
  'Every improvement is tracked',
  'Every communication is searchable',
  'Every document is controlled',
  'Every person has a 360° profile',
  'Every dashboard drives action',
  'Every executive understands health in 30s',
  'Every manager knows what needs attention',
  'Every auditor locates evidence immediately',
  'Every obligation is traceable to standards',
  'Every workflow supports audit readiness',
  'Every screen meets enterprise visual standards',
  'The platform reduces administrative workload',
  'Simple despite extensive enterprise capability',
  'Commercially attractive & high-converting',
  'Feels like a premium enterprise SaaS product',
];

export default function OrganisationalOperatingSystemCommand() {
  const [activeMode, setActiveMode] = useState('command'); // command | manager | executive | twin | engines
  const [loading, setLoading] = useState(false);
  const formatCount = (value) => typeof value === 'number' ? value.toLocaleString() : '—';
  const [counts, setCounts] = useState({
    employees: null,
    participants: null,
    tasksOpen: null,
    tasksOverdue: null,
    risksTotal: null,
    risksCritical: null,
    incidentsOpen: null,
    complaintsOpen: null,
    documentsTotal: null,
    documentsExpiring: null,
    policiesTotal: null,
    auditsTotal: null,
    goalsTotal: null,
    trainingTotal: null,
    qualityItems: null,
  });

  const loadLiveOSMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [
        employees,
        participants,
        tasksOpen,
        tasksOverdue,
        risksTotal,
        risksCritical,
        incidentsOpen,
        complaintsOpen,
        documentsTotal,
        documentsExpiring,
        policiesTotal,
        auditsTotal,
        goalsTotal,
        trainingTotal,
        qualityItems,
      ] = await Promise.all([
        base44.entities.StaffProfile.count().catch(() => null),
        base44.entities.ParticipantProfile.count().catch(() => null),
        base44.entities.TodoTask.count({ status: { $nin: ['Completed', 'Finalised', 'Cancelled'] } }).catch(() => null),
        base44.entities.TodoTask.count({ status: 'Overdue' }).catch(() => null),
        base44.entities.Risk.count().catch(() => null),
        base44.entities.Risk.count({ rating: { $in: ['High', 'Critical'] } }).catch(() => null),
        base44.entities.Incident.count({ status: { $nin: ['Resolved', 'Closed'] } }).catch(() => null),
        base44.entities.Complaint.count({ status: { $nin: ['Resolved', 'Closed'] } }).catch(() => null),
        base44.entities.EmployeeDocument.count().catch(() => null),
        base44.entities.EmployeeDocument.count({ status: { $in: ['Expiring Soon', 'Expired'] } }).catch(() => null),
        base44.entities.Policy.count().catch(() => null),
        base44.entities.InternalAudit.count().catch(() => null),
        base44.entities.Goal.count().catch(() => null),
        base44.entities.TrainingModule.count().catch(() => null),
        base44.entities.QualityItem.count().catch(() => null),
      ]);

      setCounts({
        employees,
        participants,
        tasksOpen,
        tasksOverdue,
        risksTotal,
        risksCritical,
        incidentsOpen,
        complaintsOpen,
        documentsTotal,
        documentsExpiring,
        policiesTotal,
        auditsTotal,
        goalsTotal,
        trainingTotal,
        qualityItems,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveOSMetrics();
  }, [loadLiveOSMetrics]);

  // Operational record counts only; this screen does not calculate compliance or readiness scores.
  const healthPillars = [
    { label: 'Employee records', detail: `${formatCount(counts.employees)} records in Employee Profiles`, path: '/our-employees' },
    { label: 'Participant records', detail: `${formatCount(counts.participants)} records in Participant Profiles`, path: '/our-participants' },
    { label: 'Policy records', detail: `${formatCount(counts.policiesTotal)} records in Documents`, path: '/documents' },
    { label: 'Internal audits', detail: `${formatCount(counts.auditsTotal)} audit records`, path: '/compliance' },
    { label: 'Quality items', detail: `${formatCount(counts.qualityItems)} improvement records`, path: '/quality' },
    { label: 'Training modules', detail: `${formatCount(counts.trainingTotal)} training records`, path: '/training' },
    { label: 'Open incidents', detail: `${formatCount(counts.incidentsOpen)} incident records`, path: '/incidents' },
    { label: 'Risk records', detail: `${formatCount(counts.risksTotal)} total · ${formatCount(counts.risksCritical)} high/critical`, path: '/risks' },
    { label: 'Open tasks', detail: `${formatCount(counts.tasksOpen)} total · ${formatCount(counts.tasksOverdue)} overdue`, path: '/tasks' },
  ];

  
  // Record counts are shown as operational context; readiness is not scored here.
  const outcome14Questions = [
    { q: '1. Compliance status', a: 'Evidence review required', sub: 'This screen does not calculate an overall compliance result.', path: '/compliance', tone: '#0072FF' },
    { q: '2. Open incidents', a: `${formatCount(counts.incidentsOpen)} open`, sub: 'Record count only; reportable deadlines are not evaluated here.', path: '/incidents', tone: '#0A2B6D' },
    { q: '3. Audit readiness', a: 'Not calculated', sub: 'Review audit evidence and actions in the Auditor Portal.', path: '/auditor-portal', tone: '#5A00D6' },
    { q: '4. Participant records', a: `${formatCount(counts.participants)} records`, sub: 'Profile count only; care and consent status are not evaluated here.', path: '/our-participants', tone: '#FF2E9A' },
    { q: '5. Employee records', a: `${formatCount(counts.employees)} records`, sub: 'Profile count only; screening status is not evaluated here.', path: '/our-employees', tone: '#0072FF' },
    { q: '6. Employee document records', a: `${formatCount(counts.documentsTotal)} records`, sub: 'Employee document count only.', path: '/documents', tone: '#5A00D6' },
    { q: '7. High or critical risks', a: `${formatCount(counts.risksCritical)} records`, sub: `${formatCount(counts.risksTotal)} total risk records.`, path: '/risks', tone: '#FF2E9A' },
    { q: '8. Incident follow-up', a: 'Review incident records', sub: 'Notification deadlines are managed in the Incident module.', path: '/incidents', tone: '#0A2B6D' },
    { q: '9. Reviews due', a: 'Open Review Due Board', sub: 'Review schedules and statuses are maintained there.', path: '/review-due', tone: '#0072FF' },
    { q: '10. Overdue tasks', a: `${formatCount(counts.tasksOverdue)} records`, sub: `${formatCount(counts.tasksOpen)} tasks not marked complete or cancelled.`, path: '/tasks', tone: '#FF2E9A' },
    { q: '11. Training records', a: `${formatCount(counts.trainingTotal)} modules`, sub: 'Module count only; overdue training is not calculated here.', path: '/training', tone: '#5A00D6' },
    { q: '12. Employee documents due', a: `${formatCount(counts.documentsExpiring)} records`, sub: 'Count of employee documents marked Expiring Soon or Expired.', path: '/documents', tone: '#0A2B6D' },
    { q: '13. Standards mapping', a: 'Review in Compliance Centre', sub: 'This screen does not calculate unmapped standards.', path: '/compliance', tone: '#0072FF' },
    { q: '14. Next step', a: 'Review items in their module', sub: 'Use linked registers to confirm owners, status and evidence.', path: '/operations-centre', tone: '#5A00D6' },
  ];


  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
      {/* Top Executive OS Header */}
      <div
        className="app-section-card-header flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3.5 text-white"
        style={{ background: HEADER_GRADIENT }}
      >
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            <Cpu className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>Australian Organisational Operating System · NDIS · Aged Care · WHS · Governance · AI</span>
          </div>
          <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
            ComplianceHR Infinity — Home Command Centre &amp; Organisational Digital Twin
          </h2>
          <p className="text-xs font-semibold text-white/95">
            Record counts and source links across People → Work → Compliance → Evidence → Intelligence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="rounded-xl border border-white/35 bg-white/15 px-3 py-1.5 text-center">
            <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
              Organisation Health
            </div>
            <div className="font-editorial text-lg font-extrabold text-white">
              Not calculated
            </div>
          </div>
          <Button
            size="sm"
            type="button"
            onClick={loadLiveOSMetrics}
            disabled={loading}
            className="bg-white text-[#0A2B6D] hover:bg-slate-100 font-extrabold text-xs"
          >
            <RefreshCw className={`mr-1 h-3.5 w-3.5 text-[#0072FF] ${loading ? 'animate-spin' : ''}`} />
            <span style={{ color: '#0A2B6D' }}>Refresh Live OS</span>
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        {/* 5 Master Architecture Layers Strip */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {FIVE_MASTER_LAYERS.map((layer) => (
            <Link
              key={layer.id}
              to={layer.route}
              className="group flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5 shadow-2xs transition hover:-translate-y-0.5 hover:border-[#5A00D6]"
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: layer.color }}
                >
                  LAYER {layer.step} · {layer.label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#0072FF] transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1.5 text-[11px] font-bold leading-snug text-[#0A2B6D]">
                {layer.sub}
              </p>
            </Link>
          ))}
        </div>

        {/* 17-Stage Organisational Assurance Model */}
        <div className="rounded-xl border border-[#C084FC]/60 bg-[#F6F0FF]/70 px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              17-Stage Organisational Assurance Lifecycle (Applied to Every Person, Risk, Incident, Audit, Contract &amp; Asset)
            </span>
            <span className="text-[10px] font-extrabold text-[#5A00D6]">
              Continuous Closed-Loop Assurance
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {ASSURANCE_17_STAGES.map((stage, idx) => (
              <React.Fragment key={stage}>
                <span className="rounded-md border border-[#0A2B6D]/20 bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                  {idx + 1}. {stage}
                </span>
                {idx < ASSURANCE_17_STAGES.length - 1 && (
                  <span className="text-[10px] font-black text-[#5A00D6]">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mode Switcher Bar: 5 Clean Command Modes */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2.5">
          {[
            { id: 'command', label: '1. 30-Second Command & Health', icon: ShieldCheck },
            { id: 'twin', label: '2. Organisational Digital Twin', icon: Cpu },
            { id: 'manager', label: '3. Manager Command Centre', icon: Users },
            { id: 'executive', label: '4. Executive & Board Centre', icon: Award },
            { id: 'engines', label: '5. 18 Universal Engines, AI & Data Quality', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMode(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-[#0A2B6D] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#00C6FF]' : 'text-[#5A00D6]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================== MODE 1: 30-SECOND COMMAND & HEALTH ==================== */}
        {activeMode === 'command' && (
          <div className="space-y-3">
            {/* 14 Primary User Outcome Questions Answered in 30 Seconds */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Management Snapshot — 14 Questions Linked to Source Modules
                </span>
                <Badge className="bg-[#0A2B6D] text-white text-[10px]">
                  Current record counts · Open a source module to review
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                {outcome14Questions.map((item) => (
                  <Link
                    key={item.q}
                    to={item.path}
                    className="flex flex-col justify-between rounded-xl border border-[#0A2B6D]/20 bg-white p-2.5 shadow-2xs transition hover:-translate-y-0.5 hover:border-[#0072FF]"
                  >
                    <div className="text-[10px] font-extrabold text-[#0A2B6D]/85 leading-snug">
                      {item.q}
                    </div>
                    <div
                      className="mt-1 text-xs font-extrabold leading-tight"
                      style={{ color: item.tone }}
                    >
                      {item.a}
                    </div>
                    <div className="mt-0.5 text-[9.5px] font-semibold text-[#0A2B6D]/75 leading-tight">
                      {item.sub}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Organisation Health (9 Pillars) + Today + Attention Required + AI Recommendations */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              {/* 9 Health Pillars */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Organisation Snapshot (9 Record Areas)
                  </span>
                  <span className="rounded-full bg-[#0072FF] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    Not calculated
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  {healthPillars.map((h) => (
                    <Link
                      key={h.label}
                      to={h.path}
                      className="rounded-lg border border-slate-200 bg-[#F6F0FF]/50 p-2 hover:border-[#5A00D6]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#0A2B6D]">{h.label}</span>
                        <span className="text-[10px] font-bold text-slate-500">Counts</span>
                      </div>
                      <p className="mt-0.5 text-[9.5px] font-semibold text-[#0A2B6D]/80 leading-tight">
                        {h.detail}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Today + Attention Required */}
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                    Today — Scheduled &amp; Due Items
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {[
                      { label: 'Open Tasks', val: counts.tasksOpen, path: '/tasks' },
                      { label: 'Reviews', val: 'Open Review Due Board', path: '/review-due' },
                      { label: 'Training Modules', val: counts.trainingTotal, path: '/training' },
                      { label: 'Assessments Due', val: 'Not assessed', path: '/checklists' },
                      { label: 'Audits Logged', val: counts.auditsTotal, path: '/auditor-portal' },
                      { label: 'Approvals Due', val: 'Not assessed', path: '/compliance' },
                    ].map((t) => (
                      <Link
                        key={t.label}
                        to={t.path}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-center hover:border-[#0072FF]"
                      >
                        <div className="text-xs font-extrabold text-[#0A2B6D]">{t.val}</div>
                        <div className="text-[9.5px] font-bold text-[#5A00D6]">{t.label}</div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                    Attention Required — Priority Risk &amp; Safeguard Radar
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {[
                      { label: 'High/Critical Risks', val: counts.risksCritical, path: '/risks?rating=high-critical' },
                      { label: 'Unresolved Incidents', val: counts.incidentsOpen, path: '/incidents' },
                      { label: 'Open Complaints', val: counts.complaintsOpen, path: '/feedback' },
                      { label: 'Missing Evidence', val: 'Not assessed', path: '/documents' },
                      { label: 'Compliance Gaps', val: 'Not assessed', path: '/compliance' },
                      { label: 'Expiring Certs/Quals', val: counts.documentsExpiring, path: '/documents' },
                    ].map((a) => (
                      <Link
                        key={a.label}
                        to={a.path}
                        className="rounded-lg border border-[#FF2E9A]/35 bg-[#F6F0FF]/40 p-2 text-center hover:border-[#FF2E9A]"
                      >
                        <div className="text-xs font-extrabold text-[#0A2B6D]">{a.val}</div>
                        <div className="text-[9.5px] font-bold text-[#FF2E9A]">{a.label}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-[#F6F0FF]/60 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
                  <span>AI Recommendations</span>
                </div>
                {[
                  { tag: 'What Changed', text: `${formatCount(counts.employees)} staff and ${formatCount(counts.participants)} participant profile records are available in their source modules.` },
                  { tag: 'What Is Overdue', text: `${formatCount(counts.tasksOverdue)} tasks are marked overdue; check owners and next steps in Tasks.` },
                  { tag: 'What Is At Risk', text: `${formatCount(counts.risksCritical)} risk records are rated high or critical; review controls and owners in Risk Management.` },
                  { tag: 'Requires Attention', text: `${formatCount(counts.documentsExpiring)} employee documents are marked Expiring Soon or Expired in the source records.` },
                  { tag: 'What Happens Next', text: 'Review the linked modules to confirm evidence, owners, statuses and due dates.' },
                ].map((rec) => (
                  <div key={rec.tag} className="rounded-lg border border-[#C084FC]/50 bg-white p-2 text-[10.5px]">
                    <span className="font-extrabold text-[#5A00D6]">{rec.tag}: </span>
                    <span className="font-semibold text-[#0A2B6D]">{rec.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODE 2: ORGANISATIONAL DIGITAL TWIN ==================== */}
        {activeMode === 'twin' && (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F6F0FF]/60 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    Operational Summary · Refreshed Record Counts
                  </span>
                  <h3 className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                    Organisational Snapshot — Linked Operational Record Areas
                  </h3>
                </div>
                <Badge className="bg-[#0A2B6D] text-white text-[10px]">
                  Counts refreshed on open or refresh
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { title: '1. Workforce Twin', metric: `${formatCount(counts.employees)} Staff Profiles`, status: 'Screening and roster status not assessed here', path: '/our-employees', color: '#0072FF' },
                  { title: '2. Participants Twin', metric: `${formatCount(counts.participants)} Participants`, status: 'Plan, consent and goal status not assessed here', path: '/our-participants', color: '#FF2E9A' },
                  { title: '3. Compliance Records', metric: 'Open Compliance Centre', status: 'Obligation and evidence status not assessed here', path: '/compliance', color: '#5A00D6' },
                  { title: '4. Governance Twin', metric: `${formatCount(counts.policiesTotal)} Controlled Policies`, status: 'Review governance records in Company Safe', path: '/company-safe', color: '#0A2B6D' },
                  { title: '5. Quality Twin', metric: `${formatCount(counts.qualityItems)} Quality Actions`, status: 'Review improvement actions and due dates', path: '/quality', color: '#0072FF' },
                  { title: '6. Risk Twin', metric: `${formatCount(counts.risksTotal)} Active Risks`, status: `${formatCount(counts.risksCritical)} rated high or critical; controls not assessed here`, path: '/risks', color: '#5A00D6' },
                  { title: '7. Safety Twin', metric: `${formatCount(counts.incidentsOpen)} Open Incidents`, status: 'Review incident and safety records in source modules', path: '/workforce-presence', color: '#FF2E9A' },
                  { title: '8. Audits Twin', metric: `${formatCount(counts.auditsTotal)} Audits Logged`, status: 'Evidence readiness not assessed here', path: '/auditor-portal', color: '#0A2B6D' },
                  { title: '9. Training Twin', metric: `${formatCount(counts.trainingTotal)} LMS Modules`, status: 'Review staff training and certificate records', path: '/training', color: '#0072FF' },
                  { title: '10. Actions Twin', metric: `${formatCount(counts.tasksOpen)} Active Tasks`, status: `${formatCount(counts.tasksOverdue)} marked overdue; escalation not assessed here`, path: '/tasks', color: '#5A00D6' },
                  { title: '11. Evidence Vault Twin', metric: `${formatCount(counts.documentsTotal)} Controlled Files`, status: 'Review document controls and retention in source records', path: '/documents', color: '#A100FF' },
                  { title: '12. Organisation Snapshot', metric: 'Not calculated', status: 'No overall health score is calculated here', path: '/operations-centre', color: '#0A2B6D' },
                ].map((node) => (
                  <Link
                    key={node.title}
                    to={node.path}
                    className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3 shadow-2xs transition hover:-translate-y-0.5 hover:border-[#5A00D6]"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-extrabold text-[#0A2B6D]">{node.title}</span>
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: node.color }}
                      />
                    </div>
                    <div className="mt-1.5 font-editorial text-base font-extrabold text-[#5A00D6]">
                      {node.metric}
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold text-[#0A2B6D]/80">
                      {node.status}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODE 3: MANAGER COMMAND CENTRE ==================== */}
        {activeMode === 'manager' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-[#F6F0FF]/60 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                    Manager Command Centre Requirement
                  </span>
                  <h3 className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                    Immediate Operational Control Across Workforce, Participants, Risks, Reviews &amp; Actions
                  </h3>
                </div>
                <Badge className="bg-[#0072FF] text-white text-[10px]">12 linked record areas</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { title: 'Workforce Compliance', value: `${formatCount(counts.employees)} Staff · ${formatCount(counts.documentsExpiring)} Expiring`, route: '/our-employees' },
                  { title: 'Participant Compliance', value: `${formatCount(counts.participants)} participant records · consent status not assessed`, route: '/our-participants' },
                  { title: 'Risks', value: `${formatCount(counts.risksTotal)} Total (${formatCount(counts.risksCritical)} High/Critical)`, route: '/risks' },
                  { title: 'Incidents', value: `${formatCount(counts.incidentsOpen)} unresolved records · deadlines not assessed`, route: '/incidents' },
                  { title: 'Complaints', value: `${formatCount(counts.complaintsOpen)} unresolved records`, route: '/feedback' },
                  { title: 'Reviews Due', value: '10-Weekly & 3/6-Monthly Schedule', route: '/review-due' },
                  { title: 'Training Due', value: `${formatCount(counts.trainingTotal)} Courses & Competency Matrix`, route: '/training' },
                  { title: 'Audits Due', value: `${formatCount(counts.auditsTotal)} Scheduled & Internal Audits`, route: '/auditor-portal' },
                  { title: 'Missing Evidence', value: 'Not assessed in this overview', route: '/documents' },
                  { title: 'Overdue Actions', value: `${formatCount(counts.tasksOverdue)} Overdue (${formatCount(counts.tasksOpen)} Open)`, route: '/tasks' },
                  { title: 'Goal Records', value: `${formatCount(counts.goalsTotal)} records · status not assessed`, route: '/goals' },
                  { title: 'Team Performance', value: 'Appraisals, Supervision & Recognition', route: '/hr' },
                ].map((card) => (
                  <Link
                    key={card.title}
                    to={card.route}
                    className="rounded-xl border border-[#0A2B6D]/20 bg-white p-2.5 shadow-2xs hover:border-[#0072FF]"
                  >
                    <div className="text-[10.5px] font-extrabold uppercase text-[#5A00D6]">{card.title}</div>
                    <div className="mt-1 text-xs font-extrabold text-[#0A2B6D]">{card.value}</div>
                  </Link>
                ))}
              </div>

              <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
                  <span>Manager Review Note</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#0A2B6D]">
                  This overview reports record counts only. Confirm task owners, risk controls and credential status in their source modules before acting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODE 4: EXECUTIVE & BOARD COMMAND CENTRE ==================== */}
        {activeMode === 'executive' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-[#F6F0FF]/60 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    Executive Command Centre Requirement
                  </span>
                  <h3 className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                    Board-Level Organisational Assurance, Strategic Readiness &amp; Enterprise Risk Posture
                  </h3>
                </div>
                <Link
                  to="/operations-centre"
                  className="inline-flex items-center gap-1 rounded-xl bg-[#5A00D6] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  <span style={{ color: '#FFFFFF' }}>Open Full Executive Centre</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { title: 'Organisation Health', value: 'Not calculated', route: '/dashboard' },
                  { title: 'Compliance Readiness', value: 'Review evidence in Compliance Centre', route: '/compliance' },
                  { title: 'Audit Readiness', value: 'Not calculated', route: '/auditor-portal' },
                  { title: 'NDIS Provider Records', value: 'Review provider details', route: '/ndis-portal' },
                  { title: 'Aged Care Readiness', value: 'Not calculated', route: '/compliance' },
                  { title: 'Employee Profiles', value: `${formatCount(counts.employees)} records · status not assessed`, route: '/our-employees' },
                  { title: 'Policy Records', value: `${formatCount(counts.policiesTotal)} records`, route: '/documents' },
                  { title: 'Goal Records', value: `${formatCount(counts.goalsTotal)} records`, route: '/projects' },
                  { title: 'Enterprise Risks', value: `${formatCount(counts.risksTotal)} Risks (${formatCount(counts.risksCritical)} High/Critical)`, route: '/risks' },
                  { title: 'Quality Records', value: `${formatCount(counts.qualityItems)} records`, route: '/quality' },
                  { title: 'Unresolved Incident Records', value: `${formatCount(counts.incidentsOpen)} records`, route: '/incidents' },
                  { title: 'Board Actions', value: 'Review actions in source modules', route: '/compliance' },
                ].map((card) => (
                  <Link
                    key={card.title}
                    to={card.route}
                    className="rounded-xl border border-[#0A2B6D]/20 bg-white p-2.5 shadow-2xs hover:border-[#5A00D6]"
                  >
                    <div className="text-[10.5px] font-extrabold uppercase text-[#0072FF]">{card.title}</div>
                    <div className="mt-1 text-xs font-extrabold text-[#0A2B6D]">{card.value}</div>
                  </Link>
                ))}
              </div>

              <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  <Sparkles className="h-3.5 w-3.5 text-[#5A00D6]" />
                  <span>Executive Review Note</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#0A2B6D]">
                  This overview reports operational record counts only. Confirm task owners, risk controls, credential status and evidence in their source modules before making decisions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODE 5: 18 UNIVERSAL ENGINES, 6 AI COPILOTS, DATA QUALITY & 22 CHECKS ==================== */}
        {activeMode === 'engines' && (
          <div className="space-y-3">
            {/* 6 AI Platform Copilots */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Assistant and Knowledge Entry Points
                </span>
                <Link
                  to="/assistant"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#5A00D6] px-2.5 py-1 text-[10.5px] font-extrabold text-white"
                >
                  <span style={{ color: '#FFFFFF' }}>Launch AI Copilot Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {AI_6_COPILOTS.map((ai) => (
                  <Link
                    key={ai.role}
                    to={ai.route}
                    className="rounded-xl border border-[#0A2B6D]/20 bg-[#F6F0FF]/40 p-2.5 hover:border-[#5A00D6]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0A2B6D]">{ai.role}</span>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ai.color }}
                      />
                    </div>
                    <div className="text-[10px] font-extrabold text-[#5A00D6]">{ai.focus}</div>
                    <p className="mt-1 text-[10.5px] font-semibold text-[#0A2B6D]/85">{ai.insight}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Data Quality Engine */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F6F0FF]/70 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Data Quality Review Shortcuts
                  </span>
                  <p className="text-[11px] font-semibold text-[#0A2B6D]/85">
                    These links open source areas for review. No automated sweep or completion result is generated from this screen.
                  </p>
                </div>
                <Link to="/compliance" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#17408b]">
                  <ArrowRight className="h-3.5 w-3.5 text-[#00C6FF]" />
                  Open Compliance Centre
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  `Missing Information (not assessed)`,
                  `Missing Evidence (not assessed)`,
                  `Missing Reviews (Tracked)`,
                  `Duplicate Records (not assessed)`,
                  `Training Expiry (not assessed)`,
                  `Expired Qualifications (${formatCount(counts.documentsExpiring)})`,
                  `Employee Documents Marked Expiring/Expired (${formatCount(counts.documentsExpiring)})`,
                  `Expired Policies (not assessed)`,
                  `Compliance Gaps (not assessed)`,
                  `Incomplete Assessments (not assessed)`,
                ].map((dq) => (
                  <span
                    key={dq}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#0A2B6D]/20 bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-[#0A2B6D]"
                  >
                    <ArrowRight className="h-3 w-3 text-[#0072FF]" />
                    <span>{dq}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 18 Universal Engines Grid */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Platform Workspaces
              </span>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
                {UNIVERSAL_18_ENGINES.map((eng) => (
                  <Link
                    key={eng.name}
                    to={eng.route}
                    className="rounded-lg border border-slate-200 bg-[#F6F0FF]/35 p-2 hover:border-[#0072FF]"
                  >
                    <div className="text-[10.5px] font-extrabold text-[#0A2B6D]">{eng.name}</div>
                    <div className="mt-0.5 text-[9.5px] font-semibold text-[#5A00D6] leading-tight">{eng.sub}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform review prompts — not a completion result */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Platform Review Checklist (22 Review Areas)
                </span>
                <Badge className="bg-[#0072FF] text-white text-[10px]">Review required</Badge>
              </div>
              <p className="text-[11px] font-semibold text-[#0A2B6D]/80">
                These are review prompts, not assessment results. Confirm each area in its source workflow before treating it as complete.
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {ACCEPTANCE_22_CHECKS.map((chk) => (
                  <div
                    key={chk}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-[#0A2B6D]"
                  >
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}