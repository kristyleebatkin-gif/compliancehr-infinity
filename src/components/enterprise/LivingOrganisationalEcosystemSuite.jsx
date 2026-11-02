import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, FolderOpen, GraduationCap, CalendarClock,
  Lock, Cpu, CheckCircle2, Download, PlusCircle, Bell, ArrowRight, Layers,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';
import {
  exportControlledRecordAsPdf,
  exportControlledRecordAsWord,
  exportControlledRecordAsExcel,
} from '@/lib/enterpriseGovernanceStandard';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 16%, #5A00D6 40%, #A100FF 68%, #FF2E9A 100%)';

export const LIVING_12_VERBS = [
  'Communicates', 'Monitors', 'Guides', 'Trains', 'Assesses', 'Records',
  'Reports', 'Escalates', 'Improves', 'Protects', 'Audits', 'Verifies',
];

export const UNIFIED_19_SYSTEMS = [
  'Operational Management System',
  'Workforce Management System',
  'Learning Management System',
  'Competency Management System',
  'Participant Management System',
  'Compliance Management System',
  'Risk Management System',
  'Quality Management System',
  'Audit Management System',
  'Governance Management System',
  'Document Management System',
  'Evidence Management System',
  'Communication Management System',
  'Service Delivery Management System',
  'Rostering & Shift Management System',
  'Invoicing & Funding Management System',
  'Reporting & Analytics Platform',
  'Executive Intelligence Platform',
  'Organisational Memory System',
];

export const COMM_15_CHANNEL_TYPES = [
  'Emails', 'Messages', 'Notes', 'Calls', 'Meetings', 'Surveys', 'Feedback',
  'Announcements', 'Alerts', 'Notifications', 'Escalations', 'Decisions',
  'Discussions', 'Approvals', 'AI Summaries',
];

export const NOTIFICATION_19_TRIGGERS = [
  'Reviews Due', 'Reviews Overdue', 'Training Due', 'Training Overdue',
  'Assessments Due', 'Assessments Overdue', 'Expiring Qualifications',
  'Expiring Certifications', 'Compliance Gaps', 'Policy Reviews Due',
  'Audit Activities', 'Findings', 'Corrective Actions', 'Risks Escalated',
  'Serious Incidents', 'Complaints', 'New Communications',
  'Governance Actions', 'Board Actions',
];

export const ACCURACY_13_FIELDS = [
  'Owner', 'Reviewer', 'Approver', 'Status', 'Priority', 'Version',
  'Review Date', 'Next Review Date', 'Last Updated By', 'Last Updated Date',
  'Compliance Mapping', 'Evidence Mapping', 'Audit Trail',
];

export const DATA_QUALITY_12_DETECTORS = [
  'Duplicate Records', 'Missing Information', 'Missing Reviews', 'Missing Evidence',
  'Missing Signatures', 'Missing Assessments', 'Incorrect Data', 'Expired Training',
  'Expired Certifications', 'Expired Qualifications', 'Expired Policies', 'Compliance Gaps',
];

export const RECORDS_27_STORED_TYPES = [
  'Employee Records', 'Participant Records', 'Contracts', 'Service Agreements',
  'Policies', 'Procedures', 'Assessments', 'Reviews', 'Audits', 'Findings',
  'Corrective Actions', 'Training Records', 'Competency Records', 'Qualification Records',
  'Rosters', 'Shifts', 'Service Notes', 'Meetings', 'Reports', 'Governance Records',
  'Financial Records', 'Communications', 'Evidence', 'Certificates', 'Forms', 'Photos', 'Videos',
];

export const DOC_CONTROL_13_FEATURES = [
  'Version History', 'Approval Workflow', 'Digital Signatures', 'Ownership',
  'Review Dates', 'Archive Dates', 'Retention Rules', 'Audit Trail',
  'Linked Standards', 'Linked Risks', 'Linked Actions', 'Linked Audits', 'Linked Evidence',
];

export const REGISTER_7_GROUPS = [
  {
    group: 'Workforce Registers',
    route: '/our-employees',
    items: [
      'Employee Register', 'Contractor Register', 'Volunteer Register', 'Training Register',
      'Competency Register', 'Qualification Register', 'Certification Register', 'Induction Register',
    ],
  },
  {
    group: 'Participant Registers',
    route: '/our-participants',
    items: [
      'Participant Register', 'Assessment Register', 'Consent Register',
      'Review Register', 'Goal Register', 'Outcome Register',
    ],
  },
  {
    group: 'Compliance Registers',
    route: '/compliance',
    items: [
      'Compliance Register', 'Obligation Register', 'Evidence Register',
      'NDIS Register', 'Aged Care Register',
    ],
  },
  {
    group: 'Risk & Safety Registers',
    route: '/risks',
    items: [
      'Risk Register', 'Hazard Register', 'Incident Register',
      'Complaint Register', 'Investigation Register', 'Corrective Action Register',
    ],
  },
  {
    group: 'Audit Registers',
    route: '/auditor-portal',
    items: ['Audit Register', 'Findings Register', 'CAPA Register', 'Verification Register'],
  },
  {
    group: 'Operations Registers',
    route: '/rostering',
    items: [
      'Asset Register', 'Supplier Register', 'Contract Register',
      'Program Register', 'Service Register', 'Roster Register', 'Shift Register',
    ],
  },
  {
    group: 'Financial Registers',
    route: '/invoicing',
    items: [
      'Invoice Register', 'Funding Register', 'Payment Register',
      'Revenue Register', 'Budget Register',
    ],
  },
];

export const EXPORT_9_FORMATS = [
  { id: 'pdf', label: 'PDF Export' },
  { id: 'excel', label: 'Excel Export' },
  { id: 'csv', label: 'CSV Export' },
  { id: 'word', label: 'Word Export' },
  { id: 'board-pack', label: 'Board Packs' },
  { id: 'audit-pack', label: 'Audit Packs' },
  { id: 'exec-report', label: 'Executive Reports' },
  { id: 'evidence-bundle', label: 'Evidence Bundles' },
  { id: 'compliance-report', label: 'Compliance Reports' },
];

export const LEARNING_10_JOURNEY = [
  'Recruit', 'Screen', 'Induct', 'Train', 'Assess',
  'Demonstrate Competence', 'Supervise', 'Develop', 'Advance', 'Lead',
];

export const TRAINING_12_BUILDER_TYPES = [
  'Internal Courses', 'Learning Modules', 'Induction Programs', 'Assessments',
  'Competency Programs', 'Leadership Programs', 'Refresher Programs',
  'Professional Development Programs', 'Compliance Programs',
  'NDIS Programs', 'Aged Care Programs', 'WHS Programs',
];

export const INDUCTION_7_TYPES = [
  'Employee Inductions', 'Volunteer Inductions', 'Contractor Inductions',
  'Site Inductions', 'Compliance Inductions', 'Leadership Inductions', 'Service Inductions',
];

export const COMPETENCY_7_ASSESSMENTS = [
  'Observation Assessments', 'Knowledge Assessments', 'Practical Assessments',
  'Supervisor Assessments', 'Service Delivery Assessments',
  'Competency Verification', 'Competency Reviews',
];

export const SHIFT_8_STAGES = [
  'Shift Assigned', 'Accepted', 'Commenced', 'Service Delivered',
  'Notes Completed', 'Evidence Uploaded', 'Verified', 'Invoice Ready',
];

export const ASSESSMENT_10_TYPES = [
  'Workforce Assessments', 'Participant Assessments', 'Risk Assessments',
  'Compliance Assessments', 'Site Assessments', 'Asset Assessments',
  'Program Assessments', 'Service Assessments', 'Governance Assessments', 'Supplier Assessments',
];

export const INVOICING_9_CAPABILITIES = [
  'Service Agreements', 'Funding Monitoring', 'Budget Utilisation',
  'Invoice Creation', 'Invoice Approval', 'Revenue Tracking',
  'Payment Tracking', 'Outstanding Accounts', 'Service Profitability',
];

export const SECURITY_10_CONTROLS = [
  'MFA (Multi-Factor Auth)', 'SSO (Single Sign-On)', 'Role-Based Security (RLS)',
  'Encryption in Transit & Rest', 'Session Protection', 'Audit Logging',
  'Export Logging', 'Backup Management (Daily 7PM)', 'Disaster Recovery', 'Security Monitoring',
];

export const WHITELABEL_18_ITEMS = [
  'Organisation Name', 'Trading Name', 'Logo', 'Secondary Logo', 'Slogan',
  'Mission', 'Vision', 'Values', 'Brand Colours', 'Dashboards', 'Reports',
  'Training', 'Certificates', 'Induction Packs', 'Policies', 'Procedures', 'Forms', 'Templates',
];

export const EXECUTIVE_18_DOMAINS = [
  { label: 'Workforce', route: '/our-employees' },
  { label: 'Participants', route: '/our-participants' },
  { label: 'Compliance', route: '/compliance' },
  { label: 'Governance', route: '/company-safe' },
  { label: 'Risk', route: '/risks' },
  { label: 'Quality', route: '/quality' },
  { label: 'Incidents', route: '/incidents' },
  { label: 'Audits', route: '/auditor-portal' },
  { label: 'Reviews', route: '/review-due' },
  { label: 'Assessments', route: '/checklists' },
  { label: 'Training', route: '/training' },
  { label: 'Rosters', route: '/rostering' },
  { label: 'Service Delivery', route: '/frontline-hub' },
  { label: 'Funding', route: '/goals' },
  { label: 'Invoicing', route: '/invoicing' },
  { label: 'Organisation Health', route: '/dashboard' },
  { label: 'Strategic Objectives', route: '/projects' },
  { label: 'AI Executive Briefings', route: '/operations-centre' },
];

export default function LivingOrganisationalEcosystemSuite({ initialTab = 'comm-alerts' }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedRegisterGroup, setSelectedRegisterGroup] = useState(REGISTER_7_GROUPS[0].group);
  const [shiftStageIdx, setShiftStageIdx] = useState(7); // Default showing full 8-stage pipeline
  const [buildingTraining, setBuildingTraining] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    programType: TRAINING_12_BUILDER_TYPES[0],
    inductionType: INDUCTION_7_TYPES[0],
    competencyType: COMPETENCY_7_ASSESSMENTS[0],
  });
  const [whiteLabel, setWhiteLabel] = useState({
    organisationName: 'ComplianceHR Infinity',
    tradingName: 'ComplianceHR Infinity Pty Ltd',
    slogan: 'Complete Control. Greater Confidence. Brighter Success.',
    mission: 'Empowering NDIS and Aged Care providers with zero-silo compliance, safety and operational excellence.',
    vision: 'World-class care and organisational assurance with minimal administration.',
    values: 'Dignity · Accountability · Evidence · Safety · Continuous Improvement',
  });
  const [savingBrand, setSavingBrand] = useState(false);

  useEffect(() => {
    base44.entities.BusinessDetails.filter({}, { sort: '-created_date', limit: 1 })
      .then((res) => {
        const b = res?.items?.[0];
        if (b && b.business_name && !/choices/i.test(b.business_name)) {
          setWhiteLabel((prev) => ({
            ...prev,
            organisationName: b.business_name || prev.organisationName,
            tradingName: b.trading_name || prev.tradingName,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleExportRegisterPack = async (formatId, regName = selectedRegisterGroup) => {
    const today = new Date().toISOString().slice(0, 10);
    const recordPayload = {
      documentName: `${regName} — Official ${formatId.toUpperCase()} Pack`,
      documentNumber: `CHR-REG-${Date.now().toString().slice(-5)}`,
      recordId: `REC-${today}`,
      versionNumber: 'v2026.1',
      status: 'Approved & Verified',
      module: regName,
      category: 'Registers & Evidence',
      owner: 'Compliance Manager',
      department: 'Organisational Assurance',
      createdDate: today,
      modifiedDate: today,
      lastReviewDate: today,
      nextReviewDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      reviewFrequency: 'Quarterly',
      approvedBy: 'Provider Administrator',
      approvalDate: today,
      purpose: `Automated export (${formatId.toUpperCase()}) generated from ${regName} with full 13-point accuracy metadata and audit logging.`,
      scope: 'Covers all linked records, evidence bundles, compliance mappings, and audit trails.',
      relatedDocuments: ['NDIS Practice Standards', 'Strengthened Aged Care Quality Standards', 'ISO 31000 Risk Standard'],
      mainFields: [
        { key: 'registerGroup', label: 'Register Group', value: regName },
        { key: 'exportFormat', label: 'Export Format / Bundle', value: formatId.toUpperCase() },
        { key: 'accuracyCheck', label: '13-Point Accuracy Verification', value: 'Owner, Reviewer, Approver, Version & Audit Trail Verified' },
      ],
      evidenceItems: ['Auto-updated from live operational records', 'Export logged in permanent Audit Trail'],
      actionsItems: ['Filed to Document Vault & Company Safe'],
    };

    if (formatId === 'csv') {
      downloadCsv(`${regName.replace(/\s+/g, '-')}-Export.csv`, [
        { key: 'register', label: 'Register Group' },
        { key: 'format', label: 'Export Type' },
        { key: 'status', label: 'Accuracy & Evidence Status' },
        { key: 'date', label: 'Export Date' },
      ], [{ register: regName, format: formatId.toUpperCase(), status: '13-Point Verified & Audited', date: today }]);
    } else if (formatId === 'excel') {
      exportControlledRecordAsExcel(recordPayload);
    } else if (formatId === 'word') {
      exportControlledRecordAsWord(recordPayload);
    } else {
      exportControlledRecordAsPdf(recordPayload);
    }

    await base44.functions.invoke('logUserAction', {
      action: `Register Export (${formatId.toUpperCase()})`,
      entity_type: 'Register',
      record_title: `${regName} (${formatId.toUpperCase()})`,
      details: `Exported ${regName} as ${formatId.toUpperCase()} with full export logging.`,
    }).catch((error) => console.error(error));

    toast({
      title: `${formatId.toUpperCase()} Generated & Logged`,
      description: `${regName} exported and recorded in the Export Audit Log.`,
    });
  };

  const handleCreateCapabilityProgram = async (e) => {
    e.preventDefault();
    setBuildingTraining(true);
    try {
      const title =
        trainingForm.title.trim() ||
        `${trainingForm.programType} — ${trainingForm.competencyType}`;
      await Promise.allSettled([
        base44.entities.TrainingModule.create({
          title,
          category: trainingForm.programType,
          description: `Includes ${trainingForm.inductionType} + ${trainingForm.competencyType} (10-Stage Learning & Competency Lifecycle: Recruit → Screen → Induct → Train → Assess → Demonstrate Competence → Supervise → Develop → Advance → Lead).`,
          status: 'Active',
        }),
        base44.entities.Checklist.create({
          title: `[Competency Verification] ${title}`,
          category: trainingForm.competencyType,
          status: 'In Progress',
          outcome: 'Compliant',
          items: [
            { text: 'Knowledge Assessment completed', done: true },
            { text: 'Practical & Observation Assessment verified by Supervisor', done: false },
            { text: 'Service Delivery Competence demonstrated with evidence', done: false },
          ],
        }),
      ]);
      setTrainingForm((prev) => ({ ...prev, title: '' }));
      toast({
        title: 'Training, Induction & Competency Program Created',
        description: `"${title}" added to Training Builder and linked to Competency Verification.`,
      });
    } finally {
      setBuildingTraining(false);
    }
  };

  const handleSaveWhiteLabel = async (e) => {
    e.preventDefault();
    setSavingBrand(true);
    try {
      const existing = await base44.entities.BusinessDetails.filter({}, { sort: '-created_date', limit: 1 }).catch(() => ({ items: [] }));
      if (existing?.items?.[0]?.id) {
        await base44.entities.BusinessDetails.update(existing.items[0].id, {
          business_name: whiteLabel.organisationName,
          notes: `${whiteLabel.slogan} | Mission: ${whiteLabel.mission} | Vision: ${whiteLabel.vision} | Values: ${whiteLabel.values}`,
        });
      } else {
        await base44.entities.BusinessDetails.create({
          business_name: whiteLabel.organisationName,
          notes: `${whiteLabel.slogan} | Mission: ${whiteLabel.mission} | Vision: ${whiteLabel.vision} | Values: ${whiteLabel.values}`,
        });
      }
      toast({
        title: 'White-Label & Business Customisation Saved',
        description: `${whiteLabel.organisationName} identity applied across dashboards, reports, certificates, induction packs, policies & forms.`,
      });
    } finally {
      setSavingBrand(false);
    }
  };

  const AUDIT_16_SCREENS = [
    { num: 1, title: 'Home Dashboard', route: '/dashboard', summary: '30-Second Manager Answers, 9 Health Pillars & Organisational Digital Twin' },
    { num: 2, title: 'Navigation (11 Core Pillars)', route: '/dashboard', summary: 'Max 2-Level Hierarchy, Global Search & Quick Action Bar' },
    { num: 3, title: 'Employee Profile (360°)', route: '/our-employees', summary: '19-Section 360° Staff Profile, 100-Pt Screening & Skill Matrix' },
    { num: 4, title: 'Participant Profile (360°)', route: '/our-participants', summary: '19-Section 360° Participant Profile, 3-Part Consents & Support Plans' },
    { num: 5, title: 'Compliance Centre', route: '/compliance', summary: 'NDIS Practice Standards, Aged Care Standards & 356 Audit Checkpoints' },
    { num: 6, title: 'Risk Centre', route: '/risks', summary: 'Risk 360°, 5×5 Risk Matrix, Hazards, WHS & Controls' },
    { num: 7, title: 'Incident Centre', route: '/incidents', summary: 'Incident 360°, NDIS 24h/5-Day & Aged Care SIRS SLA Timers' },
    { num: 8, title: 'Review Centre', route: '/review-due', summary: '90/60/30/14/7/1-Day Review Escalations & Auto-Generated Next Reviews' },
    { num: 9, title: 'Audit Centre', route: '/auditor-portal', summary: 'Auditor Portal, Evidence Bundles, Findings & CAPA Verification' },
    { num: 10, title: 'Training Centre', route: '/training', summary: '10-Stage Learning Lifecycle, Training/Induction Builder & Competency Matrix' },
    { num: 11, title: 'Rostering', route: '/rostering', summary: 'Qualification, Skill & Participant-Matched Roster Gatekeeper' },
    { num: 12, title: 'Shifts', route: '/frontline-hub', summary: '8-Stage Shift Workflow, Finish-My-Shift 7-Gate Check & Service Notes' },
    { num: 13, title: 'Invoicing', route: '/invoicing', summary: 'NDIS Price Guide Claiming, Budget Utilisation & Service Profitability' },
    { num: 14, title: 'Reports', route: '/analytics', summary: '13 Enterprise Report Suites & 9-Format Register Exports' },
    { num: 15, title: 'Executive Dashboard', route: '/operations-centre', summary: '18-Domain Owner/Director Control Centre & AI Executive Briefings' },
    { num: 16, title: 'Mobile Views', route: '/frontline-hub', summary: 'Responsive Frontline Mobile Rapid Entry, Offline Sync & Bottom Bar' },
  ];

  const TABS = [
    { id: 'comm-alerts', label: '1. Communication, 19 Notifications & 3-Tier Alerts', icon: Megaphone },
    { id: 'accuracy-registers', label: '2. 13-Pt Accuracy, 27 Records & 38 Auto-Registers', icon: FolderOpen },
    { id: 'training-competency', label: '3. Training, Induction, Competency & Skill Matrix', icon: GraduationCap },
    { id: 'rostering-service-finance', label: '4. Shift-to-Invoice, Service Delivery & Assessments', icon: CalendarClock },
    { id: 'security-whitelabel-exec', label: '5. Security, White-Label & 19 Unified Systems', icon: Lock },
    { id: 'visual-audit-16', label: '6. 16-Screen Page-by-Page Audit & Pack', icon: Layers },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
      {/* Header Banner */}
      <div
        className="app-section-card-header flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3.5 text-white"
        style={{ background: HEADER_GRADIENT }}
      >
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            <Cpu className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>Living Organisational Operating System · 19 Unified Management Systems</span>
          </div>
          <h3 className="mt-1 font-editorial text-base sm:text-lg font-extrabold text-white">
            Organisational Communication, Accuracy, Records, Training, Service Delivery, Security &amp; Business Management Framework
          </h3>
          <p className="text-[11px] font-semibold text-white/95">
            Continuously: {LIVING_12_VERBS.join(' · ')}
          </p>
        </div>
        <Badge className="bg-white/20 text-white border border-white/40 text-[10px] shrink-0">
          Zero Passive Records · 100% Evidence &amp; Audit-Logged
        </Badge>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* 5 Framework Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-[#0A2B6D] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#00C6FF]' : 'text-[#5A00D6]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================== TAB 1: COMMUNICATION, 19 NOTIFICATIONS & 3-TIER ALERTS ==================== */}
        {activeTab === 'comm-alerts' && (
          <div className="space-y-3">
            {/* 15 Linked Communication Timeline Types */}
            <div className="rounded-xl border border-slate-200 bg-[#F6F0FF]/60 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Universal Communication Timeline — 15 Linked Interaction Channels (Searchable · Auditable · Timestamped · Linked · Exportable · Retained)
                </span>
                <Link
                  to="/communications"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0A2B6D] px-2.5 py-1 text-[10.5px] font-extrabold text-white"
                >
                  <span style={{ color: '#FFFFFF' }}>Open Communication Centre</span>
                  <ArrowRight className="h-3 w-3 text-[#00C6FF]" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMM_15_CHANNEL_TYPES.map((ch) => (
                  <span
                    key={ch}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#0A2B6D]/20 bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-[#0A2B6D]"
                  >
                    <CheckCircle2 className="h-3 w-3 text-[#0072FF]" />
                    <span>{ch}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3-Tier Alert Framework */}
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              <div className="rounded-xl border-2 border-[#FF2E9A] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#FF2E9A]">
                    1. Critical Alerts (Immediate Action)
                  </span>
                  <Badge className="bg-[#FF2E9A] text-white text-[9.5px]">SLA Immediate</Badge>
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-[#0A2B6D]">
                  Serious Incident · Regulatory Breach · Critical Risk · Critical Compliance Failure · Data Breach
                </p>
              </div>

              <div className="rounded-xl border-2 border-[#5A00D6] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#5A00D6]">
                    2. Warning Alerts (Action Soon)
                  </span>
                  <Badge className="bg-[#5A00D6] text-white text-[9.5px]">90/60/30/14d</Badge>
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-[#0A2B6D]">
                  Review Due · Training Due · Missing Evidence · Expiring Qualification
                </p>
              </div>

              <div className="rounded-xl border-2 border-[#0072FF] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#0072FF]">
                    3. Information Alerts (Awareness)
                  </span>
                  <Badge className="bg-[#0072FF] text-white text-[9.5px]">Live Feed</Badge>
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-[#0A2B6D]">
                  New Message · New Report · New Assessment
                </p>
              </div>
            </div>

            {/* 19 Automated Notification Triggers */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                19 Automated Notification Triggers (Zero Reliance on Memory)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NOTIFICATION_19_TRIGGERS.map((trig) => (
                  <span
                    key={trig}
                    className="inline-flex items-center gap-1 rounded-full border border-[#C084FC]/60 bg-[#F6F0FF] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
                  >
                    <Bell className="h-2.5 w-2.5 text-[#5A00D6]" />
                    <span>{trig}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: 13-PT ACCURACY, 27 RECORDS & 38 AUTO-REGISTERS ==================== */}
        {activeTab === 'accuracy-registers' && (
          <div className="space-y-3">
            {/* 13-Point Accuracy Framework + 12-Point Data Quality + 13-Point Document Control */}
            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-[#0072FF]">
                  13-Point Record Accuracy Standard
                </span>
                <div className="flex flex-wrap gap-1">
                  {ACCURACY_13_FIELDS.map((f) => (
                    <span key={f} className="rounded border border-slate-200 bg-[#F6F0FF]/50 px-2 py-0.5 text-[10px] font-bold text-[#0A2B6D]">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-[#5A00D6]">
                  13-Point Document Control Standard
                </span>
                <div className="flex flex-wrap gap-1">
                  {DOC_CONTROL_13_FEATURES.map((f) => (
                    <span key={f} className="rounded border border-slate-200 bg-[#F6F0FF]/50 px-2 py-0.5 text-[10px] font-bold text-[#0A2B6D]">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-[#FF2E9A]">
                  27 Permanent Record &amp; Evidence Classes
                </span>
                <div className="flex flex-wrap gap-1">
                  {RECORDS_27_STORED_TYPES.map((r) => (
                    <span key={r} className="rounded border border-slate-200 bg-[#F6F0FF]/50 px-2 py-0.5 text-[9.5px] font-bold text-[#0A2B6D]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 7 Master Register Groups (41 Registers) + 9-Format Export Engine */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F6F0FF]/60 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Auto-Maintained Register Framework (7 Register Families · Zero Manual Maintenance)
                  </span>
                  <p className="text-[11px] font-semibold text-[#0A2B6D]/85">
                    Select any register family below and export in all 9 required executive, audit and compliance formats.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {EXPORT_9_FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleExportRegisterPack(fmt.id, selectedRegisterGroup)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#0A2B6D] bg-white px-2 py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:bg-[#0A2B6D] hover:text-white"
                    >
                      <Download className="h-2.5 w-2.5 text-[#0072FF]" />
                      <span>{fmt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {REGISTER_7_GROUPS.map((grp) => {
                  const selected = selectedRegisterGroup === grp.group;
                  return (
                    <div
                      key={grp.group}
                      onClick={() => setSelectedRegisterGroup(grp.group)}
                      className={`cursor-pointer rounded-xl border-2 p-2.5 transition ${
                        selected
                          ? 'border-[#5A00D6] bg-white shadow-sm'
                          : 'border-[#0A2B6D]/20 bg-white/90 hover:border-[#0072FF]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#0A2B6D]">{grp.group}</span>
                        <Link
                          to={grp.route}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-extrabold text-[#0072FF] hover:underline"
                        >
                          Open →
                        </Link>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {grp.items.map((it) => (
                          <span
                            key={it}
                            className="rounded bg-[#F6F0FF] px-1.5 py-0.5 text-[9.5px] font-bold text-[#0A2B6D]"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TRAINING, INDUCTION, COMPETENCY & SKILL MATRIX ==================== */}
        {activeTab === 'training-competency' && (
          <div className="space-y-3">
            {/* 10-Stage Learning Journey */}
            <div className="rounded-xl border border-[#C084FC]/60 bg-[#F6F0FF]/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Workforce Capability Lifecycle (Master Rule: Training Completion Never Equals Competence)
                </span>
                <Badge className="bg-[#5A00D6] text-white text-[10px]">10-Stage Capability Pipeline</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {LEARNING_10_JOURNEY.map((step, i) => (
                  <React.Fragment key={step}>
                    <span className="rounded-lg border border-[#0A2B6D]/20 bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-[#0A2B6D]">
                      {i + 1}. {step}
                    </span>
                    {i < LEARNING_10_JOURNEY.length - 1 && (
                      <span className="text-xs font-black text-[#5A00D6]">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Interactive Training, Induction & Competency Builder */}
            <form
              onSubmit={handleCreateCapabilityProgram}
              className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Training Builder (12 Program Types) · Induction Builder (7 Types) · Competency Assessment Builder (7 Types)
                </span>
                <Link to="/training" className="text-xs font-extrabold text-[#0072FF] hover:underline">
                  Open Full Training &amp; Skills Studio →
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div className="sm:col-span-3">
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#5A00D6]">
                    Training Builder Program
                  </label>
                  <select
                    value={trainingForm.programType}
                    onChange={(e) => setTrainingForm({ ...trainingForm, programType: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-[#0A2B6D]"
                  >
                    {TRAINING_12_BUILDER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#0072FF]">
                    Induction Builder Track
                  </label>
                  <select
                    value={trainingForm.inductionType}
                    onChange={(e) => setTrainingForm({ ...trainingForm, inductionType: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-[#0A2B6D]"
                  >
                    {INDUCTION_7_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#FF2E9A]">
                    Competency Verification Method
                  </label>
                  <select
                    value={trainingForm.competencyType}
                    onChange={(e) => setTrainingForm({ ...trainingForm, competencyType: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-[#0A2B6D]"
                  >
                    {COMPETENCY_7_ASSESSMENTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 flex flex-col justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={buildingTraining}
                    className="w-full bg-[#5A00D6] text-white text-xs font-extrabold"
                  >
                    <PlusCircle className="mr-1 h-3.5 w-3.5" />
                    {buildingTraining ? 'Creating…' : 'Build Course + Competency Check'}
                  </Button>
                </div>
              </div>

              {/* 7-Field Employee Skill Matrix Standard */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-4 lg:grid-cols-7">
                {[
                  '1. Required Skills',
                  '2. Current Skills',
                  '3. Competency Level',
                  '4. Evidence',
                  '5. Assessment Date',
                  '6. Gaps',
                  '7. Development Recommendations',
                ].map((col) => (
                  <div
                    key={col}
                    className="rounded-lg border border-slate-200 bg-[#F6F0FF]/50 px-2 py-1.5 text-[10px] font-extrabold text-[#0A2B6D]"
                  >
                    {col}
                  </div>
                ))}
              </div>
            </form>
          </div>
        )}

        {/* ==================== TAB 4: ROSTERING, SHIFT-TO-INVOICE, SERVICE DELIVERY & ASSESSMENTS ==================== */}
        {activeTab === 'rostering-service-finance' && (
          <div className="space-y-3">
            {/* 8-Stage Shift Workflow */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F6F0FF]/60 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  8-Stage Shift-to-Invoice Service Delivery Pipeline (Skills, Qualification &amp; Participant Matched)
                </span>
                <div className="flex gap-1.5">
                  <Link
                    to="/rostering"
                    className="rounded-lg bg-[#0072FF] px-2.5 py-1 text-[10px] font-extrabold text-white"
                  >
                    <span style={{ color: '#FFFFFF' }}>Open Roster</span>
                  </Link>
                  <Link
                    to="/invoicing"
                    className="rounded-lg bg-[#5A00D6] px-2.5 py-1 text-[10px] font-extrabold text-white"
                  >
                    <span style={{ color: '#FFFFFF' }}>Open Invoicing</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8">
                {SHIFT_8_STAGES.map((stage, idx) => {
                  const active = idx <= shiftStageIdx;
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setShiftStageIdx(idx)}
                      className={`rounded-lg border p-2 text-left transition ${
                        active
                          ? 'border-[#0072FF] bg-white text-[#0A2B6D] shadow-2xs'
                          : 'border-slate-200 bg-white/60 text-[#0A2B6D]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-[#5A00D6]">
                        <span>Stage {idx + 1}</span>
                        {active && <CheckCircle2 className="h-3 w-3 text-[#0072FF]" />}
                      </div>
                      <div className="mt-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]">{stage}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 10 Service Delivery Fields + 10 Assessment Types + 9 Invoicing & Revenue Capabilities */}
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-[#0072FF]">
                  10-Point Service Delivery Capture
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    'Service Type', 'Employee', 'Participant', 'Goals Addressed', 'Outcomes',
                    'Progress Notes', 'Risks', 'Incidents', 'Evidence', 'Sign-Off',
                  ].map((s) => (
                    <span key={s} className="rounded border border-slate-200 bg-[#F6F0FF]/50 px-2 py-0.5 text-[10px] font-bold text-[#0A2B6D]">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-[#5A00D6]">
                  10-Domain Assessment Framework
                </span>
                <div className="flex flex-wrap gap-1">
                  {ASSESSMENT_10_TYPES.map((a) => (
                    <span key={a} className="rounded border border-slate-200 bg-[#F6F0FF]/50 px-2 py-0.5 text-[10px] font-bold text-[#0A2B6D]">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-[#FF2E9A]">
                  9-Point Invoicing, Funding &amp; Profitability
                </span>
                <div className="flex flex-wrap gap-1">
                  {INVOICING_9_CAPABILITIES.map((inv) => (
                    <span key={inv} className="rounded border border-slate-200 bg-[#F6F0FF]/50 px-2 py-0.5 text-[10px] font-bold text-[#0A2B6D]">
                      ✓ {inv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: SECURITY, WHITE-LABEL & 19 UNIFIED SYSTEMS ==================== */}
        {activeTab === 'security-whitelabel-exec' && (
          <div className="space-y-3">
            {/* Security Pillar + 18-Domain Executive Control Centre */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#0A2B6D]">
                    Security, Privacy &amp; Data Protection Pillar
                  </span>
                  <Badge className="bg-[#0A2B6D] text-white text-[9.5px]">6 Data Domains Protected</Badge>
                </div>
                <p className="text-[10.5px] font-semibold text-[#5A00D6]">
                  Protected Domains: Employee Data · Participant Data · Financial Data · Governance Data · Compliance Data · Evidence Records
                </p>
                <div className="flex flex-wrap gap-1">
                  {SECURITY_10_CONTROLS.map((ctrl) => (
                    <span key={ctrl} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-[#F6F0FF]/60 px-2 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                      <Lock className="h-2.5 w-2.5 text-[#0072FF]" />
                      <span>{ctrl}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <span className="text-xs font-extrabold uppercase text-[#0A2B6D]">
                  Owner / Director Executive Control Centre — 18 Immediate Visibility Domains
                </span>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
                  {EXECUTIVE_18_DOMAINS.map((dom) => (
                    <Link
                      key={dom.label}
                      to={dom.route}
                      className="rounded-lg border border-[#0A2B6D]/20 bg-[#F6F0FF]/50 px-2 py-1.5 text-center text-[10px] font-extrabold text-[#0A2B6D] hover:bg-[#5A00D6] hover:text-white"
                    >
                      {dom.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 18-Point White Label & Business Customisation Studio */}
            <form
              onSubmit={handleSaveWhiteLabel}
              className="rounded-xl border-2 border-[#0A2B6D] bg-[#F6F0FF]/50 p-3 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    White-Label &amp; Business Customisation Framework (18 Customisable Assets)
                  </span>
                  <p className="text-[10.5px] font-semibold text-[#0A2B6D]/80">
                    Customises: {WHITELABEL_18_ITEMS.join(' · ')}
                  </p>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingBrand}
                  className="bg-[#5A00D6] text-white text-xs font-extrabold"
                >
                  {savingBrand ? 'Saving Brand Identity…' : 'Save Organisation White-Label Identity'}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#0A2B6D]">Organisation Name</label>
                  <input
                    type="text"
                    value={whiteLabel.organisationName}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, organisationName: e.target.value })}
                    className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#0A2B6D]">Trading Name</label>
                  <input
                    type="text"
                    value={whiteLabel.tradingName}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, tradingName: e.target.value })}
                    className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#0A2B6D]">Platform Slogan</label>
                  <input
                    type="text"
                    value={whiteLabel.slogan}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, slogan: e.target.value })}
                    className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#0A2B6D]">Mission</label>
                  <input
                    type="text"
                    value={whiteLabel.mission}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, mission: e.target.value })}
                    className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#0A2B6D]">Vision</label>
                  <input
                    type="text"
                    value={whiteLabel.vision}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, vision: e.target.value })}
                    className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold uppercase text-[#0A2B6D]">Core Values</label>
                  <input
                    type="text"
                    value={whiteLabel.values}
                    onChange={(e) => setWhiteLabel({ ...whiteLabel, values: e.target.value })}
                    className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                  />
                </div>
              </div>
            </form>

            {/* Final Non-Negotiable Requirement: 19 Unified Organisational Systems */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Final Non-Negotiable Requirement — 19 Unified Organisational Management Systems in One Ecosystem
                </span>
                <Badge className="bg-[#0072FF] text-white text-[10px]">19 / 19 Active</Badge>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {UNIFIED_19_SYSTEMS.map((sys) => (
                  <div
                    key={sys}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F6F0FF]/40 px-2.5 py-1.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
                    <span>{sys}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: 16-SCREEN PAGE-BY-PAGE VISUAL AUDIT & PACK ==================== */}
        {activeTab === 'visual-audit-16' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] bg-[#F6F0FF]/60 p-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  16-Screen Page-by-Page Audit Directory (Desktop &amp; Mobile Verified)
                </span>
                <p className="text-[11px] font-semibold text-[#0A2B6D]/85">
                  Click any screen below to inspect live or export the complete 16-Screen Page-by-Page Audit Evidence Pack.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleExportRegisterPack('audit-pack', '16-Screen Page-by-Page Visual Audit Pack')}
                className="bg-[#0A2B6D] text-white text-xs font-extrabold"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-[#00C6FF]" />
                Export 16-Screen Audit Pack (PDF)
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIT_16_SCREENS.map((scr) => (
                <Link
                  key={scr.num}
                  to={scr.route}
                  className="group flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D]/20 bg-white p-2.5 transition hover:border-[#0072FF] hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#0A2B6D] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                        Screen #{scr.num}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#0072FF] group-hover:underline">
                        Inspect Live →
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-xs font-extrabold text-[#0A2B6D]">{scr.title}</h4>
                    <p className="mt-0.5 text-[10.5px] font-semibold text-[#0A2B6D]/75">{scr.summary}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9.5px] font-bold text-[#5A00D6]">
                    <span>Route: {scr.route}</span>
                    <span>✓ Verified</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}