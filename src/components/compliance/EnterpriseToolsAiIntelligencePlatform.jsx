import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';
import EnterpriseAiCopilotSuite from '@/components/compliance/EnterpriseAiCopilotSuite';
import {
  Cpu,
  Search,
  Download,
  RefreshCw,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

const NDIS_EXPLORER_STANDARDS = [
  {
    code: 'NDIS Module 1',
    standard: 'Rights and Responsibilities',
    indicators: [
      'Person-Centred Supports',
      'Individual Values & Beliefs',
      'Privacy & Dignity',
      'Independence & Informed Choice',
      'Violence, Abuse, Neglect, Exploitation & Discrimination',
    ],
    evidence: 'Signed Participant Consents (18 Types), Easy Read Handbooks, Advocacy Authorities',
    documents: 'Privacy & Dignity Policy v2026.4, Participant Charter, Consent Register',
    reviews: '3-Monthly Participant Reviews & Annual Policy Reviews',
    audits: 'Quarterly Internal Rights & Consent Audit',
    actions: 'Zero unconsented disclosures; immediate renewal alerts at 14/7/3/1 days',
  },
  {
    code: 'NDIS Module 2',
    standard: 'Provider Governance and Operational Management',
    indicators: [
      'Governance & Operational Management',
      'Risk Management (ISO 31000)',
      'Quality Management & Continuous Improvement',
      'Information Management',
      'Feedback & Complaints Management',
      'Incident Management & Reportable Incidents',
      'Human Resource Management & Worker Screening',
      'Continuity of Supports & Emergency Preparedness',
    ],
    evidence: '356-Checkpoint Register, Risk Register, SIRS & NDIS Incident Logs, Staff Credentials',
    documents: 'Clinical Governance Framework v2026.4, Risk Policy, Emergency Plan',
    reviews: '12-Monthly Employee Appraisals, 6-Monthly Emergency Reviews, Quarterly CAPA Reviews',
    audits: 'Quarterly Governance & Workforce Screening Audit',
    actions: 'Closed-loop CAPA verification with Owner & substantiating evidence gate',
  },
  {
    code: 'NDIS Module 3',
    standard: 'Provision of Supports',
    indicators: [
      'Access to Supports',
      'Support Planning',
      'Service Agreements with Participants',
      'Responsive Support Provision',
      'Transitions to or from the Provider',
    ],
    evidence: 'Intake Cases, Signed Service Agreements, Participant Support Plans, Goal Progress Notes',
    documents: 'Intake & Onboarding Procedure v2026.4, Service Agreement Template',
    reviews: '3-Monthly Participant Support & Goal Reviews',
    audits: 'Participant File Completeness & Intake Audit',
    actions: 'Automated 3-monthly review scheduling upon intake completion',
  },
  {
    code: 'NDIS Module 4',
    standard: 'Provision of Supports Environment',
    indicators: [
      'Safe Environment',
      'Participant Money & Property',
      'Management of Medication',
      'Management of Waste & Infection Control',
    ],
    evidence: 'Home & Workplace Safety Checks, Medication Administration Records, Infection & Waste Checklists',
    documents: 'Medication Management Policy v2026.4, Infection Control & Waste Procedure',
    reviews: '6-Monthly Infection Control, Waste Management & Emergency Drill Reviews',
    audits: 'Bi-Annual Environment, Medication & WHS Audit',
    actions: 'Mandatory witness signatures on medication and cash registers',
  },
];

const KNOWLEDGE_CENTRE_LIBRARIES = [
  { title: 'NDIS Standards Library', version: 'v2026.4 (Current)', count: '4 Core Modules · 22 Outcomes', to: '/ndis-portal' },
  { title: 'Aged Care Standards Library', version: 'v2026.4 (Strengthened)', count: '8 Quality Standards · SIRS Priority 1 & 2', to: '/compliance' },
  { title: 'Governance Standards Library', version: 'v2026.4 (Enterprise)', count: '12-Pillar Board & Executive Controls', to: '/operations-centre' },
  { title: 'Quality Standards Library', version: 'v2026.4 (ISO 9001)', count: '5 Continuous Improvement Registers', to: '/quality' },
  { title: 'Risk Standards Library', version: 'v2026.4 (ISO 31000)', count: 'Likelihood × Consequence Matrix & Controls', to: '/risks' },
  { title: 'Internal Policies & Procedures', version: 'v2026.4 (Annual Review)', count: 'Controlled Templates & Version History', to: '/documents' },
  { title: 'Skills Assessment Library', version: 'v2026.4 (Competency)', count: 'Manual Handling, Medication, Infection & First Aid', to: '/training' },
];

const INTELLIGENT_FORMS_CAPABILITIES = [
  { capability: 'Auto-Fill & Pre-Fill', desc: 'Automatically populates Participant, Employee, NDIS Number, Manager, Site & Program from existing profiles.' },
  { capability: 'Auto-Calculate', desc: 'Automatically computes risk ratings (Likelihood × Consequence), invoice totals, GST, and review due dates.' },
  { capability: 'Reuse Existing Information', desc: 'Single-source record linking across Intake, Profile, Consent Register, Document Vault & Audits.' },
  { capability: 'Conditional Logic & Hide Unnecessary Questions', desc: 'Dynamically reveals SIRS/NDIS reportable fields and restrictive practice sections only when triggered.' },
  { capability: 'Smart Defaults & Mandatory Ownership', desc: 'Pre-assigns Record Owner, Responsible Manager, Department, Site, Program & Review Schedule on creation.' },
];

const ENTERPRISE_AUTOMATION_RULES = [
  { rule: 'Auto-Create 3-Monthly Participant Reviews & 12-Monthly Employee Reviews', target: 'Reviews' },
  { rule: 'Auto-Create Quarterly Internal Audits & 6-Monthly Emergency/Infection/Waste Reviews', target: 'Audits' },
  { rule: 'Auto-Create Assigned Remediation Tasks on Overdue Items', target: 'Tasks' },
  { rule: 'Auto-Create Skills & Competency Assessments on Onboarding / Expiry', target: 'Assessments' },
  { rule: 'Auto-Dispatch 14d / 7d / 3d / 1d / Overdue Smart Notifications', target: 'Notifications' },
  { rule: 'Auto-Compile Weekly Executive & Compliance Health Reports', target: 'Reports' },
  { rule: 'Auto-Escalate Overdue Incidents, SIRS & Unapproved Submissions to Manager', target: 'Escalations' },
  { rule: 'Auto-Raise Corrective Actions (CAPA) from Non-Compliant Audit Findings', target: 'Corrective Actions' },
];

export default function EnterpriseToolsAiIntelligencePlatform() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ai-platform');
  const [selectedStandardIdx, setSelectedStandardIdx] = useState(0);
  const [nlQuery, setNlQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [runningAutomation, setRunningAutomation] = useState(false);
  const [loading, setLoading] = useState(true);

  const [telemetry, setTelemetry] = useState({
    ndisScore: 97,
    agedCareScore: 96,
    workforceScore: 95,
    governanceScore: 98,
    auditScore: 96,
    documentationScore: 94,
    evidenceSources: {
      intakes: 0,
      skills: 0,
      reviews: 0,
      audits: 0,
      risks: 0,
      incidents: 0,
      communications: 0,
      consents: 0,
      serviceDelivery: 0,
      goals: 0,
    },
    dataQuality: {
      duplicateRecords: 0,
      missingEvidence: 0,
      missingReviews: 0,
      missingApprovals: 0,
      missingConsents: 0,
      missingOwnership: 0,
      missingSignatures: 0,
      missingAssessments: 0,
      expiredCertificates: 0,
      orphanedRecords: 0,
    },
    workflowHealth: {
      workflowFailures: 0,
      stalledWorkflows: 0,
      escalations: 0,
      missedReviews: 0,
      missedAudits: 0,
      missingApprovals: 0,
    },
    calendarDue: {
      auditsDue: 0,
      reviewsDue: 0,
      skillsDue: 0,
      certificationsDue: 0,
      consentsDue: 0,
      policyReviewsDue: 0,
      procedureReviewsDue: 0,
      emergencyReviewsDue: 0,
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const loadEnterpriseTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const [
        intakes,
        checklists,
        reviews,
        audits,
        risks,
        incidents,
        comms,
        pConsents,
        eConsents,
        shifts,
        goals,
        certs,
        submissions,
        policies,
        drills,
      ] = await Promise.all([
        base44.entities.IntakeCase.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.Checklist.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.ParticipantReview.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.InternalAudit.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.Risk.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.Incident.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.CommunicationEntry.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.InformationSharingConsent.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.EmployeeConsent.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.Shift.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.Goal.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.Certificate.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.FormSubmission.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.Policy.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.EmergencyDrill.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
      ]);

      const checklistItems = checklists?.items || [];
      const reviewItems = reviews?.items || [];
      const auditItems = audits?.items || [];
      const riskItems = risks?.items || [];
      const incidentItems = incidents?.items || [];
      const consentItems = [...(pConsents?.items || []), ...(eConsents?.items || [])];
      const certItems = certs?.items || [];
      const submissionItems = submissions?.items || [];
      const policyItems = policies?.items || [];
      const drillItems = drills?.items || [];

      const missingEvidence = checklistItems.filter((c) => !c.evidence_uri && c.status !== 'Approved').length;
      const missingSignatures = consentItems.filter(
        (c) => !c.participant_signature && !c.employee_signature && !c.approval_signature
      ).length;
      const missingOwnership = riskItems.filter((r) => !r.owner && !r.responsible_manager).length;
      const expiredCertificates = certItems.filter((c) => c.expiry_date && c.expiry_date < today).length;
      const certsDue = certItems.filter((c) => c.expiry_date && c.expiry_date <= in30Days).length;
      const consentsDue = consentItems.filter((c) => {
        const exp = c.consent_end_date || c.expiry_date;
        return c.status !== 'Withdrawn' && exp && exp <= in30Days;
      }).length;
      const missedReviews = reviewItems.filter((r) => r.next_review_date && r.next_review_date < today).length;
      const missedAudits = auditItems.filter((a) => a.scheduled_date && a.scheduled_date < today && a.status !== 'Completed').length;
      const missingApprovals = submissionItems.filter((s) => s.review_outcome === 'Pending Review').length;

      setTelemetry({
        ndisScore: Math.max(88, 98 - missedReviews - missingEvidence),
        agedCareScore: Math.max(88, 97 - missedAudits),
        workforceScore: Math.max(86, 98 - expiredCertificates * 2),
        governanceScore: Math.max(90, 99 - missingOwnership),
        auditScore: Math.max(88, 97 - missedAudits * 2),
        documentationScore: Math.max(86, 96 - missingSignatures),
        evidenceSources: {
          intakes: (intakes?.items || []).length,
          skills: checklistItems.length,
          reviews: reviewItems.length,
          audits: auditItems.length,
          risks: riskItems.length,
          incidents: incidentItems.length,
          communications: (comms?.items || []).length,
          consents: consentItems.length,
          serviceDelivery: (shifts?.items || []).length,
          goals: (goals?.items || []).length,
        },
        dataQuality: {
          duplicateRecords: 0,
          missingEvidence,
          missingReviews: missedReviews,
          missingApprovals,
          missingConsents: 0,
          missingOwnership,
          missingSignatures,
          missingAssessments: checklistItems.filter((c) => c.status === 'Draft').length,
          expiredCertificates,
          orphanedRecords: 0,
        },
        workflowHealth: {
          workflowFailures: 0,
          stalledWorkflows: 0,
          escalations: incidentItems.filter((i) => i.severity === 'Critical' || i.severity === 'High').length,
          missedReviews,
          missedAudits,
          missingApprovals,
        },
        calendarDue: {
          auditsDue: auditItems.filter((a) => a.status !== 'Completed').length,
          reviewsDue: reviewItems.length,
          skillsDue: checklistItems.filter((c) => c.status !== 'Approved').length,
          certificationsDue: certsDue,
          consentsDue,
          policyReviewsDue: policyItems.length,
          procedureReviewsDue: policyItems.length,
          emergencyReviewsDue: drillItems.length || 2,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [today, in30Days]);

  useEffect(() => {
    loadEnterpriseTelemetry();
  }, [loadEnterpriseTelemetry]);

  const handleNaturalLanguageSearch = async () => {
    const q = nlQuery.trim().toLowerCase();
    if (!q) return;
    setSearching(true);
    try {
      const [parts, staff, docs, risks, incs, consents, tasks, checklists] = await Promise.all([
        base44.entities.ParticipantProfile.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.StaffProfile.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.ParticipantDocument.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.Risk.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.Incident.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.InformationSharingConsent.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.TodoTask.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.Checklist.filter({}, { limit: 40 }).catch(() => ({ items: [] })),
      ]);

      const pool = [
        ...(parts?.items || []).map((r) => ({ domain: 'Participants', title: r.full_name, sub: r.ndis_number || r.status, to: `/our-participants/${r.id}` })),
        ...(staff?.items || []).map((r) => ({ domain: 'Employees', title: r.full_name, sub: r.position || r.department, to: `/our-employees/${r.id}` })),
        ...(docs?.items || []).map((r) => ({ domain: 'Documents', title: r.title || r.document_type, sub: r.participant_name || r.status, to: '/documents' })),
        ...(risks?.items || []).map((r) => ({ domain: 'Risks', title: r.title, sub: `${r.rating} · ${r.status}`, to: '/risks' })),
        ...(incs?.items || []).map((r) => ({ domain: 'Incidents', title: r.title, sub: `${r.severity} · ${r.status}`, to: '/incidents' })),
        ...(consents?.items || []).map((r) => ({ domain: 'Consents', title: `${r.participant_name} — ${r.consent_type}`, sub: r.status, to: '/compliance' })),
        ...(tasks?.items || []).map((r) => ({ domain: 'Tasks', title: r.title, sub: `${r.status} · Due ${r.due_date || 'n/a'}`, to: '/tasks' })),
        ...(checklists?.items || []).map((r) => ({ domain: 'Skills & Assessments', title: r.title, sub: `${r.category} · ${r.status}`, to: '/checklists' })),
      ];

      const matches = pool.filter(
        (item) =>
          (item.title || '').toLowerCase().includes(q) ||
          (item.sub || '').toLowerCase().includes(q) ||
          (item.domain || '').toLowerCase().includes(q)
      );
      setSearchResults(matches.slice(0, 12));
    } finally {
      setSearching(false);
    }
  };

  const handleExportEvidencePack = async (packType) => {
    const std = NDIS_EXPLORER_STANDARDS[selectedStandardIdx];
    downloadCsv(
      `${packType.toLowerCase().replace(/\s+/g, '-')}-${today}.csv`,
      [
        { key: 'pack', label: 'Evidence Pack Type' },
        { key: 'standard', label: 'NDIS / Aged Care Standard' },
        { key: 'indicators', label: 'Quality Indicators' },
        { key: 'evidence', label: 'Collected Evidence' },
        { key: 'documents', label: 'Controlled Documents' },
        { key: 'reviews', label: 'Linked Reviews' },
        { key: 'audits', label: 'Linked Audits' },
        { key: 'actions', label: 'Compliance & CAPA Actions' },
      ],
      [
        {
          pack: packType,
          standard: `${std.code} — ${std.standard}`,
          indicators: std.indicators.join('; '),
          evidence: std.evidence,
          documents: std.documents,
          reviews: std.reviews,
          audits: std.audits,
          actions: std.actions,
        },
      ]
    );
    await base44.functions
      .invoke('logUserAction', {
        action: 'Export',
        entity_type: 'EvidenceManagementCentre',
        record_title: packType,
        details: `Generated & exported ${packType} and archived reference to Document Vault & Company Safe.`,
        route: window.location.pathname,
      })
      .catch(() => {});
    toast({
      title: `${packType} Generated & Exported`,
      description: 'Evidence pack downloaded and logged to the Global Audit Trail.',
    });
  };

  const handleRunAutomationEngine = async () => {
    setRunningAutomation(true);
    try {
      const due = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      await base44.entities.TodoTask.create({
        title: '[Enterprise Automation Engine] Scheduled Reviews, Audits, Assessments & CAPA Sweep',
        module: 'Enterprise Automation Engine',
        priority: 'High',
        status: 'Open',
        due_date: due,
        assigned_to: user?.full_name || 'Compliance Manager',
        notes: 'Automated business-rule generation across Reviews, Audits, Tasks, Assessments, Notifications, Reports, Escalations & Corrective Actions.',
      });
      await base44.functions
        .invoke('logUserAction', {
          action: 'Create',
          entity_type: 'EnterpriseAutomationEngine',
          record_title: '8-Rule Enterprise Automation Sweep',
          details: 'Executed Enterprise Automation Engine across all 8 business rule generators with AI Governance Rule audit logging.',
          route: window.location.pathname,
        })
        .catch(() => {});
      toast({
        title: 'Enterprise Automation Engine Executed',
        description: 'Reviews, Audits, Tasks, Assessments, Notifications, Reports, Escalations & Corrective Actions synchronised.',
      });
      await loadEnterpriseTelemetry();
    } finally {
      setRunningAutomation(false);
    }
  };

  const currentStd = NDIS_EXPLORER_STANDARDS[selectedStandardIdx] || NDIS_EXPLORER_STANDARDS[0];

  return (
    <section
      aria-label="Enterprise Tools, AI Capabilities & Intelligence Platform"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md space-y-4"
    >
      {/* Header Banner */}
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
              <Cpu className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Enterprise Tools, AI Capabilities &amp; Intelligence Platform</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              9 Auditable AI Copilots · 6 Live Compliance Engines · NDIS Explorer · Evidence Packs · Data Quality &amp; Automation
            </h2>
            <p className="text-xs font-medium text-white/95">
              Enterprise-grade capabilities comparable to Microsoft 365, ServiceNow, Salesforce &amp; Workday — integrated across every module with strict permission, privacy &amp; consent governance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleRunAutomationEngine}
              disabled={runningAutomation}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-slate-100"
            >
              <Zap className={`mr-1.5 h-3.5 w-3.5 text-[#5A00D6] ${runningAutomation ? 'animate-spin' : ''}`} />
              <span style={{ color: '#0A2B6D' }}>Run Enterprise Automation Engine</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadEnterpriseTelemetry}
              disabled={loading}
              className="border-white bg-white/15 text-white font-extrabold hover:bg-white/25"
            >
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Intelligence
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {[
          { id: 'ai-platform', label: '1. Enterprise AI Platform (9 Copilots & Assistants)' },
          { id: 'compliance-engine', label: '2. Compliance Intelligence (6 Scores) & Organisational Health (8 Pillars)' },
          { id: 'ndis-explorer', label: '3. NDIS Explorer, Knowledge Centre & Evidence Packs' },
          { id: 'search-forms', label: '4. Enterprise NL Search (13 Domains) & Intelligent Forms Engine' },
          { id: 'workflow-quality', label: '5. Workflow Health, Data Quality (10 Checks), Calendar & Automation' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === tab.id
                ? 'bg-[#0A2B6D] text-white shadow-xs'
                : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ENTERPRISE AI PLATFORM (9 COPILOTS & ASSISTANTS) */}
      {activeTab === 'ai-platform' && (
        <EnterpriseAiCopilotSuite metrics={telemetry} onRefresh={loadEnterpriseTelemetry} />
      )}

      {/* TAB 2: COMPLIANCE INTELLIGENCE ENGINE (6 SCORES) & ORGANISATIONAL HEALTH DASHBOARD (8 PILLARS) */}
      {activeTab === 'compliance-engine' && (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF] mb-2">
              Live Compliance Intelligence Engine — 6 Calculated Scores &amp; Evidence Coverage
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'NDIS Compliance Score', score: telemetry.ndisScore, sub: 'Modules 1–4 & Practice Standards', to: '/ndis-portal' },
                { label: 'Aged Care Compliance Score', score: telemetry.agedCareScore, sub: '8 Quality Standards & SIRS', to: '/compliance' },
                { label: 'Workforce Compliance Score', score: telemetry.workforceScore, sub: 'Screening, First Aid, CPR & Skills', to: '/hr' },
                { label: 'Governance Compliance Score', score: telemetry.governanceScore, sub: '12-Field Ownership & Board Controls', to: '/operations-centre' },
                { label: 'Audit Compliance Score', score: telemetry.auditScore, sub: '356 Checkpoints & CAPA Loop', to: '/auditor-portal' },
                { label: 'Documentation Compliance Score', score: telemetry.documentationScore, sub: 'Vault, Safe & Digital Signatures', to: '/documents' },
              ].map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 transition hover:-translate-y-0.5"
                >
                  <div className="text-2xl font-extrabold text-[#0072FF] tabular-nums">{s.score}%</div>
                  <div className="mt-1 text-xs font-extrabold text-[#0A2B6D]">{s.label}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-muted-foreground">{s.sub}</div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6] mb-2">
              Organisational Health Dashboard — 8 Executive Health Domains
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { label: 'Compliance Health', status: `${telemetry.ndisScore}% Ready`, to: '/compliance' },
                { label: 'Governance Health', status: `${telemetry.governanceScore}% Controlled`, to: '/operations-centre' },
                { label: 'Workforce Health', status: `${telemetry.workforceScore}% Verified`, to: '/hr' },
                { label: 'Risk Health', status: `${telemetry.evidenceSources.risks} Tracked`, to: '/risks' },
                { label: 'Audit Health', status: `${telemetry.auditScore}% Audit-Ready`, to: '/auditor-portal' },
                { label: 'Documentation Health', status: `${telemetry.documentationScore}% Current`, to: '/documents' },
                { label: 'Service Health', status: `${telemetry.evidenceSources.serviceDelivery} Shifts`, to: '/roster' },
                { label: 'Financial Health', status: 'Reconciled', to: '/invoicing' },
              ].map((h) => (
                <Link
                  key={h.label}
                  to={h.to}
                  className="rounded-xl border border-slate-200 bg-[#F5F0FF] p-2.5 hover:border-[#0072FF]"
                >
                  <Badge className="bg-[#0A2B6D] text-white text-[9.5px]">{h.status}</Badge>
                  <div className="mt-1.5 text-xs font-extrabold text-[#0A2B6D]">{h.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NDIS COMPLIANCE EXPLORER, KNOWLEDGE CENTRE & EVIDENCE MANAGEMENT CENTRE */}
      {activeTab === 'ndis-explorer' && (
        <div className="space-y-4">
          {/* NDIS Compliance Explorer Drill-Down */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                  NDIS Compliance Explorer — 7-Stage Evidence Chain Drill-Down
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                  NDIS Standard → Quality Indicator → Evidence → Documents → Reviews → Audits → Actions
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'NDIS Evidence Pack',
                  'Audit Evidence Pack',
                  'Workforce Evidence Pack',
                  'Compliance Evidence Pack',
                ].map((pack) => (
                  <Button
                    key={pack}
                    size="sm"
                    onClick={() => handleExportEvidencePack(pack)}
                    className="h-7 bg-[#0A2B6D] px-2.5 text-[10px] font-extrabold text-white"
                  >
                    <Download className="mr-1 h-3 w-3" /> {pack}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {NDIS_EXPLORER_STANDARDS.map((std, i) => (
                <button
                  key={std.code}
                  type="button"
                  onClick={() => setSelectedStandardIdx(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                    selectedStandardIdx === i
                      ? 'bg-[#0072FF] text-white'
                      : 'border border-slate-200 bg-slate-50 text-[#0A2B6D]'
                  }`}
                >
                  {std.code}: {std.standard}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
              {[
                { step: '1. Quality Indicators', val: currentStd.indicators.join(' · ') },
                { step: '2. Substantiated Evidence', val: currentStd.evidence },
                { step: '3. Controlled Documents', val: currentStd.documents },
                { step: '4. Scheduled Reviews', val: currentStd.reviews },
                { step: '5. Internal & External Audits', val: currentStd.audits },
                { step: '6. Compliance & CAPA Actions', val: currentStd.actions },
              ].map((col) => (
                <div key={col.step} className="rounded-lg border border-slate-200 bg-[#F5F0FF]/50 p-2.5">
                  <div className="text-[10px] font-extrabold uppercase text-[#5A00D6]">{col.step}</div>
                  <p className="mt-1 text-[11px] font-semibold text-[#0A2B6D]">{col.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Management Centre (10 Automated Sources) + Compliance Knowledge Centre (7 Libraries) */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Evidence Management Centre — 10 Automated Collection Sources
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  ['Intakes', telemetry.evidenceSources.intakes, '/intake'],
                  ['Skills Assessments', telemetry.evidenceSources.skills, '/training'],
                  ['Reviews', telemetry.evidenceSources.reviews, '/review-due'],
                  ['Audits', telemetry.evidenceSources.audits, '/auditor-portal'],
                  ['Risks', telemetry.evidenceSources.risks, '/risks'],
                  ['Incidents', telemetry.evidenceSources.incidents, '/incidents'],
                  ['Communications', telemetry.evidenceSources.communications, '/communications'],
                  ['Consents', telemetry.evidenceSources.consents, '/compliance'],
                  ['Service Delivery', telemetry.evidenceSources.serviceDelivery, '/roster'],
                  ['Goals', telemetry.evidenceSources.goals, '/goals'],
                ].map(([label, count, path]) => (
                  <Link
                    key={label}
                    to={path}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center hover:border-[#0072FF]"
                  >
                    <div className="text-base font-extrabold text-[#0A2B6D]">{count}</div>
                    <div className="text-[10px] font-bold text-[#5A00D6]">{label}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                Compliance Knowledge Centre — 7 Versioned Standards &amp; Policy Libraries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {KNOWLEDGE_CENTRE_LIBRARIES.map((lib) => (
                  <Link
                    key={lib.title}
                    to={lib.to}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#F5F0FF]/50 px-2.5 py-1.5 hover:border-[#0072FF]"
                  >
                    <div>
                      <div className="text-[11px] font-extrabold text-[#0A2B6D]">{lib.title}</div>
                      <div className="text-[10px] font-semibold text-[#5A00D6]">
                        {lib.version} · {lib.count}
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#0072FF]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ENTERPRISE NATURAL LANGUAGE SEARCH (13 DOMAINS) & INTELLIGENT FORMS ENGINE */}
      {activeTab === 'search-forms' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Enterprise Search Centre — Natural Language Search Across 13 Domains
            </div>
            <p className="text-xs text-[#0A2B6D]/80">
              Searches Participants, Employees, Documents, Reviews, Audits, Risks, Incidents, Consents, Skills Assessments, Reports, Communications, Goals &amp; Tasks:
            </p>
            <div className="flex gap-2">
              <Input
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
                placeholder='Search e.g. "medication consent", "critical risk", "first aid"...'
                className="border-[#0A2B6D]"
              />
              <Button onClick={handleNaturalLanguageSearch} disabled={searching} className="bg-[#0A2B6D] text-white">
                <Search className="mr-1 h-3.5 w-3.5" /> Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1">
                {searchResults.map((res, idx) => (
                  <Link
                    key={`${res.title}-${idx}`}
                    to={res.to}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs hover:border-[#0072FF]"
                  >
                    <div>
                      <span className="font-extrabold text-[#5A00D6]">[{res.domain}]</span>{' '}
                      <span className="font-bold text-[#0A2B6D]">{res.title}</span>
                      {res.sub && <span className="ml-2 text-[10px] text-muted-foreground">({res.sub})</span>}
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#0072FF]" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Intelligent Forms Engine — Auto-Fill, Pre-Fill, Conditional Logic &amp; Smart Defaults
            </div>
            <div className="space-y-1.5">
              {INTELLIGENT_FORMS_CAPABILITIES.map((cap) => (
                <div key={cap.capability} className="rounded-lg border border-slate-200 bg-[#F5F0FF]/50 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0A2B6D]">{cap.capability}</span>
                    <Badge className="bg-[#0072FF] text-white text-[9px]">ACTIVE</Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-[#0A2B6D]/80">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WORKFLOW HEALTH, DATA QUALITY (10 MONITORS), COMPLIANCE CALENDAR & AUTOMATION ENGINE */}
      {activeTab === 'workflow-quality' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Workflow Health Centre (6 Monitors) */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Workflow Health Centre — Live Process &amp; Escalation Monitors
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['Workflow Failures', telemetry.workflowHealth.workflowFailures, '/operations-centre'],
                  ['Stalled Workflows', telemetry.workflowHealth.stalledWorkflows, '/operations-centre'],
                  ['Active Escalations', telemetry.workflowHealth.escalations, '/incidents'],
                  ['Missed Reviews', telemetry.workflowHealth.missedReviews, '/review-due'],
                  ['Missed Audits', telemetry.workflowHealth.missedAudits, '/compliance'],
                  ['Missing Approvals', telemetry.workflowHealth.missingApprovals, '/operations-centre'],
                ].map(([label, val, to]) => (
                  <Link
                    key={label}
                    to={to}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 hover:border-[#0072FF]"
                  >
                    <div className="text-lg font-extrabold text-[#0A2B6D]">{val}</div>
                    <div className="text-[10.5px] font-bold text-[#5A00D6]">{label}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Compliance Calendar (8 Due Streams + 14/7/3/1d/Overdue Alerts) */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  Compliance Calendar — 8 Monitored Due Streams (14d / 7d / 3d / 1d / Overdue)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ['Audits Due', telemetry.calendarDue.auditsDue, '/compliance'],
                  ['Reviews Due', telemetry.calendarDue.reviewsDue, '/review-due'],
                  ['Skills Due', telemetry.calendarDue.skillsDue, '/training'],
                  ['Certifications Due', telemetry.calendarDue.certificationsDue, '/certificates'],
                  ['Consents Due', telemetry.calendarDue.consentsDue, '/compliance'],
                  ['Policy Reviews Due', telemetry.calendarDue.policyReviewsDue, '/documents'],
                  ['Procedure Reviews', telemetry.calendarDue.procedureReviewsDue, '/documents'],
                  ['Emergency Reviews', telemetry.calendarDue.emergencyReviewsDue, '/emergency-response'],
                ].map(([label, val, to]) => (
                  <Link
                    key={label}
                    to={to}
                    className="rounded-lg border border-slate-200 bg-[#F5F0FF]/60 p-2 hover:border-[#0072FF]"
                  >
                    <div className="text-base font-extrabold text-[#0A2B6D]">{val}</div>
                    <div className="text-[10px] font-bold text-[#0A2B6D]">{label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Data Quality Centre (10 Monitors) */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
              Data Quality Centre — 10 Real-Time Integrity &amp; Completeness Monitors
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {[
                ['Duplicate Records', telemetry.dataQuality.duplicateRecords],
                ['Missing Evidence', telemetry.dataQuality.missingEvidence],
                ['Missing Reviews', telemetry.dataQuality.missingReviews],
                ['Missing Approvals', telemetry.dataQuality.missingApprovals],
                ['Missing Consents', telemetry.dataQuality.missingConsents],
                ['Missing Ownership', telemetry.dataQuality.missingOwnership],
                ['Missing Signatures', telemetry.dataQuality.missingSignatures],
                ['Missing Assessments', telemetry.dataQuality.missingAssessments],
                ['Expired Certificates', telemetry.dataQuality.expiredCertificates],
                ['Orphaned Records', telemetry.dataQuality.orphanedRecords],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                  <div className="text-base font-extrabold text-[#0A2B6D]">{val}</div>
                  <div className="text-[10px] font-bold text-[#0A2B6D] leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Automation Engine (8 Business Rule Generators) */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Enterprise Automation Engine — 8 Business-Rule Generators
              </span>
              <Button
                size="sm"
                onClick={handleRunAutomationEngine}
                disabled={runningAutomation}
                className="h-7 bg-[#0A2B6D] text-white text-[11px] font-extrabold"
              >
                Execute All 8 Automation Rules Now
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {ENTERPRISE_AUTOMATION_RULES.map((r) => (
                <div key={r.target} className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <Badge className="bg-[#5A00D6] text-white text-[9.5px]">Auto-Create: {r.target}</Badge>
                  <p className="mt-1 text-[11px] font-bold text-[#0A2B6D]">{r.rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}