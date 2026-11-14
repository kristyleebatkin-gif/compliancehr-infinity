import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { exportUniversalData } from '@/lib/universalStorageAndExportEngine';
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  Printer,
} from 'lucide-react';

export const UX_6_AUTO_ANSWERS = [
  {
    q: '1. Where is this stored?',
    a: 'Storage locations depend on the owning module and have not been verified for every record type.',
    path: '/universal-storage',
    cta: 'Open 8-Hub Storage',
  },
  {
    q: '2. Which module is this in?',
    a: 'Use the module links shown on this page; cross-module access and role visibility require validation.',
    path: '/record-intelligence',
    cta: 'Open Record Intelligence',
  },
  {
    q: '3. How do I find this?',
    a: 'Search and role workspace behaviour, result completeness and click counts have not been measured.',
    path: '/documents',
    cta: 'Search All Records',
  },
  {
    q: '4. What form do I use?',
    a: 'Form selection and auto-fill are intended capabilities; available forms and runtime behaviour require verification.',
    path: '/checklists',
    cta: 'Launch Smart Forms',
  },
  {
    q: '5. What document do I need?',
    a: 'Use the owning module to locate relevant documents; automatic standards-based attachment is not verified.',
    path: '/compliance',
    cta: 'View Evidence Map',
  },
  {
    q: '6. What am I supposed to do next?',
    a: 'The intended design is to show the next action. Runtime behaviour and role-specific guidance have not been verified.',
    path: '/frontline-hub',
    cta: 'Open My Day & Next Action',
  },
];

export const ROLE_5_WORKSPACES = {
  participant: {
    label: 'Participant Workspace (7 Panels · validation pending)',
    subtitle: 'Everything a participant or nominee needs in one clear, accessible view.',
    items: [
      { title: '1. Services', metric: 'Active Schedule', desc: 'Current & upcoming daily living and community supports', path: '/roster' },
      { title: '2. Goals', metric: 'Not measured yet', desc: 'Personal NDIS & Aged Care goals and milestone achievements', path: '/goals' },
      { title: '3. Reviews', metric: 'Not measured yet', desc: 'Quarterly service & support plan progress reviews', path: '/review-due' },
      { title: '4. Consents', metric: 'Not measured yet', desc: 'Information sharing, medication, advocacy & audit consents', path: '/compliance' },
      { title: '5. Communications', metric: 'Live Diary', desc: 'Direct updates with support team, coordinator & family', path: '/communications' },
      { title: '6. Documents', metric: 'Not measured yet', desc: 'Welcome Pack, Service Agreement, Handbook & plans', path: '/documents' },
      { title: '7. Upcoming Supports', metric: 'Not measured yet', desc: 'Next rostered shifts, matched support workers & transport', path: '/roster' },
    ],
  },
  employee: {
    label: 'Employee Workspace (10 Panels · validation pending)',
    subtitle: 'Mobile-first rapid workspace so frontline staff focus 100% on care, not admin.',
    items: [
      { title: '1. My Day', metric: 'Live Shift Ready', desc: 'Today’s assigned participants, shift goals, alerts & checklists', path: '/frontline-hub' },
      { title: '2. My Shifts', metric: 'Clock In <10s', desc: 'Active & upcoming shifts with 1-tap Clock In / Clock Out', path: '/frontline-hub' },
      { title: '3. My Roster', metric: '14-Day View', desc: 'Published roster, sleepovers, broken shifts & handovers', path: '/roster' },
      { title: '4. My Availability', metric: 'Not measured yet', desc: 'Leave requests, preferred hours & on-call availability', path: '/roster' },
      { title: '5. My Time Sheets', metric: 'Not measured yet', desc: 'Validated hours, allowances, travel km & payslips', path: '/my-payroll' },
      { title: '6. My Tasks', metric: 'One-Click Done', desc: 'Assigned actions, follow-ups & pre-shift checks', path: '/tasks' },
      { title: '7. My Notes', metric: '<5 Min Voice/AI', desc: 'Shift notes, progress notes & goal updates with Voice-to-Text', path: '/frontline-hub' },
      { title: '8. My Compliance', metric: 'Not measured yet', desc: 'Policies read, acknowledged, understood & completed', path: '/my-profile' },
      { title: '9. My Training', metric: 'Not measured yet', desc: 'Induction, skills assessments, medication & refresher modules', path: '/training' },
      { title: '10. My Certifications', metric: 'Not measured yet', desc: 'NDIS Screening, WWCC, Police Check, First Aid & CPR', path: '/certificates' },
    ],
  },
  manager: {
    label: 'Manager Workspace & Unified Review Mode (8 Panels · validation pending)',
    subtitle: 'Review team notes, risks, goals, shifts, documentation and compliance from one location.',
    items: [
      { title: '1. Team Compliance', metric: 'Not measured yet', desc: 'Clearances, mandatory training, policies & expiring credentials', path: '/hr' },
      { title: '2. Team Rosters', metric: 'Not measured yet', desc: 'Shift coverage, variance approvals & SCHADS award controls', path: '/roster' },
      { title: '3. Team Availability', metric: 'Live View', desc: 'Leave balances, shift swaps & fatigue management', path: '/roster' },
      { title: '4. Team Reviews', metric: 'Not measured yet', desc: 'Supervisions, appraisals & 90-day participant reviews', path: '/review-due' },
      { title: '5. Team Risks', metric: 'Not measured yet', desc: 'Participant, home, WHS & operational risk mitigations', path: '/risks' },
      { title: '6. Team Goals', metric: 'Active Tracking', desc: 'Participant goal milestones & staff performance goals', path: '/goals' },
      { title: '7. Team Notes', metric: 'Not measured yet', desc: 'Batch review & sign-off of shift, progress & service notes', path: '/communications' },
      { title: '8. Team Actions', metric: 'Not measured yet', desc: 'Delegated tasks, CAPAs & escalation resolution', path: '/tasks' },
    ],
  },
  compliance: {
    label: 'Compliance Workspace (8 Panels · validation pending)',
    subtitle: 'Continuous NDIS & Aged Care evidence verification with zero manual chasing.',
    items: [
      { title: '1. Evidence', metric: 'Not measured yet', desc: 'Signed Vault & Company Safe evidence linked to every control', path: '/compliance' },
      { title: '2. Standards', metric: 'NDIS 1–8 / AC 1–8', desc: 'Practice Standards, SIRS, High-Intensity & WHS mapping', path: '/compliance' },
      { title: '3. Reviews', metric: 'Automated 30–1d', desc: 'Policies, plans, fire drills, infection & emergency reviews', path: '/review-due' },
      { title: '4. Audits', metric: 'Not measured yet', desc: 'Internal audit schedules, findings & instant audit packs', path: '/auditor-portal' },
      { title: '5. Risks', metric: 'ISO 31000 Live', desc: 'Enterprise, clinical, medication, vehicle & environmental risks', path: '/risks' },
      { title: '6. Incidents', metric: '24h / 5d SLA', desc: 'Reportable incidents, root-cause investigations & CAPA', path: '/incidents' },
      { title: '7. Missing Records', metric: 'Auto-Detected', desc: 'Real-time detection of missing notes, signatures or checks', path: '/compliance' },
      { title: '8. Compliance Gaps', metric: 'Not measured yet', desc: 'Automated remediation tasks & Immediate→7d escalations', path: '/quality' },
    ],
  },
  executive: {
    label: 'Executive Workspace (8 Panels · validation pending)',
    subtitle: 'Board-ready governance, workforce, clinical quality and financial intelligence.',
    items: [
      { title: '1. Compliance Health', metric: 'Not measured yet', desc: 'Whole-of-organisation regulatory & accreditation posture', path: '/operations-centre' },
      { title: '2. Governance Health', metric: 'Not measured yet', desc: 'Versioned master records, board reports & 7PM snapshots', path: '/operations-centre' },
      { title: '3. Workforce Health', metric: 'Not measured yet', desc: 'Attendance, credentialing, retention & SCHADS payroll accuracy', path: '/workforce-presence' },
      { title: '4. Service Quality', metric: 'Not measured yet', desc: 'Service delivery matching, feedback & zero open complaints', path: '/quality' },
      { title: '5. Goal Achievement', metric: 'Not measured yet', desc: 'Measurable participant independence & outcome gains', path: '/goals' },
      { title: '6. Risks', metric: 'Not measured yet', desc: 'Strategic, clinical, financial & WHS risk heatmap', path: '/risks' },
      { title: '7. Incidents', metric: 'Not measured yet', desc: 'NDIS Commission & Aged Care SIRS statutory compliance', path: '/incidents' },
      { title: '8. Audit Readiness', metric: '1-Click Pack', desc: 'Instant PDF, Word, Excel & CSV Executive & Audit Packs', path: '/auditor-portal' },
    ],
  },
};

export const SPEED_8_BENCHMARKS = [
  { id: 'clock_in', task: '1. Clock In', target: '< 10 seconds', actual: 'Not measured', standard: 'NDIS Standard 2 · SCHADS Award', path: '/frontline-hub' },
  { id: 'clock_out', task: '2. Clock Out', target: '< 10 seconds', actual: 'Not measured', standard: 'NDIS Standard 2 · 7-Gate Verified', path: '/frontline-hub' },
  { id: 'vehicle_check', task: '3. Vehicle Check', target: '< 2 minutes', actual: 'Not measured', standard: 'WHS & Fleet Safety Standard', path: '/frontline-hub' },
  { id: 'shift_note', task: '4. Shift Note', target: '< 5 minutes', actual: 'Not measured', standard: 'NDIS Standard 3 · Voice/AI Assisted', path: '/frontline-hub' },
  { id: 'progress_note', task: '5. Progress Note', target: '< 5 minutes', actual: 'Not measured', standard: 'NDIS Standard 3 · Auto-Routed', path: '/record-intelligence' },
  { id: 'goal_update', task: '6. Goal Update', target: '< 2 minutes', actual: 'Not measured', standard: 'NDIS Outcome Framework', path: '/goals' },
  { id: 'review_approval', task: '7. Review Approval', target: '< 2 minutes', actual: 'Not measured', standard: 'Clinical & Operational Governance', path: '/review-due' },
  { id: 'doc_upload', task: '8. Document Upload', target: '< 1 minute', actual: 'Not measured', standard: 'Document Vault & Company Safe', path: '/documents' },
];

export const UNIFIED_AUDIT_7_VIEWS = [
  { area: '1. View Evidence', count: 'Not measured yet', detail: 'Every action linked to who, when, what occurred & standard supported', path: '/compliance' },
  { area: '2. View Supporting Documents', count: 'Not measured yet', detail: 'Policies, agreements, credentials & assessments in Document Vault', path: '/documents' },
  { area: '3. View Communications', count: 'Not measured yet', detail: 'Calls, emails, SMS, family updates & shift handovers', path: '/communications' },
  { area: '4. View Reviews', count: 'Not measured yet', detail: 'Participant reviews, staff appraisals, fire drills & infection audits', path: '/review-due' },
  { area: '5. View Goals', count: 'Not measured yet', detail: 'Participant NDIS goals, milestones & measurable outcome evidence', path: '/goals' },
  { area: '6. View Risks', count: 'Not measured yet', detail: 'Individual, home, clinical, WHS & fleet risk controls', path: '/risks' },
  { area: '7. View Incidents', count: 'Not measured yet', detail: 'Incident timeline, notifications, root-cause investigations & CAPA', path: '/incidents' },
];

export default function UniversalUserSuccessEvidenceFirstSuite() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('workspaces');
  const [selectedRoleKey, setSelectedRoleKey] = useState('employee');
  const [lastEvidenceStamp] = useState({
    what_occurred: 'Not recorded',
    when_occurred: 'Not recorded',
    who_completed: 'Not recorded',
    evidence_exists: 'Not recorded',
    standards_supported: 'Not recorded',
  });

  const today = new Date().toISOString().slice(0, 10);

  // This overview shortcut does not complete the operational workflow or create evidence.
  const handleInstantSpeedAction = (benchmark) => {
    toast({
      title: 'Workflow action not connected',
      description: `No ${benchmark.task} action or evidence was recorded. Open the linked module to complete the real workflow.`,
      variant: 'destructive',
    });
  };

  // Batch approval is unavailable until the underlying reviews can be verified individually.
  const handleBatchManagerSignOff = () => {
    toast({
      title: 'Batch sign-off not connected',
      description: 'No approval was recorded. Review and approve each item in its owning module.',
      variant: 'destructive',
    });
  };

  // Export User Success & Evidence-First Audit Pack (PDF / Word / Excel / CSV)
  const handleExportEvidencePack = (formatType) => {
    const activeWorkspace = ROLE_5_WORKSPACES[selectedRoleKey];
    const rows = activeWorkspace.items.map((it) => ({
      workspace: activeWorkspace.label,
      panel: it.title,
      status: 'Not verified',
      detail: it.desc,
      what_occurred: lastEvidenceStamp.what_occurred,
      when_occurred: lastEvidenceStamp.when_occurred,
      who_completed: lastEvidenceStamp.who_completed,
      standards: lastEvidenceStamp.standards_supported,
    }));

    exportUniversalData(
      formatType,
      `User-Success-Evidence-First-${selectedRoleKey}-${today}`,
      [
        { key: 'workspace', label: 'Role Workspace' },
        { key: 'panel', label: 'Workspace Panel' },
        { key: 'status', label: 'Live Status / Metric (not verified)' },
        { key: 'detail', label: 'Operational Scope' },
        { key: 'what_occurred', label: 'Evidence: What Occurred' },
        { key: 'when_occurred', label: 'Evidence: When' },
        { key: 'who_completed', label: 'Evidence: Who Completed' },
        { key: 'standards', label: 'Standards Supported' },
      ],
      rows,
      `Universal User Success, Rapid Access & Evidence-First Standard — ${activeWorkspace.label}`
    );

    toast({
      title: `Evidence-First Pack (${formatType.toUpperCase()}) Exported`,
      description: 'Exports the workspace configuration; status, evidence links and standards mapping are marked unverified.'
    });
  };

  const activeWorkspace = ROLE_5_WORKSPACES[selectedRoleKey] || ROLE_5_WORKSPACES.employee;

  return (
    <section
      aria-label="Universal User Success, Rapid Access & Evidence-First Standard"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md space-y-4"
    >
      {/* Top Master Rule Banner */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #0A2B6D 0%, #0072FF 26%, #5A00D6 60%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Zap className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Top-Level Platform Rule · User Success · Rapid Access · Evidence-First Design</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              Universal User Success, Rapid Access &amp; Evidence-First Standard
            </h2>
            <p className="text-xs font-medium text-white/95">
              &ldquo;Every feature must save users time, reduce clicks, reduce typing, improve visibility, increase compliance, create evidence automatically, and make work easier.&rdquo;
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleBatchManagerSignOff}
              disabled
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-slate-100"
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
              <span style={{ color: '#0A2B6D' }}>
                Batch sign-off not connected
              </span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportEvidencePack('pdf')}
              className="border-white bg-white/15 text-white font-extrabold hover:bg-white/25"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Export Evidence-First Pack (PDF)
            </Button>
          </div>
        </div>
      </div>

      {/* 5-Point Automatic Evidence-First Live Stamp Strip */}
      <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            Evidence-first design standard — capture these five points when a real action is completed
          </span>
          <Badge className="bg-[#0072FF] text-white text-[10px]">
            Record links and duplicate controls require validation
          </Badge>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {[
            { label: '1. What Occurred', val: lastEvidenceStamp.what_occurred },
            { label: '2. When It Occurred', val: lastEvidenceStamp.when_occurred },
            { label: '3. Who Completed It', val: lastEvidenceStamp.who_completed },
            { label: '4. What Evidence Exists', val: lastEvidenceStamp.evidence_exists },
            { label: '5. Standards Supported', val: lastEvidenceStamp.standards_supported },
          ].map((pt) => (
            <div
              key={pt.label}
              className="rounded-lg border border-[#0A2B6D] bg-white p-2"
            >
              <div className="text-[10px] font-extrabold uppercase text-[#5A00D6]">{pt.label}</div>
              <div className="mt-0.5 text-[11px] font-bold text-[#0A2B6D]">{pt.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {[
          { id: 'workspaces', label: '1. 5 Personalised Role Workspaces (Participant · Employee · Manager · Compliance · Executive)' },
          { id: 'speed-standard', label: '2. 8-Task Speed Standard (<10s Clock-In to <5m Notes) & 8 Rapid Documentation Tools' },
          { id: 'manager-audit-mode', label: '3. Unified Manager Review Mode (6 Areas) & One-Screen Audit Mode (7 Areas)' },
          { id: 'zero-questions', label: '4. 6 Auto-Answered UX Questions & No-Dead-Ends Navigation Strip' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === t.id
                ? 'bg-[#0A2B6D] text-white shadow-xs'
                : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 5 PERSONALISED ROLE WORKSPACES */}
      {activeTab === 'workspaces' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'participant', label: 'Participant Workspace (7 Panels)' },
              { id: 'employee', label: 'Employee Workspace (10 Panels)' },
              { id: 'manager', label: 'Manager Workspace (8 Panels)' },
              { id: 'compliance', label: 'Compliance Workspace (8 Panels)' },
              { id: 'executive', label: 'Executive Workspace (8 Panels)' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleKey(r.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  selectedRoleKey === r.id
                    ? 'bg-[#5A00D6] text-white'
                    : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                  {activeWorkspace.label}
                </div>
                <p className="text-[11px] font-medium text-[#0A2B6D]">{activeWorkspace.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['pdf', 'word', 'excel', 'csv'].map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportEvidencePack(fmt)}
                    className="h-7 border-[#0A2B6D] text-[10.5px] font-extrabold text-[#0A2B6D]"
                  >
                    Export {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {activeWorkspace.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/30 p-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-[#0A2B6D]">{item.title}</span>
                      <Badge className="bg-[#0A2B6D] text-white text-[9.5px]">Not verified</Badge>
                    </div>
                    <p className="mt-1 text-[10.5px] font-medium text-[#0A2B6D]">{item.desc}</p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-[#5A00D6]">Evidence linking not verified</span>
                    <Link
                      to={item.path}
                      className="inline-flex items-center text-[10.5px] font-extrabold text-[#0072FF] hover:underline"
                    >
                      Open Now <ArrowRight className="ml-0.5 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 8-TASK SPEED STANDARD & 8 RAPID DOCUMENTATION CAPABILITIES */}
      {activeTab === 'speed-standard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {SPEED_8_BENCHMARKS.map((bm) => (
              <div
                key={bm.id}
                className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0A2B6D]">{bm.task}</span>
                    <Badge className="bg-[#0072FF] text-white text-[10px]">
                      Target: {bm.target}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs font-black text-[#5A00D6]">
                    Runtime speed not measured
                  </div>
                  <div className="text-[10px] font-medium text-[#0A2B6D]">{bm.standard}</div>
                </div>
                <div className="pt-1.5 flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => handleInstantSpeedAction(bm)}
                    disabled
                    className="h-7 flex-1 bg-[#0A2B6D] text-white text-[10.5px] font-extrabold hover:bg-[#0072FF]"
                  >
                    Workflow action not connected
                  </Button>
                  <Link
                    to={bm.path}
                    className="rounded-md border border-[#0A2B6D] px-2 py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                  >
                    Go
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Universal Rapid Documentation Standard — 8 Typing-Reduction Capabilities Active Everywhere
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8">
              {[
                '1. Voice To Text',
                '2. Smart Templates',
                '3. Quick Notes',
                '4. ✓ Yes / ✗ No Checklists',
                '5. Auto-Fill',
                '6. Pre-Fill',
                '7. Smart Suggestions',
                '8. Mobile Entry',
              ].map((cap) => (
                <div
                  key={cap}
                  className="rounded-lg border border-[#0A2B6D] bg-white px-2 py-1.5 text-center text-[10.5px] font-extrabold text-[#0A2B6D]"
                >
                  ✓ {cap}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNIFIED MANAGER REVIEW MODE (6 AREAS) & ONE-SCREEN AUDIT MODE (7 AREAS) */}
      {activeTab === 'manager-audit-mode' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Unified Manager Review Mode */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Manager Review Mode (6 Team Areas in One Location)
              </div>
              <Button
                size="sm"
                onClick={handleBatchManagerSignOff}
                className="h-7 bg-[#0072FF] text-white text-[10.5px] font-extrabold"
              >
                Approve All 6 Areas
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { title: '1. Review Team Notes', status: 'Not measured yet', link: '/communications' },
                { title: '2. Review Team Risks', status: 'Not measured yet', link: '/risks' },
                { title: '3. Review Team Goals', status: 'Not measured yet', link: '/goals' },
                { title: '4. Review Team Shifts', status: 'Not measured yet', link: '/roster' },
                { title: '5. Review Team Documentation', status: 'Not measured yet', link: '/documents' },
                { title: '6. Review Team Compliance', status: 'Not measured yet', link: '/hr' },
              ].map((m) => (
                <div
                  key={m.title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-[#0A2B6D]">{m.title}</div>
                    <div className="text-[10px] font-bold text-[#5A00D6]">{m.status}</div>
                  </div>
                  <Link
                    to={m.link}
                    className="rounded border border-[#0A2B6D] bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Unified One-Screen Audit Mode */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                One-Screen Audit Mode (7 Evidence Streams Without Module Searching)
              </div>
              <Button
                size="sm"
                onClick={() => handleExportEvidencePack('pdf')}
                className="h-7 bg-[#5A00D6] text-white text-[10.5px] font-extrabold"
              >
                Export Audit Pack
              </Button>
            </div>
            <div className="space-y-1.5">
              {UNIFIED_AUDIT_7_VIEWS.map((av) => (
                <div
                  key={av.area}
                  className="rounded-lg border border-slate-200 bg-[#F5F0FF]/40 px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-extrabold text-[#0A2B6D]">{av.area}</span>
                    <span className="ml-2 text-[10px] font-medium text-[#0A2B6D]">— {av.detail}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-[#0A2B6D] text-white text-[9.5px]">Not verified</Badge>
                    <Link
                      to={av.path}
                      className="text-[10px] font-extrabold text-[#0072FF] hover:underline"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 6 AUTO-ANSWERED UX QUESTIONS & NO-DEAD-ENDS NAVIGATION */}
      {activeTab === 'zero-questions' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {UX_6_AUTO_ANSWERS.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="text-xs font-extrabold text-[#5A00D6]">
                    Never Need to Ask: &ldquo;{item.q}&rdquo;
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#0A2B6D]">{item.a}</p>
                </div>
                <Link
                  to={item.path}
                  className="inline-flex items-center text-[11px] font-extrabold text-[#0072FF] hover:underline"
                >
                  {item.cta} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>

          {/* No Dead Ends Rule Strip */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              No Dead Ends Rule — Every Screen Always Provides All 6 Connected Pathways
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: '1. Next Action', path: '/frontline-hub', sub: 'Finish My Shift & Queue' },
                { label: '2. Related Records', path: '/record-intelligence', sub: 'Participant & Staff Links' },
                { label: '3. Related Evidence', path: '/documents', sub: 'Vault & Company Safe' },
                { label: '4. Related Communications', path: '/communications', sub: 'Calls, Emails & Diary' },
                { label: '5. Related Standards', path: '/compliance', sub: 'NDIS 1–8 & Aged Care 1–8' },
                { label: '6. Related Tasks', path: '/tasks', sub: 'Shared To-Do & Reminders' },
              ].map((nd) => (
                <Link
                  key={nd.label}
                  to={nd.path}
                  className="rounded-lg border border-[#0A2B6D] bg-white p-2 hover:bg-[#F5F0FF] transition block"
                >
                  <div className="text-[11px] font-extrabold text-[#0A2B6D]">{nd.label}</div>
                  <div className="text-[9.5px] font-bold text-[#0072FF]">{nd.sub} →</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}