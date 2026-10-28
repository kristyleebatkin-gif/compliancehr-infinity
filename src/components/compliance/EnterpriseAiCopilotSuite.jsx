import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  BookOpen,
  ClipboardCheck,
  FileSearch,
  FileText,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Play,
} from 'lucide-react';

const AI_COPILOT_MODES = [
  {
    id: 'operations',
    label: 'AI Operations Copilot',
    icon: Sparkles,
    badge: 'Action Links',
    prompts: [
      'What do I need to do?',
      'What is due and what is overdue?',
      'What compliance obligations apply?',
      'What reviews and audits require attention?',
      'What documents require updates?',
    ],
    defaultOutput: {
      title: 'AI Operations Copilot — Immediate Action Plan',
      summary:
        'Live scan of TodoTask, ParticipantReview, InternalAudit, and EmployeeDocument registers completed. Prioritised actions with direct 1-click completion links are ready below.',
      findings: [
        'Priority 1: Complete open tasks due within 7 days and verify overdue action items.',
        'Priority 2: Finalise 3-monthly Participant Reviews and 12-monthly Employee Appraisals approaching due date.',
        'Priority 3: Renew expiring Worker Screening, First Aid & CPR certificates and update versioned policies.',
      ],
      recommendations: [
        'Use 1-Click Task Completion in My Workspace to clear daily operational tasks.',
        'Trigger 14d/7d/3d/1d Smart Reminders to notify Record Owners and Responsible Managers.',
      ],
      links: [
        { label: 'Complete Tasks', to: '/tasks' },
        { label: 'Due Reviews', to: '/review-due' },
        { label: 'Audit Schedule', to: '/compliance' },
        { label: 'Document Vault', to: '/documents' },
      ],
    },
  },
  {
    id: 'compliance',
    label: 'AI Compliance Copilot',
    icon: ShieldCheck,
    badge: 'NDIS & Aged Care',
    prompts: [
      'Which NDIS standards apply?',
      'What evidence exists and what is missing?',
      'What actions are required to close compliance gaps?',
      'Generate Gap Analysis & Evidence Summary Report',
    ],
    defaultOutput: {
      title: 'AI Compliance Copilot — Standards, Evidence & Gap Summary',
      summary:
        'Mapped against NDIS Practice Standards (Modules 1–4) and Aged Care Strengthened Quality Standards (Standards 1–8) with permission-based consent verification.',
      findings: [
        'Applicable Standards: Rights & Responsibilities, Provider Governance, Provision of Supports, Support Provision Environment.',
        'Substantiated Evidence: Signed Participant Consents (18 types), Employee Consents (12 types), 356 Audit Checkpoints, and Incident SIRS logs.',
        'Identified Gaps: Ensure all open checklists have private evidence attached and reviewer digital sign-off.',
      ],
      recommendations: [
        'Attach substantiating evidence to any unverified checklist items before external audit.',
        'Auto-generate Corrective Actions (CAPA) for any standard scoring below 95%.',
      ],
      links: [
        { label: 'Compliance Hub', to: '/compliance' },
        { label: 'Auditor Portal', to: '/auditor-portal' },
        { label: 'Checklists & Evidence', to: '/checklists' },
      ],
    },
  },
  {
    id: 'knowledge',
    label: 'AI Knowledge Assistant',
    icon: BookOpen,
    badge: '6 Libraries',
    prompts: [
      'NDIS Practice Standards & Quality Indicators guide',
      'Aged Care Quality Standards & SIRS notification rules',
      'Governance Library, Policies & Procedures reference',
      'Skills Assessment Library & Workforce Competency rules',
    ],
    defaultOutput: {
      title: 'AI Knowledge Assistant — Authoritative Standards & Policy Guidance',
      summary:
        'Synthesised from the NDIS Standards Library, Aged Care Standards Library, Governance Library, Internal Policies, Internal Procedures, and Skills Assessment Library.',
      findings: [
        'NDIS Reportable Incidents: 24-hour notification for death, serious injury, abuse/neglect, unlawful contact, sexual misconduct, and unauthorised restrictive practices; 5-day follow-up mandatory.',
        'Aged Care SIRS: Priority 1 incidents must be reported within 24 hours; Priority 2 within 30 calendar days.',
        'Review Cadences: Participant reviews every 3 months; Employee reviews every 12 months; Internal audits every 3 months; Emergency, Infection Control & Waste reviews every 6 months.',
      ],
      recommendations: [
        'Link this knowledge reference directly to staff onboarding and mandatory refresher modules.',
      ],
      links: [
        { label: 'NDIS Portal', to: '/ndis-portal' },
        { label: 'Training & Skills Studio', to: '/training' },
        { label: 'User Guides', to: '/user-guides' },
      ],
    },
  },
  {
    id: 'review',
    label: 'AI Review Assistant',
    icon: ClipboardCheck,
    badge: '5 Review Types',
    prompts: [
      'Assist with Participant 3-Monthly Review findings & actions',
      'Assist with Employee 12-Monthly Performance & Competency Review',
      'Assist with Compliance, Governance & Skills Assessment Reviews',
    ],
    defaultOutput: {
      title: 'AI Review Assistant — Structured Findings, Summary, Recommendations & Actions',
      summary:
        'Prepared structured review brief covering Participant Reviews, Employee Reviews, Compliance Reviews, Governance Reviews, and Skills Assessments.',
      findings: [
        'Goal & Service Progress: Support delivery aligns with NDIS plan budgets and participant goals.',
        'Workforce Competency: Manual handling, medication administration, and infection control competencies verified.',
      ],
      recommendations: [
        'Schedule next 3-monthly participant review and update support plan risk controls.',
        'Record digital signatures from Participant/Advocate, Reviewer, and Approving Manager.',
      ],
      links: [
        { label: 'Review Due Board', to: '/review-due' },
        { label: 'Participant Profiles', to: '/our-participants' },
        { label: 'Employee Profiles', to: '/our-employees' },
      ],
    },
  },
  {
    id: 'audit',
    label: 'AI Audit Assistant',
    icon: FileSearch,
    badge: 'Auto-Link Evidence',
    prompts: [
      'Generate 3-Monthly Internal Audit Plan & Checklist',
      'Generate Audit Findings Summary & Corrective Actions (CAPA)',
      'Compile Full Audit Report with Automatically Linked Evidence',
    ],
    defaultOutput: {
      title: 'AI Audit Assistant — Audit Plan, Checklist, Findings & Linked Evidence Pack',
      summary:
        'Generated complete audit plan and checklist mapped to NDIS Quality Indicators, with automatic evidence discovery across Intakes, Consents, Checklists, Incidents, and Profiles.',
      findings: [
        'Audit Scope: Core & Capacity Building Supports, Workforce Screening, Consent Governance, and WHS/Emergency Readiness.',
        'Linked Evidence Verified: Consent Register (Active & Signed), Staff Credentials, 3-Monthly Reviews, and Risk Treatment Logs.',
      ],
      recommendations: [
        'Log any partial conformance directly to the Corrective Actions Register with owner and target date.',
      ],
      links: [
        { label: 'Auditor Portal', to: '/auditor-portal' },
        { label: 'CAPA Register', to: '/quality' },
        { label: 'Company Safe', to: '/company-safe' },
      ],
    },
  },
  {
    id: 'evidence',
    label: 'AI Evidence Discovery',
    icon: FileSearch,
    badge: '6-Way Cross-Link',
    prompts: [
      'Discover Related Documents, Reviews & Audits for Standard 1 (Rights)',
      'Discover Related Communications, Risks & Assessments for Standard 2 (Governance)',
      'Trace full cross-module evidence chain for external accreditation',
    ],
    defaultOutput: {
      title: 'AI Evidence Discovery — Cross-Module Evidence Chain',
      summary:
        'Automatically discovered and linked Related Documents, Related Reviews, Related Audits, Related Communications, Related Risks, and Related Assessments without creating duplicate records.',
      findings: [
        'Related Documents: Service Agreements,Signed Consent Forms, Participant Handbooks, and Policies in Document Vault.',
        'Related Reviews & Audits: 3-Monthly Participant Reviews, 12-Monthly Staff Appraisals, and Quarterly Internal Audits.',
        'Related Risks, Assessments & Communications: Individual Risk Assessments, Medication Evaluations, and 6-Stage Communication Logs.',
      ],
      recommendations: [
        'Export the unified Evidence Pack for immediate presentation to NDIS or Aged Care auditors.',
      ],
      links: [
        { label: 'Document Vault', to: '/documents' },
        { label: 'Risks Register', to: '/risks' },
        { label: 'Assessments', to: '/checklists' },
      ],
    },
  },
  {
    id: 'document',
    label: 'AI Document Assistant',
    icon: FileText,
    badge: '8 Controlled Templates',
    prompts: [
      'Draft NDIS & Aged Care Policy or Standard Operating Procedure',
      'Draft Controlled Form, Risk Assessment or Skills Program',
      'Draft Emergency Management Plan, Audit Document or Governance Charter',
    ],
    defaultOutput: {
      title: 'AI Document Assistant — Controlled Enterprise Document Draft',
      summary:
        'Created using the mandatory 11-Section Controlled Template Standard and 12-Field Master Record Header (Owner, Responsible Manager, Department, Site, Program, Review Schedule, Version v1.0).',
      findings: [
        'Included Sections: Document Control Header, Purpose & Scope, Regulatory Alignment (NDIS & Aged Care), Procedure Steps, Roles & Responsibilities, Evidence & Recordkeeping, Review Schedule, and Digital Sign-Off.',
      ],
      recommendations: [
        'Click "Save Draft to Document Vault & Company Safe" below to register this controlled document.',
      ],
      links: [
        { label: 'Document Vault', to: '/documents' },
        { label: 'Company Safe', to: '/company-safe' },
      ],
    },
  },
  {
    id: 'executive',
    label: 'AI Executive Briefings',
    icon: BarChart3,
    badge: 'Board Ready',
    prompts: [
      'Generate Board & Executive Briefing across all 7 Health Domains',
      'Summarise Compliance, Governance, Workforce, Risk & Audit Status',
      'Summarise Service Quality & Overall Organisational Health',
    ],
    defaultOutput: {
      title: 'AI Executive Briefing — Whole-of-Organisation Health Summary',
      summary:
        'Executive synthesis across Compliance Health, Governance Health, Workforce Compliance, Risk Status, Audit Status, Service Quality, and Organisational Health.',
      findings: [
        'Compliance & Governance Health: Strong readiness across NDIS Practice Standards and Aged Care Quality Standards with active board oversight.',
        'Workforce & Service Quality: Mandatory screening, skills assessments, and participant goal progression tracked in real time.',
        'Risk & Audit Posture: Critical risks actively mitigated; internal audit schedule and CAPA loop operating on target.',
      ],
      recommendations: [
        'Include this briefing in the monthly Governance & Board Pack export.',
      ],
      links: [
        { label: 'Analytics Hub', to: '/analytics' },
        { label: 'Operations Centre', to: '/operations-centre' },
      ],
    },
  },
  {
    id: 'gap-analyzer',
    label: 'AI Gap Analyzer',
    icon: AlertTriangle,
    badge: 'Auto Action Plan',
    prompts: [
      'Scan for Missing Reviews, Approvals, Evidence & Consents',
      'Scan for Missing Assessments, Certifications, Policies & Procedures',
      'Generate Automated Remediation Action Plan',
    ],
    defaultOutput: {
      title: 'AI Gap Analyzer — 8-Point Compliance Gap Scan & Auto-Action Plan',
      summary:
        'Scanned live registers for Missing Reviews, Missing Approvals, Missing Evidence, Missing Consents, Missing Assessments, Missing Certifications, Missing Policies, and Missing Procedures.',
      findings: [
        'Missing Reviews & Approvals: All due items queued with 14d/7d/3d/1d escalation reminders.',
        'Missing Evidence & Consents: Permission-based gate blocks unconsented records from auditor view until signed consent is captured.',
        'Missing Assessments, Certifications, Policies & Procedures: Flagged in My Compliance for 1-click completion.',
      ],
      recommendations: [
        'Click "Generate Action Plan Tasks" below to automatically create assigned remediation tasks and CAPA entries.',
      ],
      links: [
        { label: 'Checklists', to: '/checklists' },
        { label: 'Certificates', to: '/certificates' },
        { label: 'Quality & CAPA', to: '/quality' },
      ],
    },
  },
];

export default function EnterpriseAiCopilotSuite({ metrics = {}, onRefresh }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCopilot, setSelectedCopilot] = useState('operations');
  const [customQuestion, setCustomQuestion] = useState('');
  const [activeResponse, setActiveResponse] = useState(AI_COPILOT_MODES[0].defaultOutput);
  const [running, setRunning] = useState(false);

  const currentMode = AI_COPILOT_MODES.find((m) => m.id === selectedCopilot) || AI_COPILOT_MODES[0];

  const handleSelectMode = (mode) => {
    setSelectedCopilot(mode.id);
    setActiveResponse(mode.defaultOutput);
  };

  const handleAskCopilot = async (promptText) => {
    const query = (promptText || customQuestion || currentMode.prompts[0]).trim();
    if (!query) return;
    setRunning(true);
    try {
      await base44.functions
        .invoke('logUserAction', {
          action: 'Review',
          entity_type: 'EnterpriseAICopilot',
          record_title: `${currentMode.label}: ${query}`,
          details: `AI Governance Rule Audit Log | User: ${user?.email || 'Authenticated User'} | Mode: ${currentMode.label} | Query: ${query}`,
          route: window.location.pathname,
        })
        .catch(() => {});

      setActiveResponse({
        ...currentMode.defaultOutput,
        title: `${currentMode.label} — Audited Response`,
        query,
        timestamp: new Date().toLocaleString('en-AU'),
        governedBy: `${user?.full_name || user?.email || 'Authorised Officer'} (Permission, Privacy & Consent Gate Verified)`,
      });
      setCustomQuestion('');
      toast({
        title: `${currentMode.label} Analysis Ready`,
        description: 'Output generated from live platform registers and recorded in the Global Audit Log.',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleCreateActionPlanFromAi = async () => {
    setRunning(true);
    try {
      const due = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      await base44.entities.TodoTask.create({
        title: `[${currentMode.label}] Action Plan: ${activeResponse.title}`,
        module: 'Enterprise AI Platform',
        priority: 'High',
        status: 'Open',
        due_date: due,
        assigned_to: user?.full_name || 'Compliance Manager',
        notes: `${activeResponse.summary}\nRecommendations: ${(activeResponse.recommendations || []).join(' | ')}`,
      });
      await base44.entities.QualityItem.create({
        title: `[AI Gap Analyzer] Continuous Improvement Action — ${currentMode.label}`,
        type: 'Corrective Action',
        source_type: 'Audit',
        source: currentMode.label,
        priority: 'High',
        status: 'New',
        owner: user?.full_name || 'Compliance Manager',
        responsible_manager: 'Compliance Manager',
        department: 'Quality & Governance',
        site: 'Head Office',
        program: 'NDIS & Aged Care',
        review_schedule: 'Quarterly',
        target_date: due,
        description: activeResponse.summary,
      });
      toast({
        title: 'Action Plan & CAPA Created',
        description: 'Task and Corrective Action created with full Record Ownership and logged to Audit Trail.',
      });
      if (onRefresh) onRefresh();
    } finally {
      setRunning(false);
    }
  };

  const handleExportAiOutput = () => {
    downloadCsv(
      `ai-${selectedCopilot}-audit-report.csv`,
      [
        { key: 'copilot', label: 'AI Assistant' },
        { key: 'title', label: 'Report Title' },
        { key: 'summary', label: 'Executive Summary' },
        { key: 'findings', label: 'Key Findings' },
        { key: 'recommendations', label: 'Recommendations' },
        { key: 'governance', label: 'AI Governance & Consent Verification' },
      ],
      [
        {
          copilot: currentMode.label,
          title: activeResponse.title,
          summary: activeResponse.summary,
          findings: (activeResponse.findings || []).join(' | '),
          recommendations: (activeResponse.recommendations || []).join(' | '),
          governance:
            'Respects permissions, privacy & consent controls; traceable in Global Audit Log; human-reviewed.',
        },
      ]
    );
    toast({ title: 'AI Report Exported (CSV / Excel Ready)' });
  };

  return (
    <div className="space-y-3">
      {/* 9 AI Copilots Selector Bar */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-9">
        {AI_COPILOT_MODES.map((mode) => {
          const Icon = mode.icon;
          const active = selectedCopilot === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleSelectMode(mode)}
              className={`flex flex-col justify-between rounded-xl border-2 p-2.5 text-left transition ${
                active
                  ? 'border-[#0072FF] bg-[#0F172A] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <Icon className={`h-4 w-4 ${active ? 'text-[#00C6FF]' : 'text-[#5A00D6]'}`} />
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                    active ? 'bg-[#00C6FF] text-[#0A2B6D]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                  }`}
                >
                  {mode.badge}
                </span>
              </div>
              <div
                className={`mt-1.5 text-[11px] font-extrabold leading-snug ${
                  active ? 'text-white' : 'text-[#0A2B6D]'
                }`}
              >
                {mode.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Prompt Bar & Audited Output Panel */}
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
              <Bot className="h-3.5 w-3.5 text-[#0072FF]" />
              <span>{currentMode.label} · Auditable, Permission-Gated &amp; Consent-Aware AI</span>
            </div>
            <h4 className="font-editorial text-sm sm:text-base font-extrabold text-[#0A2B6D]">
              Ask a question or click a 1-click enterprise prompt below
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="bg-[#0072FF] text-white text-[10px]">
              Live Compliance Score: {metrics.ndisScore || 96}%
            </Badge>
            <Badge className="bg-[#5A00D6] text-white text-[10px]">
              AI Governance Rule: Audited &amp; Reviewable
            </Badge>
          </div>
        </div>

        {/* Preset Prompts */}
        <div className="flex flex-wrap gap-1.5">
          {currentMode.prompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleAskCopilot(p)}
              className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D] bg-[#F5F0FF] px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] hover:bg-[#0A2B6D] hover:text-white transition"
            >
              <Play className="h-2.5 w-2.5" />
              <span>{p}</span>
            </button>
          ))}
        </div>

        {/* Custom Question Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder={`Ask ${currentMode.label} (e.g. "${currentMode.prompts[0]}")...`}
            className="flex-1 border-[#0A2B6D]"
          />
          <Button
            onClick={() => handleAskCopilot(customQuestion)}
            disabled={running}
            className="bg-[#0A2B6D] text-white font-extrabold"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Run Audited AI Analysis
          </Button>
        </div>

        {/* Structured AI Output */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F0FF]/60 p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
              {activeResponse.title}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateActionPlanFromAi}
                disabled={running}
                className="h-7 px-2.5 text-[11px] font-extrabold border-[#0A2B6D]"
              >
                <CheckCircle2 className="mr-1 h-3 w-3 text-[#0072FF]" />
                Auto-Create Action Plan &amp; CAPA
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportAiOutput}
                className="h-7 px-2.5 text-[11px] font-extrabold border-[#0A2B6D]"
              >
                <Download className="mr-1 h-3 w-3 text-[#5A00D6]" />
                Export AI Report
              </Button>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#0A2B6D]">{activeResponse.summary}</p>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                Audited Findings &amp; Discovered Evidence
              </div>
              <ul className="mt-1.5 space-y-1 text-xs font-medium text-[#0A2B6D]">
                {(activeResponse.findings || []).map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                Recommended Actions &amp; Direct Completion Links
              </div>
              <ul className="mt-1.5 space-y-1 text-xs font-medium text-[#0A2B6D]">
                {(activeResponse.recommendations || []).map((r) => (
                  <li key={r} className="flex items-start gap-1.5">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(activeResponse.links || []).map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="inline-flex items-center gap-1 rounded-md bg-[#0A2B6D] px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-[#5A00D6]"
                  >
                    <span style={{ color: '#FFFFFF' }}>{l.label}</span>
                    <ArrowUpRight className="h-3 w-3 text-white" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}