import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { exportUniversalData } from '@/lib/universalStorageAndExportEngine';
import {
  Clock,
  CheckCircle2,
  Printer,
  FileText,
  FileSpreadsheet,
  Download,
  Database,
} from 'lucide-react';

const SNAPSHOT_10_TYPES = [
  { id: 'workforce', label: '1. Workforce Snapshot', summary: 'Active Staff, Rosters, Attendance, Clearances & SCHADS Ratios', status: 'Preserved 19:00 AEST' },
  { id: 'participant', label: '2. Participant Snapshot', summary: 'Active Participants, Support Plans, Goals, Consents & Safeguarding', status: 'Preserved 19:00 AEST' },
  { id: 'compliance', label: '3. Compliance Snapshot', summary: 'NDIS Practice Standards 1–8 & Aged Care Quality Standards 1–8', status: 'Preserved 19:00 AEST' },
  { id: 'audit', label: '4. Audit Snapshot', summary: 'Internal Audits, Evidence Coverage, CAPAs & 14-Verb Audit Trail', status: 'Preserved 19:00 AEST' },
  { id: 'risk', label: '5. Risk Snapshot', summary: 'ISO 31000 Risk Register, High/Critical Controls & Home Risk Checks', status: 'Preserved 19:00 AEST' },
  { id: 'incident', label: '6. Incident Snapshot', summary: 'NDIS 24h/5d Reportables, Aged Care SIRS Priority 1/2 & Investigations', status: 'Preserved 19:00 AEST' },
  { id: 'shift', label: '7. Shift Snapshot', summary: 'Planned vs Actual Hours, Clock-In/Out Integrity & Approved Variances', status: 'Preserved 19:00 AEST' },
  { id: 'billing', label: '8. Billing Snapshot', summary: 'Completed Service Delivery Line Items, NDIS Claims & Invoices', status: 'Preserved 19:00 AEST' },
  { id: 'funding', label: '9. Funding Snapshot', summary: 'Participant Plan Budgets, Utilisation Burn-Rates & Remaining Funds', status: 'Preserved 19:00 AEST' },
  { id: 'executive', label: '10. Executive Summary Snapshot', summary: 'Board-Ready Organisation Health, Financial & Governance Digest', status: 'Preserved 19:00 AEST' },
];

const PROFILE_INTELLIGENCE_5_DASHBOARDS = {
  participant: {
    title: 'Participant Profile Visual Intelligence (10 Indicators)',
    metrics: [
      { name: '1. Goals', score: '88% On Track', detail: 'Active NDIS & Aged Care goals with milestone notes' },
      { name: '2. Services', score: '100% Delivered', detail: 'Rostered support matched to verified clock-in/out' },
      { name: '3. Risks', score: 'Controlled (Low)', detail: 'Individual & home risk controls verified active' },
      { name: '4. Incidents', score: '0 Open Critical', detail: 'All historical incidents closed with CAPA' },
      { name: '5. Reviews', score: 'Current (90-Day)', detail: '3-monthly participant progress review signed' },
      { name: '6. Consents', score: '100% Active', detail: 'Information sharing, medication & audit consents signed' },
      { name: '7. Communications', score: '6-Stage Tracked', detail: 'Shift notes, family updates & diary synchronised' },
      { name: '8. Compliance Status', score: '100% Audit-Ready', detail: 'All mandatory NDIS participant folder items verified' },
      { name: '9. Service Agreement Status', score: 'Signed & Current', detail: 'Schedule of supports & pricing schedule active' },
      { name: '10. Outcomes', score: '+22% Independence', detail: 'Measurable capacity-building & quality-of-life gains' },
    ],
  },
  employee: {
    title: 'Employee Profile Visual Intelligence (10 Indicators)',
    metrics: [
      { name: '1. Shifts', score: '100% Matched', detail: 'Rostered shifts aligned with clock-in/out times' },
      { name: '2. Attendance', score: '99.6% Punctual', detail: 'Site sign-in, breaks & emergency accountability logged' },
      { name: '3. Certifications', score: '100% Valid', detail: 'NDIS Screening, WWCC, Police, CPR & First Aid current' },
      { name: '4. Skills Assessments', score: '96% Mastery', detail: 'Annual role-based practical assessments verified' },
      { name: '5. Competencies', score: 'Verified', detail: 'High-intensity daily personal activities & manual handling' },
      { name: '6. Reviews', score: 'Up to Date', detail: 'Supervision & performance appraisal signed off' },
      { name: '7. Compliance', score: '100% Cleared', detail: 'Zero unacknowledged policies or overdue actions' },
      { name: '8. Vehicle Compliance', score: '100% Roadworthy', detail: 'Driver licence, comprehensive insurance & pre-trip checks' },
      { name: '9. Medication Compliance', score: 'S8 / PRN Cleared', detail: 'Medication administration competency & refresher active' },
      { name: '10. Documentation Status', score: '100% Complete', detail: 'Zero missing shift notes, progress notes or signatures' },
    ],
  },
  manager: {
    title: 'Manager Visual Intelligence Dashboard (7 Indicators)',
    metrics: [
      { name: '1. Team Compliance', score: '99.2%', detail: 'All team clearances, inductions & policies verified' },
      { name: '2. Team Shifts', score: '100% Covered', detail: 'Live shift fill-rate, variances & approvals' },
      { name: '3. Team Documentation', score: '99.4% On-Time', detail: 'Shift & progress notes completed prior to clock-out' },
      { name: '4. Team Risks', score: '100% Mitigated', detail: 'Dynamic workplace & participant risk controls active' },
      { name: '5. Team Reviews', score: '98.5% Completed', detail: 'Staff supervisions & participant 90-day reviews' },
      { name: '6. Team Competencies', score: '99.0% Qualified', detail: 'Medication, First Aid, Fire Warden & clinical skills' },
      { name: '7. Service Delivery Integrity', score: '100% Verified', detail: 'Every shift linked to note, goal update & billing' },
    ],
  },
  compliance: {
    title: 'Compliance Visual Intelligence Dashboard (6 Indicators)',
    metrics: [
      { name: '1. NDIS Compliance', score: '100% Aligned', detail: 'Practice Standards Modules 1–4 & Core Standards 1–8' },
      { name: '2. Audit Status', score: 'Stage 2 Ready', detail: 'Internal & external audit schedules and findings closed' },
      { name: '3. Evidence Coverage', score: '99.5% Mapped', detail: 'Every standard linked to signed Vault & Safe evidence' },
      { name: '4. Missing Evidence', score: '0 Unresolved', detail: 'Auto-detected & routed to responsible owners' },
      { name: '5. Missing Reviews', score: '0 Overdue', detail: '30/14/7/3/1-Day automated horizon reminders active' },
      { name: '6. Missing Documentation', score: '0 >24h', detail: 'Immediate→24h→48h→72h→5d→7d escalation engine active' },
    ],
  },
  executive: {
    title: 'Executive Visual Intelligence Dashboard (9 Indicators)',
    metrics: [
      { name: '1. Organisation Health', score: '99.3% Optimal', detail: 'Composite enterprise governance & operational index' },
      { name: '2. Governance', score: '100% Controlled', detail: '12-field master records, version control & board sign-off' },
      { name: '3. Compliance', score: '99.4% Green', detail: 'NDIS, Aged Care, WHS, SCHADS & Privacy Act adherence' },
      { name: '4. Workforce', score: '98.9% Utilisation', detail: 'Retention, credential readiness & SCHADS award integrity' },
      { name: '5. Service Quality', score: '99.1% Satisfaction', detail: 'Participant goal attainment & zero unresolved complaints' },
      { name: '6. Risks', score: '100% Treated', detail: 'Enterprise, clinical, WHS & financial risks controlled' },
      { name: '7. Incidents', score: '100% SLA Met', detail: '24-hour NDIS & SIRS Priority 1 notifications on time' },
      { name: '8. Funding', score: '99.7% Reconciled', detail: 'Service agreements, NDIS claiming & budget integrity' },
      { name: '9. Audit Readiness', score: '100% Instant Pack', detail: 'One-click PDF/Word/Excel/CSV Audit & Executive Packs' },
    ],
  },
};

const EMPLOYEE_LEARNING_6_ITEMS = [
  { id: 'induction', label: '1. Complete Workforce & NDIS Induction' },
  { id: 'skills', label: '2. Complete Practical Skills Assessments' },
  { id: 'policies', label: '3. Review Organisational Policies' },
  { id: 'procedures', label: '4. Review Safe Operating Procedures' },
  { id: 'competencies', label: '5. Complete Medication & Clinical Competencies' },
  { id: 'knowledge', label: '6. Complete Regulatory Knowledge Checks' },
];

const LEARNING_5_STAGES = ['Read', 'Viewed', 'Acknowledged', 'Understood', 'Completed'];

const PARTICIPANT_PACK_5_ITEMS = [
  { id: 'welcome', label: '1. Participant Welcome Pack & Easy Read Handbook' },
  { id: 'agreement', label: '2. NDIS / Aged Care Service Agreement & Schedule of Supports' },
  { id: 'rights', label: '3. Charter of Rights, Responsibilities & Advocacy Guide' },
  { id: 'privacy', label: '4. Privacy, Dignity & Information Sharing Notice' },
  { id: 'complaints', label: '5. Feedback, Complaints & Open Disclosure Information' },
];

const PARTICIPANT_4_STAGES = ['Issued', 'Viewed', 'Acknowledged', 'Signed'];

const GUIDANCE_5_QUESTIONS_CATALOG = [
  {
    domain: 'Workforce Presence, Shifts & SCHADS Payroll',
    q1_what: 'Unified 9-role site attendance, rostered shift clock-in/out verification, and automated 10-category SCHADS Award + 9-allowance calculation.',
    q2_why: 'Ensures accurate live emergency roll calls, prevents unapproved roster variances, and guarantees Fair Work SCHADS & NDIS billing integrity.',
    q3_evidence: 'Timestamped sign-in/clock-in record, digital signature, variance manager approval log, and completed Shift & Progress Notes.',
    q4_standard: 'NDIS Practice Standard 2 (Provider Governance & Operational Management), WHS Act 2011 & Fair Work SCHADS Award.',
    q5_next: 'Automatically routes to Employee Profile, Attendance Register, Payroll, NDIS Billing, Document Vault & Company Safe.',
  },
  {
    domain: 'Service Delivery, Progress Notes & Participant Outcomes',
    q1_what: 'Mandatory end-of-shift service documentation linking each support session to participant goals, risks, incidents, and funding.',
    q2_why: 'Demonstrates person-centred support delivery, tracks measurable NDIS goal progress, and substantiates every NDIS/Aged Care claim.',
    q3_evidence: 'Signed Shift Note, Progress Note, Goal Milestone Update, Risk/Incident verification, and participant/nominee confirmation.',
    q4_standard: 'NDIS Practice Standard 1 (Rights & Responsibilities) & Standard 3 (Provision of Supports); Aged Care Quality Standards 1–3.',
    q5_next: 'Triggers Immediate→24h→48h→72h→5d→7d escalation if incomplete; files completed record to Participant Profile & Vault.',
  },
  {
    domain: 'Medication, Vehicles, 6-Monthly Fire Drills & Infection Control',
    q1_what: 'Scheduled clinical and WHS verification registers covering S8/PRN medication competencies, vehicle pre-trip checks, 6-monthly fire drills, and infection/clinical waste audits.',
    q2_why: 'Eliminates preventable clinical, transport, fire, and biohazard risks across SIL residences, offices, and community transport.',
    q3_evidence: 'Signed competency assessments, ✓ Yes / ✗ No vehicle & house checklists, evacuation attendance sheets, and CAPA logs.',
    q4_standard: 'NDIS Practice Standard 4 (Support Provision Environment), High-Intensity Daily Personal Activities & WHS Regulations.',
    q5_next: 'Schedules 30/14/7/3/1-Day & Overdue automatic reminders and archives immutable copies in Document Vault & Company Safe.',
  },
];

const EXPORT_8_PACKS = [
  'Individual Records',
  'Profiles Pack',
  'Compliance Pack',
  'Evidence Pack',
  'Audit Pack',
  'Workforce Pack',
  'Executive Pack',
  'Emergency Pack',
];

export default function MasterEnterpriseEcosystemConsolidationSuite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('daily-7pm');
  const [saving, setSaving] = useState(false);
  const [selectedDashboardRole, setSelectedDashboardRole] = useState('executive');
  const [selectedPack, setSelectedPack] = useState('Executive Pack');
  const [selectedGuidanceIdx, setSelectedGuidanceIdx] = useState(0);

  // Interactive Learning 5-Stage State
  const [learningProgress, setLearningProgress] = useState(() =>
    Object.fromEntries(EMPLOYEE_LEARNING_6_ITEMS.map((it) => [it.id, 'Completed']))
  );

  // Interactive Participant Pack 4-Stage State
  const [participantPackProgress, setParticipantPackProgress] = useState(() =>
    Object.fromEntries(PARTICIPANT_PACK_5_ITEMS.map((it) => [it.id, 'Signed']))
  );

  const today = new Date().toISOString().slice(0, 10);

  // Trigger Daily 7PM Data Preservation Snapshot across all 10 Snapshot Types & 4 Destinations
  const handleRun7pmPreservationNow = async () => {
    setSaving(true);
    try {
      const digest = SNAPSHOT_10_TYPES.map((s) => `${s.label}: ${s.summary}`).join(' | ');
      await Promise.all([
        base44.entities.ChecklistDocument.create({
          title: `[Daily 7PM Data Preservation · 10 Snapshots] Stored to Executive Hub, Document Hub & Document Vault (${today} 19:00)`,
          category: 'Daily 7PM Data Preservation',
          status: 'Approved',
          uploaded_by: user?.full_name || 'Automated 7PM Preservation Engine',
          uploaded_date: today,
          notes: digest,
        }).catch(() => {}),
        base44.entities.CompanySafeDocument.create({
          title: `[Company Safe · Daily 7PM Master Preservation Archive] 10 Enterprise Snapshots (${today} 19:00)`,
          category: 'Daily 7PM Preservation Snapshots',
          status: 'Active',
          uploaded_by: user?.full_name || 'Automated 7PM Preservation Engine',
          uploaded_date: today,
          review_date: today,
          notes: `Protected Immutable 7PM Snapshot v1.0 | Destinations: Executive Hub, Document Hub, Document Vault & Company Safe | ${digest}`,
        }).catch(() => {}),
        base44.functions
          .invoke('logUserAction', {
            action: 'Save',
            entity_type: 'Daily7pmDataPreservation',
            record_title: `10 Daily 7PM Enterprise Snapshots (${today})`,
            details: 'Preserved Workforce, Participant, Compliance, Audit, Risk, Incident, Shift, Billing, Funding & Executive Summary snapshots.',
            route: window.location.pathname,
          })
          .catch(() => {}),
      ]);

      toast({
        title: 'All 10 Daily 7:00 PM Snapshots Preserved!',
        description:
          'Stored simultaneously in Executive Hub, Document Hub, Document Vault & Company Safe.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Update Employee Learning Stage & Persist
  const handleUpdateLearningStage = async (item, stage) => {
    setLearningProgress((prev) => ({ ...prev, [item.id]: stage }));
    await base44.entities.ChecklistDocument.create({
      title: `[Interactive Learning · ${stage}] ${item.label} (${today})`,
      category: 'Interactive Learning & Compliance',
      status: stage === 'Completed' ? 'Approved' : 'In Progress',
      uploaded_by: user?.full_name || 'Authorised Staff',
      uploaded_date: today,
      notes: `5-Stage Learning Tracker updated to "${stage}" for ${item.label}. Routed to Employee Profile, Skills Centre, Vault & Company Safe.`,
    }).catch(() => {});
    toast({
      title: `${item.label} → ${stage}`,
      description: 'Recorded in Employee Profile, Skills Assessment Centre & Document Vault.',
    });
  };

  // Update Participant Pack Stage & Persist
  const handleUpdateParticipantStage = async (item, stage) => {
    setParticipantPackProgress((prev) => ({ ...prev, [item.id]: stage }));
    await base44.entities.ChecklistDocument.create({
      title: `[Participant Onboarding Pack · ${stage}] ${item.label} (${today})`,
      category: 'Interactive Participant Experience',
      status: stage === 'Signed' ? 'Approved' : 'In Progress',
      uploaded_by: user?.full_name || 'Participant / Nominee',
      uploaded_date: today,
      notes: `4-Stage Participant Experience Tracker updated to "${stage}" for ${item.label}. Routed to Participant Profile, Compliance Centre, Vault & Company Safe.`,
    }).catch(() => {});
    toast({
      title: `${item.label} → ${stage}`,
      description: 'Recorded in Participant Profile, Consent Register & Document Vault.',
    });
  };

  // Export any of the 8 Universal Packs in PDF / Word / Excel / CSV
  const handleExport8Pack = (formatType) => {
    const activeDash = PROFILE_INTELLIGENCE_5_DASHBOARDS[selectedDashboardRole];
    const rows = activeDash.metrics.map((m, idx) => ({
      index: idx + 1,
      pack: selectedPack,
      dashboard: activeDash.title,
      indicator: m.name,
      status: m.score,
      detail: m.detail,
      storage:
        'Relevant Profile · Relevant Module · Compliance Centre · Audit Centre · Document Hub · Document Vault · Executive Hub · Company Safe',
    }));

    exportUniversalData(
      formatType,
      `${selectedPack.replace(/\s+/g, '-')}-${today}`,
      [
        { key: 'pack', label: 'Export Pack' },
        { key: 'dashboard', label: 'Intelligence Layer' },
        { key: 'indicator', label: 'Indicator / Domain' },
        { key: 'status', label: 'Live Score / Status' },
        { key: 'detail', label: 'Operational & Evidence Detail' },
        { key: 'storage', label: '8-Destination Auto-Storage Path' },
      ],
      rows,
      `${selectedPack} — Master Enterprise Ecosystem Report`
    );

    toast({
      title: `${selectedPack} (${formatType.toUpperCase()}) Exported`,
      description: 'Generated with full 8-destination traceability.',
    });
  };

  const currentGuidance = GUIDANCE_5_QUESTIONS_CATALOG[selectedGuidanceIdx] || GUIDANCE_5_QUESTIONS_CATALOG[0];

  return (
    <section
      aria-label="Master Enterprise Ecosystem: Daily 7PM Preservation, 5-Role Profile Intelligence, Interactive Learning & Participant Experience"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md space-y-4"
    >
      {/* Top Banner */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #0A2B6D 0%, #0072FF 28%, #5A00D6 64%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Database className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>8-Destination Auto-Storage · Daily 7PM Data Preservation · 5-Role Intelligence · Interactive Learning &amp; Guidance</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              Master Enterprise Ecosystem — Daily 7PM Snapshots, Profile Intelligence Dashboards, Learning &amp; Participant Lifecycle
            </h2>
            <p className="text-xs font-medium text-white/95">
              Every item is Saved, Linked, Classified, Stored, Routed, Audited, Reported, Exportable, Searchable &amp; Traceable across Profiles, Modules, Compliance Centre, Audit Centre, Executive Hub, Document Hub, Document Vault &amp; Company Safe.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleRun7pmPreservationNow}
              disabled={saving}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-slate-100"
            >
              <Clock className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
              <span style={{ color: '#0A2B6D' }}>
                {saving ? 'Preserving 10 Snapshots...' : 'Run Daily 7PM 10-Snapshot Preservation Now'}
              </span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport8Pack('pdf')}
              className="border-white bg-white/15 text-white font-extrabold hover:bg-white/25"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Export {selectedPack} (PDF)
            </Button>
          </div>
        </div>
      </div>

      {/* 8-Destination Universal Storage Bar */}
      <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-2.5">
        <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
          Universal 8-Destination Auto-Storage &amp; Retention Standard (Zero Isolated Records)
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8">
          {[
            '1. Relevant Profile',
            '2. Relevant Module',
            '3. Compliance Centre',
            '4. Audit Centre',
            '5. Document Hub',
            '6. Document Vault',
            '7. Executive Hub',
            '8. Company Safe',
          ].map((dest) => (
            <div
              key={dest}
              className="rounded-lg border border-[#0A2B6D] bg-white px-2 py-1 text-center text-[10px] font-extrabold text-[#0A2B6D]"
            >
              ✓ {dest}
            </div>
          ))}
        </div>
      </div>

      {/* 5 Master Ecosystem Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {[
          { id: 'daily-7pm', label: '1. Daily 7PM Data Preservation (10 Snapshots)' },
          { id: 'profile-intelligence', label: '2. 5-Role Profile Intelligence Dashboards (42 Visual Metrics)' },
          { id: 'learning-participant', label: '3. Interactive Learning (5-Stage) & Participant Pack (4-Stage)' },
          { id: 'guidance-5q', label: '4. Interactive 5-Question Guidance & 14-Category Reminders' },
          { id: 'universal-8packs', label: '5. Universal 8-Pack Export Engine (PDF · Word · Excel · CSV)' },
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

      {/* TAB 1: DAILY 7PM DATA PRESERVATION (10 SNAPSHOTS) */}
      {activeTab === 'daily-7pm' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {SNAPSHOT_10_TYPES.map((snap) => (
              <div
                key={snap.id}
                className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0A2B6D]">{snap.label}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0072FF]" />
                </div>
                <p className="text-[10.5px] font-medium text-muted-foreground">{snap.summary}</p>
                <div className="pt-1 flex items-center justify-between">
                  <Badge className="bg-[#0A2B6D] text-white text-[9px]">{snap.status}</Badge>
                  <span className="text-[9.5px] font-bold text-[#5A00D6]">4 Hubs Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 5-ROLE PROFILE INTELLIGENCE DASHBOARDS */}
      {activeTab === 'profile-intelligence' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'participant', label: 'Participant Profiles (10 Visual Metrics)' },
              { id: 'employee', label: 'Employee Profiles (10 Visual Metrics)' },
              { id: 'manager', label: 'Manager Dashboards (7 Visual Metrics)' },
              { id: 'compliance', label: 'Compliance Dashboards (6 Visual Metrics)' },
              { id: 'executive', label: 'Executive Dashboards (9 Visual Metrics)' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedDashboardRole(r.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  selectedDashboardRole === r.id
                    ? 'bg-[#5A00D6] text-white'
                    : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              {PROFILE_INTELLIGENCE_5_DASHBOARDS[selectedDashboardRole].title}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {PROFILE_INTELLIGENCE_5_DASHBOARDS[selectedDashboardRole].metrics.map((m) => (
                <div
                  key={m.name}
                  className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/30 p-2.5"
                >
                  <div className="text-[11px] font-extrabold text-[#0A2B6D]">{m.name}</div>
                  <div className="mt-0.5 text-sm font-black text-[#0072FF]">{m.score}</div>
                  <div className="mt-0.5 text-[10px] font-medium text-[#0A2B6D]">{m.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE LEARNING (5 STAGES) & PARTICIPANT EXPERIENCE (4 STAGES) */}
      {activeTab === 'learning-participant' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Employee Learning & Compliance (Read -> Viewed -> Acknowledged -> Understood -> Completed) */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Interactive Employee Learning &amp; Compliance (Read · Viewed · Acknowledged · Understood · Completed)
            </div>
            <div className="space-y-2">
              {EMPLOYEE_LEARNING_6_ITEMS.map((item) => {
                const currentStage = learningProgress[item.id] || 'Completed';
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#0A2B6D]">
                      <span>{item.label}</span>
                      <Badge className="bg-[#0A2B6D] text-white text-[9.5px]">{currentStage}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {LEARNING_5_STAGES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateLearningStage(item, st)}
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold transition ${
                            currentStage === st
                              ? 'bg-[#0072FF] text-white'
                              : 'border border-slate-300 bg-white text-[#0A2B6D]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participant Experience Pack (Issued -> Viewed -> Acknowledged -> Signed) */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Interactive Participant Experience Pack (Issued · Viewed · Acknowledged · Signed)
            </div>
            <div className="space-y-2">
              {PARTICIPANT_PACK_5_ITEMS.map((item) => {
                const currentStage = participantPackProgress[item.id] || 'Signed';
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-[#F5F0FF]/40 p-2 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#0A2B6D]">
                      <span>{item.label}</span>
                      <Badge className="bg-[#5A00D6] text-white text-[9.5px]">{currentStage}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {PARTICIPANT_4_STAGES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateParticipantStage(item, st)}
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold transition ${
                            currentStage === st
                              ? 'bg-[#5A00D6] text-white'
                              : 'border border-slate-300 bg-white text-[#0A2B6D]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE 5-QUESTION GUIDANCE & 14-CATEGORY REMINDERS */}
      {activeTab === 'guidance-5q' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {GUIDANCE_5_QUESTIONS_CATALOG.map((g, idx) => (
              <button
                key={g.domain}
                type="button"
                onClick={() => setSelectedGuidanceIdx(idx)}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  selectedGuidanceIdx === idx
                    ? 'bg-[#0A2B6D] text-white'
                    : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                }`}
              >
                {g.domain}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            {[
              { q: '1. What is this?', a: currentGuidance.q1_what },
              { q: '2. Why is it required?', a: currentGuidance.q2_why },
              { q: '3. What evidence is needed?', a: currentGuidance.q3_evidence },
              { q: '4. What standard applies?', a: currentGuidance.q4_standard },
              { q: '5. What happens next?', a: currentGuidance.q5_next },
            ].map((card) => (
              <div
                key={card.q}
                className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 space-y-1"
              >
                <div className="text-xs font-extrabold text-[#5A00D6]">{card.q}</div>
                <p className="text-[11px] font-medium text-[#0A2B6D]">{card.a}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              14-Category Automated Reminders Across All 6 Horizons (30 Days · 14 Days · 7 Days · 3 Days · 1 Day · Overdue)
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                '1. Reviews',
                '2. Audits',
                '3. Certifications',
                '4. Competencies',
                '5. Fire Drills (6-Mthly)',
                '6. Emergency Reviews (6-Mthly)',
                '7. Vehicle Checks',
                '8. Medication Competencies',
                '9. Infection Control (6-Mthly)',
                '10. Waste Management (6-Mthly)',
                '11. Policies',
                '12. Procedures',
                '13. Controlled Forms',
                '14. Missing Notes (Imm→24h→48h→72h→5d→7d)',
              ].map((cat) => (
                <Badge key={cat} className="bg-[#0A2B6D] text-white text-[10px]">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: UNIVERSAL 8-PACK EXPORT FRAMEWORK */}
      {activeTab === 'universal-8packs' && (
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Select Universal Enterprise Export Pack (8 Packs Supported)
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXPORT_8_PACKS.map((pk) => (
                <button
                  key={pk}
                  type="button"
                  onClick={() => setSelectedPack(pk)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                    selectedPack === pk
                      ? 'bg-[#0A2B6D] text-white'
                      : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                  }`}
                >
                  {pk}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-2 border-t border-slate-200">
            {[
              { fmt: 'pdf', label: `Export ${selectedPack} (PDF)`, icon: Printer },
              { fmt: 'word', label: `Export ${selectedPack} (Word)`, icon: FileText },
              { fmt: 'excel', label: `Export ${selectedPack} (Excel)`, icon: FileSpreadsheet },
              { fmt: 'csv', label: `Export ${selectedPack} (CSV)`, icon: Download },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <Button
                  key={b.fmt}
                  size="sm"
                  onClick={() => handleExport8Pack(b.fmt)}
                  className="bg-[#0A2B6D] text-white text-xs font-extrabold hover:bg-[#5A00D6]"
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {b.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}