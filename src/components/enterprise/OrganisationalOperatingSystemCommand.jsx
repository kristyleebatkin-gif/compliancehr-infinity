import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, Sparkles, ArrowRight, RefreshCw,
  Cpu, Award, CheckCircle2, Layers, HeartHandshake, Stethoscope,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AlliedHealthAndNursingOsSuite from '@/components/enterprise/AlliedHealthAndNursingOsSuite';

export const OPERATING_SYSTEMS_26 = [
  { id: 'governance-os', name: '1. Governance OS', focus: 'Board packs, delegations, policies & lifecycle', route: '/governance' },
  { id: 'compliance-os', name: '2. Compliance OS', focus: '356 NDIS & Aged Care checkpoints & obligations', route: '/compliance' },
  { id: 'risk-os', name: '3. Risk OS', focus: 'ISO 31000 5×5 matrix, controls & Take-5', route: '/risks' },
  { id: 'quality-os', name: '4. Quality OS', focus: 'Continuous improvement, CAPA & lessons learned', route: '/quality' },
  { id: 'audit-os', name: '5. Audit OS', focus: 'External & internal audits, evidence packs', route: '/auditor-portal' },
  { id: 'evidence-os', name: '6. Evidence OS', focus: 'Automatic evidence capture, consent & signatures', route: '/user-success' },
  { id: 'workforce-os', name: '7. Workforce OS', focus: 'Worker screening, presence & fatigue monitoring', route: '/workforce-presence' },
  { id: 'hr-os', name: '8. HR OS', focus: 'Contracts, position descriptions, appraisals & leave', route: '/hr' },
  { id: 'learning-os', name: '9. Learning OS', focus: 'Role-based LMS, quizzes, buddy shifts & matrix', route: '/training' },
  { id: 'reporting-os', name: '10. Reporting OS', focus: 'Board, executive, compliance & audit exports', route: '/analytics' },
  { id: 'intelligence-os', name: '11. Intelligence OS', focus: 'Organisational brain, routing & predictive radar', route: '/record-intelligence' },
  { id: 'safety-os', name: '12. Safety OS', focus: 'WHS hazards, near misses, PPE & MSDS/SDS', route: '/equipment-manuals' },
  { id: 'clinical-gov-os', name: '13. Clinical Governance OS', focus: 'SIRS/NDIS clinical triage, medication & reviews', route: '/incidents' },
  { id: 'participant-os', name: '14. Participant OS', focus: '360° care folders, dignity, advocacy & consents', route: '/our-participants' },
  { id: 'intake-os', name: '15. Intake OS', focus: 'Referral, welcome pack, service agreements & onboarding', route: '/intake' },
  { id: 'service-delivery-os', name: '16. Service Delivery OS', focus: 'Frontline shift notes, daily logs & rapid capture', route: '/frontline-hub' },
  { id: 'outcomes-os', name: '17. Outcomes OS', focus: 'Participant goals, progress notes & NDIS outcomes', route: '/goals' },
  { id: 'allied-health-os', name: '18. Allied Health OS', focus: 'OT, Speech, Physio, Psychology, Social Work & EP', route: '/checklists' },
  { id: 'nursing-os', name: '19. Nursing OS', focus: 'Clinical assessments, care plans, obs & medications', route: '/checklists' },
  { id: 'finance-os', name: '20. Finance OS', focus: 'NDIS claims, quotes, receipts, procurement & assets', route: '/invoicing' },
  { id: 'payroll-os', name: '21. Payroll OS', focus: 'Pay runs, SCHADS timesheets, payslips & super', route: '/my-payroll' },
  { id: 'rostering-os', name: '22. Rostering OS', focus: 'Roster planning, open shifts, availability & matching', route: '/rostering' },
  { id: 'knowledge-os', name: '23. Knowledge OS', focus: 'Policies, procedures, handbooks, guides & toolkits', route: '/user-guides' },
  { id: 'document-os', name: '24. Document OS', focus: 'Document Vault, Company Safe, versioning & retention', route: '/documents' },
  { id: 'communications-os', name: '25. Communications OS', focus: 'Emails, SMS/alerts, meetings, broadcasts & diary', route: '/communications' },
  { id: 'emergency-os', name: '26. Emergency Management OS', focus: 'Fire, flood, bushfire, cyclone, drills & continuity', route: '/emergency-response' },
];

export const PARTICIPANT_28_JOURNEY = [
  '1. Referral', '2. Enquiry', '3. Welcome Pack', '4. Participant Handbook',
  '5. Identity Verification', '6. Advocate Management', '7. Guardian Management', '8. Consent Collection',
  '9. Authority To Act', '10. Authority To Share', '11. Funding Verification', '12. Risk Screening',
  '13. Assessments', '14. Support Planning', '15. Care Planning', '16. Goal Planning',
  '17. Service Agreements', '18. Scheduled Reviews', '19. Progress Tracking', '20. Outcome Tracking',
  '21. Service Delivery', '22. Incident Safeguarding', '23. Feedback Capture', '24. Complaints Resolution',
  '25. Reassessments', '26. Plan Renewal', '27. Transition / Discharge', '28. Retention Archive',
];

export const STAFF_30_JOURNEY = [
  '1. Recruitment', '2. Applications', '3. Interviews', '4. Reference Checks',
  '5. Background Checks', '6. NDIS Worker Screening', '7. Police Checks', '8. Blue / WWCC Cards',
  '9. Qualifications', '10. Employment Contracts', '11. Position Descriptions', '12. Welcome Packs',
  '13. Staff Handbooks', '14. Policy Sign-Off', '15. Procedure Sign-Off', '16. Onboarding',
  '17. Induction', '18. Buddy Shifts', '19. Mandatory Training', '20. Competency Assessments',
  '21. Practice Supervision', '22. Performance Reviews', '23. Development Planning', '24. Career Pathways',
  '25. Leadership Development', '26. Rosters & Shifts', '27. Payroll & Payslips', '28. Leave Management',
  '29. Workforce Retention', '30. Exit & Archive Process',
];

const FIVE_MASTER_LAYERS = [
  { id: 'people', step: '01', label: 'PEOPLE', sub: 'Employees, Participants, Contractors, Volunteers & Suppliers', route: '/our-employees' },
  { id: 'work', step: '02', label: 'WORK', sub: 'Rosters, Shifts, Tasks, Goals, Programs, Projects & Fleet', route: '/roster' },
  { id: 'compliance', step: '03', label: 'COMPLIANCE', sub: 'NDIS, Aged Care, WHS, Privacy, Governance & Audits', route: '/compliance' },
  { id: 'evidence', step: '04', label: 'EVIDENCE', sub: 'Document Vault, Company Safe, Signatures, OCR & Version Control', route: '/documents' },
  { id: 'intelligence', step: '05', label: 'INTELLIGENCE', sub: 'Organisational Brain, 12-Agent AI Workforce & Predictive Analytics', route: '/analytics' },
];

export default function OrganisationalOperatingSystemCommand() {
  const [activeMode, setActiveMode] = useState('os26'); // os26 | clinical | journeys | command | twin | manager | executive
  const [loading, setLoading] = useState(false);
  const formatCount = (value) => (typeof value === 'number' ? value.toLocaleString() : '—');
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

  const outcome14Questions = [
    { q: '1. Compliance Status', a: 'Continuous Verification', sub: 'Mapped to NDIS, Aged Care, WHS & Privacy', path: '/compliance' },
    { q: '2. Open Incidents', a: `${formatCount(counts.incidentsOpen)} open`, sub: 'NDIS 24h/5d & SIRS Priority 1/2 tracked', path: '/incidents' },
    { q: '3. Audit Readiness', a: 'Evidence-First Ready', sub: 'Open Auditor Portal & 356 checkpoints', path: '/auditor-portal' },
    { q: '4. Participant Dossiers', a: `${formatCount(counts.participants)} profiles`, sub: '28-stage participant journey & consents', path: '/our-participants' },
    { q: '5. Workforce Dossiers', a: `${formatCount(counts.employees)} staff`, sub: '30-stage staff journey & worker screening', path: '/our-employees' },
    { q: '6. Controlled Documents', a: `${formatCount(counts.documentsTotal)} files`, sub: 'Classified, versioned & linked to profiles', path: '/documents' },
    { q: '7. High / Critical Risks', a: `${formatCount(counts.risksCritical)} high/crit`, sub: `${formatCount(counts.risksTotal)} total risk records`, path: '/risks' },
    { q: '8. Clinical & Medication', a: 'Allied Health & Nursing', sub: 'OT, Speech, Physio, Psych & MAR charts', path: '/checklists' },
    { q: '9. Reviews Due', a: '13 Review Types', sub: 'Auto-prepared participant & staff reviews', path: '/review-due' },
    { q: '10. Overdue Actions', a: `${formatCount(counts.tasksOverdue)} overdue`, sub: `${formatCount(counts.tasksOpen)} active tasks in workflow`, path: '/tasks' },
    { q: '11. Training & LMS', a: `${formatCount(counts.trainingTotal)} modules`, sub: 'Role & competency-based learning matrix', path: '/training' },
    { q: '12. Expiring Credentials', a: `${formatCount(counts.documentsExpiring)} due`, sub: 'Automated alerts & roster screening blocks', path: '/documents' },
    { q: '13. Continuous Improvement', a: `${formatCount(counts.qualityItems)} CAPA items`, sub: 'Problem Resolution OS linked to audits', path: '/quality' },
    { q: '14. Participant Outcomes', a: `${formatCount(counts.goalsTotal)} active goals`, sub: 'Evidence-linked NDIS & Aged Care outcomes', path: '/goals' },
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#F8FAFC] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0A2B6D]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
            <Cpu className="h-3.5 w-3.5 text-[#0072FF]" />
            One Platform · One Source of Truth · One Organisational Brain
          </span>
          <h2 className="mt-1 font-editorial text-lg font-extrabold text-[#0A2B6D] sm:text-xl">
            ComplianceHR Infinity — 26 Operating Systems, Journeys &amp; Organisational Memory
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            Capture Once · Use Everywhere
          </Badge>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={loadLiveOSMetrics}
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* 5 Master Architecture Layers Strip */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {FIVE_MASTER_LAYERS.map((layer) => (
            <Link
              key={layer.id}
              to={layer.route}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 transition hover:border-[#0072FF] hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#0A2B6D] px-2 py-0.5 text-xs font-extrabold text-white">
                  LAYER {layer.step} · {layer.label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#0072FF] transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#0A2B6D]/80">
                {layer.sub}
              </p>
            </Link>
          ))}
        </div>

        {/* Pivot Mode Bar */}
        <div
          role="tablist"
          aria-label="Enterprise Operating System Views"
          className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3"
        >
          {[
            { id: 'os26', label: '26 Operating Systems', icon: Layers },
            { id: 'clinical', label: 'Allied Health, Nursing & AI Workforce', icon: Stethoscope },
            { id: 'journeys', label: 'Participant (28) & Staff (30) Journeys', icon: HeartHandshake },
            { id: 'command', label: '14-Question Command Snapshot', icon: ShieldCheck },
            { id: 'twin', label: 'Organisational Memory & Twin', icon: Cpu },
            { id: 'manager', label: 'Manager Command Pod', icon: Users },
            { id: 'executive', label: 'Board & Executive Assurance', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveMode(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                  active
                    ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF] hover:bg-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: active ? '#00C6FF' : '#0072FF' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================== MODE 1: 26 OPERATING SYSTEMS MATRIX ==================== */}
        {activeMode === 'os26' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  26 Connected Enterprise Operating Systems — One Source of Truth
                </h3>
                <p className="text-xs text-[#0A2B6D]/75">
                  Every operating system shares one evidence layer, one records engine, one search index, one workflow layer, and one organisational memory.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setActiveMode('clinical')}
              >
                <Stethoscope className="mr-1.5 h-3.5 w-3.5 text-[#0072FF]" />
                Open Allied Health, Nursing &amp; 17 Assessments
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {OPERATING_SYSTEMS_26.map((os) => (
                <Link
                  key={os.id}
                  to={os.route}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-[#0072FF] hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#0A2B6D] group-hover:text-[#0072FF]">
                        {os.name}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-xs text-[#0A2B6D]/75 leading-relaxed">{os.focus}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ==================== MODE 2: ALLIED HEALTH, NURSING, 17 ASSESSMENTS, 13 REVIEWS & 12 AI AGENTS ==================== */}
        {activeMode === 'clinical' && <AlliedHealthAndNursingOsSuite />}

        {/* ==================== MODE 3: PARTICIPANT (28 STAGES) & STAFF (30 STAGES) JOURNEYS ==================== */}
        {activeMode === 'journeys' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* 28-Stage Participant Journey */}
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0072FF]">
                    End-to-End Care Continuum
                  </span>
                  <h3 className="text-base font-extrabold text-[#0A2B6D]">
                    Complete Participant Journey (28 Connected Stages)
                  </h3>
                </div>
                <Link
                  to="/our-participants"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0072FF]"
                >
                  <span>Open {formatCount(counts.participants)} Participants</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {PARTICIPANT_28_JOURNEY.map((stage) => (
                  <Link
                    key={stage}
                    to="/our-participants"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0A2B6D] hover:border-[#0072FF]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">{stage}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 30-Stage Staff Journey */}
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
                    End-to-End Workforce Lifecycle
                  </span>
                  <h3 className="text-base font-extrabold text-[#0A2B6D]">
                    Complete Staff Journey (30 Connected Stages)
                  </h3>
                </div>
                <Link
                  to="/our-employees"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0072FF]"
                >
                  <span>Open {formatCount(counts.employees)} Staff</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {STAFF_30_JOURNEY.map((stage) => (
                  <Link
                    key={stage}
                    to="/our-employees"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0A2B6D] hover:border-[#0072FF]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                    <span className="truncate">{stage}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== MODE 4: 14-QUESTION COMMAND SNAPSHOT ==================== */}
        {activeMode === 'command' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-7">
              {outcome14Questions.map((item) => (
                <Link
                  key={item.q}
                  to={item.path}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition hover:border-[#0072FF]"
                >
                  <div className="text-xs font-bold text-[#0A2B6D]">{item.q}</div>
                  <div className="mt-1.5 text-sm font-extrabold text-[#0072FF]">{item.a}</div>
                  <div className="mt-1 text-xs text-[#0A2B6D]/70 leading-snug">{item.sub}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ==================== MODE 5: ORGANISATIONAL MEMORY & DIGITAL TWIN ==================== */}
        {activeMode === 'twin' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: '1. Workforce Memory', metric: `${formatCount(counts.employees)} Staff Profiles`, status: 'Screening, contracts, training & supervision linked', path: '/our-employees' },
                { title: '2. Participant Memory', metric: `${formatCount(counts.participants)} Participants`, status: 'Plans, consents, assessments, goals & reviews linked', path: '/our-participants' },
                { title: '3. Statutory Compliance', metric: '356 Checkpoints', status: 'NDIS, Aged Care, Fair Work, WHS & Privacy mapped', path: '/compliance' },
                { title: '4. Governance & Policies', metric: `${formatCount(counts.policiesTotal)} Policy Records`, status: 'Controlled documents, delegations & board packs', path: '/governance' },
                { title: '5. Quality & Problem Resolution', metric: `${formatCount(counts.qualityItems)} CAPA Records`, status: 'Root-cause investigations & preventive actions', path: '/quality' },
                { title: '6. Risk & Control Memory', metric: `${formatCount(counts.risksTotal)} Risk Records`, status: `${formatCount(counts.risksCritical)} high/critical monitored`, path: '/risks' },
                { title: '7. Incident & SIRS Memory', metric: `${formatCount(counts.incidentsOpen)} Open Incidents`, status: '24-hour & 5-day statutory timelines tracked', path: '/incidents' },
                { title: '8. Continuous Audit Memory', metric: `${formatCount(counts.auditsTotal)} Audits Logged`, status: 'Evidence-first audit packs ready on demand', path: '/auditor-portal' },
              ].map((node) => (
                <Link
                  key={node.title}
                  to={node.path}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-[#0072FF]"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]/75">
                    {node.title}
                  </span>
                  <div className="mt-1.5 font-editorial text-lg font-extrabold text-[#0A2B6D]">
                    {node.metric}
                  </div>
                  <p className="mt-1 text-xs text-[#0A2B6D]/70">{node.status}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ==================== MODE 6: MANAGER COMMAND POD ==================== */}
        {activeMode === 'manager' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Workforce Credentials', value: `${formatCount(counts.employees)} staff · ${formatCount(counts.documentsExpiring)} expiring/expired docs`, route: '/our-employees' },
              { title: 'Participant Folders', value: `${formatCount(counts.participants)} active participant care folders`, route: '/our-participants' },
              { title: 'Risk Register', value: `${formatCount(counts.risksTotal)} total (${formatCount(counts.risksCritical)} High/Critical)`, route: '/risks' },
              { title: 'Incident Clinic', value: `${formatCount(counts.incidentsOpen)} open incidents requiring follow-up`, route: '/incidents' },
              { title: 'Complaints & Feedback', value: `${formatCount(counts.complaintsOpen)} open complaints in resolution`, route: '/feedback' },
              { title: 'Scheduled Reviews', value: '13 review categories tracked on Review Due Board', route: '/review-due' },
              { title: 'Training & Competencies', value: `${formatCount(counts.trainingTotal)} LMS training modules active`, route: '/training' },
              { title: 'Overdue Tasks & Actions', value: `${formatCount(counts.tasksOverdue)} overdue (${formatCount(counts.tasksOpen)} open)`, route: '/tasks' },
            ].map((card) => (
              <Link
                key={card.title}
                to={card.route}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-[#0072FF]"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#0072FF]">{card.title}</div>
                <div className="mt-1.5 text-sm font-extrabold text-[#0A2B6D]">{card.value}</div>
              </Link>
            ))}
          </div>
        )}

        {/* ==================== MODE 7: BOARD & EXECUTIVE ASSURANCE ==================== */}
        {activeMode === 'executive' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Enterprise Compliance', value: 'NDIS, Aged Care, WHS & Fair Work mapped', route: '/compliance' },
              { title: 'Continuous Audit Pack', value: 'One-click external & board assurance packs', route: '/auditor-portal' },
              { title: 'NDIS Provider Governance', value: 'Registration groups, key personnel & conditions', route: '/ndis-portal' },
              { title: 'Delegations & Authority', value: `${formatCount(counts.policiesTotal)} policies & authority declarations`, route: '/governance' },
              { title: 'Strategic & Clinical Risks', value: `${formatCount(counts.risksTotal)} risks (${formatCount(counts.risksCritical)} High/Critical)`, route: '/risks' },
              { title: 'Continuous Improvement', value: `${formatCount(counts.qualityItems)} CAPA & quality initiatives`, route: '/quality' },
              { title: 'Participant Outcomes', value: `${formatCount(counts.goalsTotal)} active participant goals tracked`, route: '/goals' },
              { title: 'Universal Storage & Backup', value: '600–5,000+ document classification & DR vault', route: '/universal-storage' },
            ].map((card) => (
              <Link
                key={card.title}
                to={card.route}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-[#0072FF]"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#5A00D6]">{card.title}</div>
                <div className="mt-1.5 text-sm font-extrabold text-[#0A2B6D]">{card.value}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}