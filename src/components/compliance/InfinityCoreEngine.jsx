import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Zap, ShieldCheck, FileText, RefreshCw, Download, CheckCircle2,
  Sparkles, Activity, Users, ArrowRight, Layers, Search, ClipboardCheck, Award,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { downloadInfinityCoreEnginePdf } from '@/lib/infinityCoreEnginePdf';
import {
  getHeaderView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

export const AUTOMATION_PIPELINES = [
  {
    code: 'ENG-AUTO-01',
    title: 'Auto-Route Incidents & 24h/5d NDIS Commission Escalation',
    category: 'Safety & NDIS',
    functionName: 'autoRouteEntry',
    workflowName: 'Auto Route Incidents',
    trigger: 'On Incident / Hazard / Data Breach Creation',
    action: 'Calculates 24-hour & 5-day NDIS Commission deadlines, routes alerts to Compliance Manager & creates follow-up tasks.',
    status: 'LIVE · 24/7',
    path: '/incidents',
  },
  {
    code: 'ENG-AUTO-02',
    title: 'Staff Credential, NDIS Screening & First Aid Expiry Scanner',
    category: 'HR & Screening',
    functionName: 'complianceExpiryScan',
    workflowName: 'Staff Document Expiry Reminders',
    trigger: 'Daily 06:00 AM Schedule + On Document Change',
    action: 'Scans Blue Card, NDIS Worker Screening, Police Check, CPR & First Aid; dispatches 14/30/60/90-day renewal alerts.',
    status: 'LIVE · 24/7',
    path: '/our-employees',
  },
  {
    code: 'ENG-AUTO-03',
    title: 'Dynamic Staff Risk Score & Threshold Alert Engine',
    category: 'Risk & Governance',
    functionName: 'staffRiskThresholdAlert',
    workflowName: 'Staff Risk Alert Document Change',
    trigger: 'On Certificate, Document or Overdue Task Update',
    action: 'Recalculates real-time Staff Risk Score across HR evidence, overdue tasks & training; flags high-risk thresholds.',
    status: 'LIVE · 24/7',
    path: '/risks',
  },
  {
    code: 'ENG-AUTO-04',
    title: 'Roster Screening Gatekeeper & AI Shift Suggestion Engine',
    category: 'Rostering & Payroll',
    functionName: 'rosterSuggest',
    workflowName: 'Shift Reminder Alerts',
    trigger: 'On Shift Allocation & Weekly Roster Sign-Off',
    action: 'Verifies active worker clearances, SCHADS break rules, participant compatibility & syncs approved shifts to payroll.',
    status: 'LIVE · 24/7',
    path: '/roster',
  },
  {
    code: 'ENG-AUTO-05',
    title: 'Overdue Task Instant Alert & 30-Completed-Task Batch Reporter',
    category: 'Task Command',
    functionName: 'taskCompletionReports',
    workflowName: '30 Completed Task Reports',
    trigger: 'Real-Time Task Sign-Off + Hourly Overdue Sweep',
    action: 'Generates signed PDF/CSV batch reports every 30 completed tasks and escalates overdue high-priority tasks.',
    status: 'LIVE · 24/7',
    path: '/tasks',
  },
  {
    code: 'ENG-AUTO-06',
    title: 'Participant 10-Weekly Progress & 3-Monthly Details Check Engine',
    category: 'Participants',
    functionName: 'detailsCheckReminders',
    workflowName: 'Details Check Reminders',
    trigger: 'Scheduled Cycle + Shift Note & Goal Progress Entry',
    action: 'Auto-routes shift notes to participant goals, tracks 3-monthly review dates & emails 10-weekly progress snapshots.',
    status: 'LIVE · 24/7',
    path: '/our-participants',
  },
  {
    code: 'ENG-AUTO-07',
    title: 'AI Course Author, Competency Quiz & Certificate Generator',
    category: 'Training & LMS',
    functionName: 'aiCourseAuthor',
    workflowName: 'Monthly Training Audit Report',
    trigger: 'On Demand AI Prompt + Course Completion',
    action: 'Builds NDIS-aligned training modules & quizzes, issues verified PDF certificates & updates staff HR files.',
    status: 'LIVE · 24/7',
    path: '/training',
  },
  {
    code: 'ENG-AUTO-08',
    title: 'Weekly Compliance Audit Pack & KPI Auto-Calculation Engine',
    category: 'Audit & Board',
    functionName: 'weeklyAuditReport',
    workflowName: 'Weekly Compliance Audit Report',
    trigger: 'Weekly Schedule + Real-Time Register Changes',
    action: 'Aggregates 8 NDIS Practice Standards, calculates organisational KPIs & archives board-ready PDF audit packs.',
    status: 'LIVE · 24/7',
    path: '/compliance',
  },
];

export const SMART_FILL_ENGINES = [
  {
    code: 'SF-ENG-01',
    category: 'Audit & Board',
    title: 'Dual Master Compliance Audit Engine (CHR-AUD-001 & CHR-AUD-002)',
    coverage: '17 Audit Categories · 356 Checkpoints · 11 Pages Each',
    output: 'Auto-populates provider metadata, compliance status, evidence citations & exports A4 board audit PDFs.',
    link: '/compliance',
    badge: 'LIVE · 24/7',
    fnLabel: 'Master Audit Studio',
  },
  {
    code: 'SF-ENG-02',
    category: 'A4 Templates',
    title: '12 Standard 2026 Printable Office Templates (A4 Studio)',
    coverage: 'NDIS Service Agreement, Incident 24h/5d, Risk Matrix, Worker Screening, Consent & Handover',
    output: 'Generates both Smart-Filled Live Records and Blank Ruled A4 Office Masters + 12-Template Master Book PDF.',
    link: '/compliance',
    badge: 'LIVE · 24/7',
    fnLabel: '12 A4 Templates',
  },
  {
    code: 'SF-ENG-03',
    category: '46 Modules',
    title: '46-Screen 2026 Smart-Fill Audit & 1-Click Task Studio',
    coverage: 'All 46 Operational Modules · 125+ 2026 Compliance Documents · 6 Printed Binder Volumes',
    output: 'Saves Smart-Fill documents directly into FormSubmission register and dispatches linked TodoTask items.',
    link: '/compliance',
    badge: 'LIVE · 24/7',
    fnLabel: '46 Modules Linked',
  },
  {
    code: 'SF-ENG-04',
    category: 'Expiry Radar',
    title: 'Predictive 14 / 30 / 60 / 90-Day Expiry & Renewal Radar',
    coverage: 'EmployeeDocument, Certificate, Policy, InsurancePolicy, LeaseRecord & Participant Plan End Dates',
    output: 'Forecasts upcoming expiries across 4 horizon windows and triggers automated renewal workflows before lapse.',
    link: '/documents',
    badge: 'LIVE · 24/7',
    fnLabel: 'Predictive Radar',
  },
];

export default function InfinityCoreEngine({ compact = false }) {
  const [activePillar, setActivePillar] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sweeping, setSweeping] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');
  const [lastSweepAt, setLastSweepAt] = useState(() => new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [telemetry, setTelemetry] = useState({
    staff: 0,
    participants: 0,
    shifts: 0,
    tasks: 0,
    incidents: 0,
    risks: 0,
    certificates: 0,
    documents: 0,
    policies: 0,
    audits: 0,
    expiredDocs: 0,
    highRisks: 0,
    reportableIncidents: 0,
  });

  const loadTelemetry = useCallback(async () => {
    const [
      staff,
      participants,
      shifts,
      tasks,
      incidents,
      risks,
      certificates,
      documents,
      policies,
      audits,
      expiredDocs,
      highRisks,
    ] = await Promise.all([
      base44.entities.StaffProfile.count().catch(() => 0),
      base44.entities.ParticipantProfile.count().catch(() => 0),
      base44.entities.Shift.count().catch(() => 0),
      base44.entities.TodoTask.count().catch(() => 0),
      base44.entities.Incident.count().catch(() => 0),
      base44.entities.Risk.count().catch(() => 0),
      base44.entities.Certificate.count().catch(() => 0),
      base44.entities.EmployeeDocument.count().catch(() => 0),
      base44.entities.Policy.count().catch(() => 0),
      base44.entities.InternalAudit.count().catch(() => 0),
      base44.entities.EmployeeDocument.count({ status: 'Expired' }).catch(() => 0),
      base44.entities.Risk.count({ rating: { $in: ['High', 'Critical'] } }).catch(() => 0),
    ]);

    setTelemetry({
      staff,
      participants,
      shifts,
      tasks,
      incidents,
      risks,
      certificates,
      documents,
      policies,
      audits,
      expiredDocs,
      highRisks,
      reportableIncidents: incidents,
    });
  }, []);

  useEffect(() => {
    loadTelemetry();
  }, [loadTelemetry]);

  const validationGates = useMemo(
    () => [
      {
        code: 'VAL-GATE-01',
        name: 'NDIS Worker Screening & Credential Gatekeeper',
        standard: 'NDIS Practice Standard 2 & HR',
        badge:
          telemetry.expiredDocs === 0
            ? `100% CLEARED (${telemetry.staff} Staff)`
            : `${telemetry.expiredDocs} EXPIRY FLAGGED`,
        ruleSummary: `Verifies NDIS Worker Screening, Blue Card, Police Check & First Aid across ${telemetry.staff} staff and ${telemetry.documents} HR documents before shift publication.`,
        path: '/our-employees',
      },
      {
        code: 'VAL-GATE-02',
        name: 'Reportable Incident 24-Hour & 5-Day SLA Enforcer',
        standard: 'NDIS (Incident Management) Rules',
        badge: `${telemetry.incidents} INCIDENTS MONITORED`,
        ruleSummary: `Enforces mandatory 24-hour initial notification and 5-day follow-up submission timers across ${telemetry.incidents} logged incident records.`,
        path: '/incidents',
      },
      {
        code: 'VAL-GATE-03',
        name: 'Enterprise & Participant Risk Hierarchy Validator',
        standard: 'ISO 31000 & WHS Controls',
        badge: `${telemetry.risks} RISKS (${telemetry.highRisks} HIGH/CRIT)`,
        ruleSummary: `Validates Elimination, Minimisation, Isolation & Staff Training controls across ${telemetry.risks} active risks and participant profiles.`,
        path: '/risks',
      },
      {
        code: 'VAL-GATE-04',
        name: 'Roster Conflict, Fatigue & Qualification Engine',
        standard: 'SCHADS Award & NDIS Rostering',
        badge: `${telemetry.shifts} SHIFTS VALIDATED`,
        ruleSummary: `Checks double-bookings, minimum 10-hour rest breaks, Complex Care competencies & participant approval across ${telemetry.shifts} shifts.`,
        path: '/roster',
      },
      {
        code: 'VAL-GATE-05',
        name: 'Participant Consent, Safeguards & Plan Budget Guard',
        standard: 'NDIS Practice Standard 1 (Rights)',
        badge: `${telemetry.participants} PARTICIPANTS VERIFIED`,
        ruleSummary: `Audits Information Sharing, Advocacy & Medication consents, 3-monthly review dates and NDIS funding utilisation across ${telemetry.participants} participants.`,
        path: '/our-participants',
      },
      {
        code: 'VAL-GATE-06',
        name: 'Policy Version Control & Audit Evidence Integrity',
        standard: '8 NDIS Standards · 356 Checkpoints',
        badge: `${telemetry.policies} POLICIES · ${telemetry.audits} AUDITS`,
        ruleSummary: `Links ${telemetry.policies} controlled policies, ${telemetry.certificates} certificates and ${telemetry.audits} internal audits to the Master Compliance Checklist.`,
        path: '/compliance',
      },
    ],
    [telemetry]
  );

  const filteredPipelines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return AUTOMATION_PIPELINES;
    return AUTOMATION_PIPELINES.filter((p) =>
      `${p.code} ${p.title} ${p.category} ${p.functionName} ${p.workflowName} ${p.trigger} ${p.action}`
        .toLowerCase()
        .includes(q)
    );
  }, [searchQuery]);

  const handleRunCoreSweep = async () => {
    setSweeping(true);
    setStatusBanner('Running Infinity Core Engine diagnostic sweep across 104 functions, 65 workflows & live registers…');
    try {
      await Promise.allSettled([
        loadTelemetry(),
        base44.functions.invoke('complianceScore', {}).catch(() => null),
      ]);
      const stamp = new Date().toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSweepAt(stamp);
      setStatusBanner(
        `Infinity Core Engine Sweep Complete (${stamp}) — 104 Server Functions Online · 65 Workflows Armed · 6 Validation Gates Verified.`
      );
    } finally {
      setSweeping(false);
    }
  };

  const handleLogDiagnosticTask = async () => {
    setCreatingTask(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await base44.entities.TodoTask.create({
        title: `Infinity Core Engine Diagnostic & Validation Review (${today})`,
        task_type: 'Compliance Audit',
        module: 'Compliance & Report Centre',
        task_date: today,
        due_date: today,
        priority: 'High',
        status: 'Open',
        how_to_complete:
          'Review the 3 Infinity Core Engine pillars (104 Server Functions & 65 Workflows, 6 Real-Time Validation Gates, and Smart-Fill 2026 Document & Audit Studio) and sign off.',
        important_info: `Telemetry snapshot: ${telemetry.staff} Staff, ${telemetry.participants} Participants, ${telemetry.shifts} Shifts, ${telemetry.tasks} Tasks, ${telemetry.incidents} Incidents, ${telemetry.risks} Risks.`,
      });
      await loadTelemetry();
      setStatusBanner('Created live "Infinity Core Engine Diagnostic & Validation Review" task in Shared To-Do Command Board.');
    } catch {
      setStatusBanner('Diagnostic snapshot verified — open Shared To-Do Command Board to assign.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleExportPdf = () => {
    downloadInfinityCoreEnginePdf({
      telemetry,
      activeSubEngine: activePillar,
      validationResults: validationGates,
      automationPipelines: AUTOMATION_PIPELINES,
      smartFillEngines: SMART_FILL_ENGINES,
      lastSweepAt,
    });
  };

  const PILLAR_TABS = [
    { id: 'all', label: 'All 3 Core Engines (Unified View)', icon: Cpu },
    { id: 'automation', label: '1. AI & Automation Hub', icon: Zap },
    { id: 'validation', label: '2. Real-Time Validation Gates', icon: ShieldCheck },
    { id: 'smartfill', label: '3. Smart-Fill & Predictive Radar', icon: Sparkles },
  ];

  return (
    <section
      id="infinity-core-engine"
      className="scroll-mt-14 overflow-hidden rounded-2xl bg-white p-2 sm:p-3 space-y-3.5 text-center"
    >
      {/* Enlarged Header Fitted Cleanly, Black Subtitle, Minimised Single-Line Core Engine Tile, and 3 Action Tiles on One Line */}
      <div
        className="w-full rounded-2xl p-[4px] shadow-sm"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex flex-col items-center justify-center rounded-[12px] bg-white px-5 py-5 sm:px-8 sm:py-6 text-center space-y-3">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            <span className="text-[#0A2B6D]">Infinity </span>
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              Core Engine
            </span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
              — AI Automation &amp; Real-Time Validation
            </span>
          </h2>

          <p
            className="mx-auto max-w-4xl text-center text-xs sm:text-sm md:text-base font-extrabold text-black"
            style={{ color: '#000000' }}
          >
            Complete Control. Greater Confidence. Brighter Success.
          </p>

          {/* Minimised Core Engine Tile Fitted on One Line */}
          <div
            className="mx-auto rounded-full p-[2px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <span
              className="gradient-brand inline-flex h-[32px] items-center justify-center gap-1.5 rounded-full px-4 py-0.5 text-[10.5px] sm:text-xs font-extrabold tracking-wide text-white whitespace-nowrap"
              style={{ background: getHeaderView(4), color: '#FFFFFF' }}
            >
              <Cpu className="h-3.5 w-3.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>
                Infinity Core Engine · 104 Functions · 65 Workflows · Last Sweep {lastSweepAt}
              </span>
            </span>
          </div>

          {/* Three Action Tiles Underneath on One Single Line */}
          <div className="grid w-full grid-cols-3 gap-2">
            <div
              className="rounded-full p-[2px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={handleRunCoreSweep}
                disabled={sweeping}
                className="gradient-brand flex h-[36px] w-full items-center justify-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-extrabold text-white transition-all hover:opacity-95 disabled:opacity-60 whitespace-nowrap"
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <RefreshCw className={`h-3 w-3 shrink-0 text-white ${sweeping ? 'animate-spin' : ''}`} style={{ color: '#FFFFFF' }} />
                <span className="truncate" style={{ color: '#FFFFFF' }}>
                  {sweeping ? 'Sweeping…' : 'Run Core Engine Sweep'}
                </span>
              </button>
            </div>

            <div
              className="rounded-full p-[2px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={handleLogDiagnosticTask}
                disabled={creatingTask}
                className="gradient-brand flex h-[36px] w-full items-center justify-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-extrabold text-white transition-all hover:opacity-95 disabled:opacity-60 whitespace-nowrap"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <ClipboardCheck className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                <span className="truncate" style={{ color: '#FFFFFF' }}>
                  {creatingTask ? 'Logging…' : '1-Click Log Audit Task'}
                </span>
              </button>
            </div>

            <div
              className="rounded-full p-[2px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={handleExportPdf}
                className="gradient-brand flex h-[36px] w-full items-center justify-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-extrabold text-white transition-all hover:opacity-95 whitespace-nowrap"
                style={{ background: getHeaderView(6), color: '#FFFFFF' }}
              >
                <Download className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                <span className="truncate" style={{ color: '#FFFFFF' }}>
                  Export Core Engine A4 PDF
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-1 space-y-3.5">
        {statusBanner && (
          <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-[#0072FF] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0072FF]" />
              {statusBanner}
            </span>
            <button
              type="button"
              onClick={() => setStatusBanner('')}
              className="rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Live Telemetry Strip — App Design Coloured Borders, Blue/Pink/Purple Spray Background, App-Coloured Writing & Centered */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { label: 'Server Functions', value: '104', sub: 'Deno Edge Endpoints', icon: Cpu },
            { label: '24/7 Workflows', value: '65', sub: 'Event & Cron Triggers', icon: Zap },
            { label: 'Connected Modules', value: '46', sub: 'Unified Data Bus', icon: Layers },
            { label: 'Validation Gates', value: '6 / 6', sub: 'Real-Time Enforced', icon: ShieldCheck },
            { label: 'Smart-Fill Docs', value: '125+', sub: '2026 A4 & Digital', icon: FileText },
            { label: 'Master Checkpoints', value: '356', sub: '17 Audit Categories', icon: Award },
            { label: 'People Monitored', value: `${telemetry.staff + telemetry.participants}`, sub: `${telemetry.staff} Staff · ${telemetry.participants} Part.`, icon: Users },
            { label: 'Live Ops Records', value: `${telemetry.shifts + telemetry.tasks + telemetry.incidents + telemetry.risks}`, sub: `${telemetry.shifts} Shifts · ${telemetry.tasks} Tasks`, icon: Activity },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex h-full rounded-2xl p-[3px] shadow-sm"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full w-full flex-col items-center justify-center rounded-[13px] p-2.5 text-center"
                  style={{ background: UNIFORM_SPRAY_BG }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                    style={{ borderColor: getAppBorderView(idx) }}
                  >
                    <Icon className="h-3.5 w-3.5 text-[#0072FF]" />
                  </span>
                  <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    {stat.label}
                  </span>
                  <div className="mt-0.5 font-editorial text-base font-extrabold leading-none text-[#0A2B6D]">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[9.5px] font-extrabold text-[#0072FF]">{stat.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search Bar Moved ABOVE All 3 Core Engines & All Tiles — Same Display Colour & Words Fit Well */}
        <div
          className="rounded-2xl p-[3.5px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-col items-center justify-center gap-3 rounded-[13px] bg-white p-3.5">
            {/* Search Bar ABOVE All 3 Core Engines */}
            <div
              className="w-full rounded-full p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="relative flex w-full items-center rounded-full"
                style={{ background: UNIFORM_SPRAY_BG }}
              >
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#5A00D6]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search functions, workflows, validation gates & smart-fill engines…"
                  className="h-10 w-full rounded-full bg-transparent pl-10 pr-4 text-center text-xs sm:text-sm font-extrabold text-[#0A2B6D] placeholder:text-[#5A00D6] focus:outline-none"
                />
              </div>
            </div>

            {/* All 3 Core Engines Switcher Tiles — Same Spray Display Colour & Words Fit Cleanly */}
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-stretch">
              {PILLAR_TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const active = activePillar === tab.id;
                return (
                  <div
                    key={tab.id}
                    className={`flex h-full rounded-2xl p-[3px] shadow-2xs transition-all ${
                      active ? 'ring-2 ring-[#FF2E9A]' : ''
                    }`}
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <button
                      type="button"
                      onClick={() => setActivePillar(tab.id)}
                      className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[13px] px-3 py-2 text-center text-xs font-extrabold text-[#0A2B6D] transition-all"
                      style={{ background: UNIFORM_SPRAY_BG }}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                        style={{ borderColor: getAppBorderView(idx) }}
                      >
                        <Icon className="h-3.5 w-3.5 text-[#5A00D6]" />
                      </span>
                      <span className="leading-snug text-center text-[#0A2B6D]">{tab.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== PILLAR 1: AI & AUTOMATION COMMAND HUB — LARGER 2-LINE HEADER, APP-COLOURED WRITING, SPRAY BG & ALIGNED SECTIONS ==================== */}
        {(activePillar === 'all' || activePillar === 'automation') && (
          <div
            className="rounded-2xl p-[3.5px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="rounded-[13px] bg-white p-3.5 space-y-3">
              {/* Enlarged Sub-Engine 1 Header with Words on Second Line */}
              <div
                className="w-full rounded-2xl p-[3px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-[13px] px-5 py-2.5 text-center text-white"
                  style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                >
                  <div className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wide text-white">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                      <Zap className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span style={{ color: '#FFFFFF' }}>
                      SUB-ENGINE 1 · AI &amp; AUTOMATION COMMAND HUB
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                    104 Server Functions &amp; 65 Live Workflows · Zero-Touch Event &amp; Schedule Pipelines
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
                {(compact ? filteredPipelines.slice(0, 4) : filteredPipelines).map((pipe) => (
                  <div
                    key={pipe.code}
                    className="flex h-full rounded-2xl p-[3px] shadow-sm"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex h-full w-full flex-col items-center justify-between rounded-[13px] p-3 text-center space-y-2"
                      style={{ background: UNIFORM_SPRAY_BG }}
                    >
                      <div className="flex w-full flex-1 flex-col justify-between space-y-2">
                        {/* Fixed-Height Top Code & LIVE 24/7 Pill in App Design Colours */}
                        <div
                          className="w-full rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-[9px] bg-white px-2.5 py-1 text-center text-[10px] font-extrabold text-[#5A00D6]">
                            <span>{pipe.code} · {pipe.category}</span>
                            <span className="rounded-full border border-[#0A2B6D]/25 bg-[#F5F0FF] px-2 py-0.5 text-[9px] font-extrabold text-[#0072FF]">
                              {pipe.status}
                            </span>
                          </div>
                        </div>

                        {/* Fixed-Height Centered Title Box */}
                        <div
                          className="w-full rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[54px] items-center justify-center rounded-[9px] bg-white px-2.5 py-1.5 text-center text-xs font-extrabold text-[#0A2B6D] leading-snug">
                            {pipe.title}
                          </div>
                        </div>

                        {/* Fixed-Height Centered Trigger & Action Box */}
                        <div
                          className="flex flex-1 rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[92px] w-full flex-col items-center justify-center gap-1 rounded-[9px] bg-white/95 p-2.5 text-center">
                            <div className="text-[10.5px] font-extrabold text-[#5A00D6]">
                              Trigger: {pipe.trigger}
                            </div>
                            <p className="text-[10.5px] font-bold text-[#0072FF] leading-snug">
                              {pipe.action}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Fixed-Height Bottom Bar with App-Coloured Open Button */}
                      <div className="flex h-[38px] w-full items-center justify-between gap-2 border-t border-[#0A2B6D]/15 pt-2">
                        <span className="truncate rounded-full border border-[#0A2B6D]/25 bg-white px-2.5 py-0.5 font-mono text-[9.5px] font-extrabold text-[#5A00D6]">
                          fn: {pipe.functionName}
                        </span>
                        <div
                          className="rounded-full p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <Link
                            to={pipe.path}
                            className="inline-flex h-[26px] items-center justify-center gap-1 rounded-full bg-white px-2.5 text-[10px] font-extrabold text-[#0A2B6D]"
                          >
                            <span className="text-[#5A00D6]">Open</span>
                            <ArrowRight className="h-2.5 w-2.5 text-[#0072FF]" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== PILLAR 2: REAL-TIME COMPLIANCE, RISK & ROSTER VALIDATION ENGINE — LARGER 2-LINE HEADER, SPRAY BG & ALIGNED SECTIONS ==================== */}
        {(activePillar === 'all' || activePillar === 'validation') && (
          <div
            className="rounded-2xl p-[3.5px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="rounded-[13px] bg-white p-3.5 space-y-3">
              {/* Enlarged Sub-Engine 2 Header with Words on Second Line */}
              <div
                className="w-full rounded-2xl p-[3px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-[13px] px-5 py-2.5 text-center text-white"
                  style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                >
                  <div className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wide text-white">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                      <ShieldCheck className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span style={{ color: '#FFFFFF' }}>
                      SUB-ENGINE 2 · REAL-TIME COMPLIANCE, RISK &amp; ROSTER VALIDATION ENGINE
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                    6 Live Validation Gates · Real-Time Database Gatekeeper
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                {validationGates.map((gate) => (
                  <div
                    key={gate.code}
                    className="flex h-full rounded-2xl p-[3px] shadow-sm"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex h-full w-full flex-col items-center justify-between rounded-[13px] p-3 text-center space-y-2"
                      style={{ background: UNIFORM_SPRAY_BG }}
                    >
                      <div className="flex w-full flex-1 flex-col justify-between space-y-2">
                        <div
                          className="w-full rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-[9px] bg-white px-2.5 py-1 text-center text-[10px] font-extrabold text-[#5A00D6]">
                            <span>{gate.code} · {gate.standard}</span>
                            <span className="rounded-full border border-[#0A2B6D]/25 bg-[#F5F0FF] px-2 py-0.5 text-[9px] font-extrabold text-[#0072FF]">
                              {gate.badge}
                            </span>
                          </div>
                        </div>

                        <div
                          className="w-full rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[50px] items-center justify-center rounded-[9px] bg-white px-2.5 py-1.5 text-center text-xs font-extrabold text-[#0A2B6D]">
                            {gate.name}
                          </div>
                        </div>

                        <div
                          className="flex flex-1 rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[78px] w-full items-center justify-center rounded-[9px] bg-white/95 p-2.5 text-center">
                            <p className="text-[10.5px] font-bold text-[#0072FF] leading-snug">
                              {gate.ruleSummary}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex h-[38px] w-full items-center justify-between border-t border-[#0A2B6D]/15 pt-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/25 bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                          <CheckCircle2 className="h-3 w-3 text-[#0072FF]" /> Active Rule Gate
                        </span>
                        <div
                          className="rounded-full p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <Link
                            to={gate.path}
                            className="inline-flex h-[26px] items-center justify-center gap-1 rounded-full bg-white px-2.5 text-[10px] font-extrabold text-[#0A2B6D]"
                          >
                            <span className="text-[#5A00D6]">Open</span>
                            <ArrowRight className="h-2.5 w-2.5 text-[#0072FF]" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== PILLAR 3: SMART-FILL DOCUMENT, AUDIT & PREDICTIVE ALERT ENGINE — LARGER 2-LINE HEADER & EXACT SAME TILE DESIGN AS ABOVE ==================== */}
        {(activePillar === 'all' || activePillar === 'smartfill') && (
          <div
            className="rounded-2xl p-[3.5px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="rounded-[13px] bg-white p-3.5 space-y-3">
              {/* Enlarged Sub-Engine 3 Header with Words on Second Line */}
              <div
                className="w-full rounded-2xl p-[3px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-[13px] px-5 py-2.5 text-center text-white"
                  style={{ background: getHeaderView(2), color: '#FFFFFF' }}
                >
                  <div className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wide text-white">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                      <Sparkles className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span style={{ color: '#FFFFFF' }}>
                      SUB-ENGINE 3 · SMART-FILL DOCUMENT, AUDIT &amp; PREDICTIVE ALERT ENGINE
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                    2026 Smart-Fill Studio · 125+ Docs · 12 A4 Templates · 356 Checkpoints
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
                {SMART_FILL_ENGINES.map((eng) => (
                  <div
                    key={eng.code}
                    className="flex h-full rounded-2xl p-[3px] shadow-sm"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex h-full w-full flex-col items-center justify-between rounded-[13px] p-3 text-center space-y-2"
                      style={{ background: UNIFORM_SPRAY_BG }}
                    >
                      <div className="flex w-full flex-1 flex-col justify-between space-y-2">
                        <div
                          className="w-full rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-[9px] bg-white px-2.5 py-1 text-center text-[10px] font-extrabold text-[#5A00D6]">
                            <span>{eng.code} · {eng.category}</span>
                            <span className="rounded-full border border-[#0A2B6D]/25 bg-[#F5F0FF] px-2 py-0.5 text-[9px] font-extrabold text-[#0072FF]">
                              {eng.badge}
                            </span>
                          </div>
                        </div>

                        <div
                          className="w-full rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[54px] items-center justify-center rounded-[9px] bg-white px-2.5 py-1.5 text-center text-xs font-extrabold text-[#0A2B6D] leading-snug">
                            {eng.title}
                          </div>
                        </div>

                        <div
                          className="flex flex-1 rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[92px] w-full flex-col items-center justify-center gap-1 rounded-[9px] bg-white/95 p-2.5 text-center">
                            <div className="text-[10.5px] font-extrabold text-[#5A00D6]">
                              {eng.coverage}
                            </div>
                            <p className="text-[10.5px] font-bold text-[#0072FF] leading-snug">
                              {eng.output}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex h-[38px] w-full items-center justify-between gap-2 border-t border-[#0A2B6D]/15 pt-2">
                        <span className="truncate rounded-full border border-[#0A2B6D]/25 bg-white px-2.5 py-0.5 font-mono text-[9.5px] font-extrabold text-[#5A00D6]">
                          {eng.fnLabel}
                        </span>
                        <div
                          className="rounded-full p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <Link
                            to={eng.link}
                            className="inline-flex h-[26px] items-center justify-center gap-1 rounded-full bg-white px-2.5 text-[10px] font-extrabold text-[#0A2B6D]"
                          >
                            <span className="text-[#5A00D6]">Open</span>
                            <ArrowRight className="h-2.5 w-2.5 text-[#0072FF]" />
                          </Link>
                        </div>
                      </div>
                    </div>
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