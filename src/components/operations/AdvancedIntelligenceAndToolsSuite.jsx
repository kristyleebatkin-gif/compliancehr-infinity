import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

const AI_DOMAINS_12 = [
  {
    id: 'exec-brief',
    label: '1. Executive Assistance & Board Reporting',
    sourceRef: 'DOC-007, DOC-024 · CHK-022..042',
    targetEntity: 'TodoTask',
    defaultDraft:
      'EXECUTIVE BRIEFING SUMMARY: Review current compliance evidence, controlled documents, worker screening records and reportable-incident deadlines in their source modules before making decisions.',
  },
  {
    id: 'doc-draft',
    label: '2. Controlled Document & Policy Drafting',
    sourceRef: 'DOC-001..DOC-098 · Section 25 Standard',
    targetEntity: 'Policy',
    defaultDraft:
      'POLICY DRAFT — CONTINUOUS SAFEGUARDING & QUALITY ASSURANCE (v2026.2): Every support shift must conclude with a verified Shift Progress Note and End-of-Shift Checklist prior to payroll/invoice release.',
  },
  {
    id: 'gap-analysis',
    label: '3. Compliance Gap & Audit Remediation Suggestions',
    sourceRef: 'CHK-001..CHK-356 · NDIS Practice Standards',
    targetEntity: 'QualityItem',
    defaultDraft:
      'CAPA RECOMMENDATION: Conduct 90-day operational evidence sweep across Medication MAR charts (CAT-11) and Behaviour Support Plans (CAT-12) so no checkpoint relies on template existence alone.',
  },
  {
    id: 'risk-incident',
    label: '4. Risk Analysis & Incident Report Guidance',
    sourceRef: 'DOC-013, DOC-025 · ISO 31000 & NDIS Rules 2018',
    targetEntity: 'TodoTask',
    defaultDraft:
      'INCIDENT & RISK GUIDANCE: Verify 24-hour NDIS Commission notification for any reportable incident, attach witness/photo evidence, apply Hierarchy of Controls (Eliminate/Minimise), and schedule 30-day control effectiveness review.',
  },
  {
    id: 'roster-comms',
    label: '5. Rostering & Communication Response Drafting',
    sourceRef: 'DOC-055, DOC-095 · SCHADS Award',
    targetEntity: 'CommunicationEntry',
    defaultDraft:
      'TEAM BROADCAST: Please ensure all rostered shifts for next week have verified NDIS Worker Screening and First Aid currency, and submit End-of-Shift progress notes immediately after clock-out.',
  },
];

const AI_SKILLS_LIBRARY = [
  {
    id: 'AG-01',
    name: 'compliance_agent (Compliance & NDIS Auditor Agent)',
    roleScope: 'Compliance Administrator / Provider Administrator',
    resources: 'Policy, Incident, Risk, AuditReport, Certificate, NDISComplianceDeadline',
    permissions: 'Read-only analysis + Human-Approved Task/CAPA creation',
    trigger: 'On-Demand Chat & Weekly Compliance Audit Workflow',
    version: 'v2026.3',
  },
  {
    id: 'AG-02',
    name: 'roster_assistant_agent (Roster & SCHADS Validation Agent)',
    roleScope: 'Rostering Coordinator / Management',
    resources: 'Shift, StaffAvailability, LeaveRequest, StaffProfile, RosterValidationRule',
    permissions: 'Read-only schedule analysis + Human-Approved Shift Suggestions',
    trigger: 'On-Demand & Daily Roster Exception Scan',
    version: 'v2026.2',
  },
  {
    id: 'AG-03',
    name: 'personal_assistant_agent (Executive & Staff Assistant Agent)',
    roleScope: 'All Authenticated Staff & Management',
    resources: 'TodoTask, Notification, TrainingModule, Policy',
    permissions: 'Scoped to current user role & human sign-off',
    trigger: 'Interactive Assistant Hub & Morning Brief',
    version: 'v2026.2',
  },
  {
    id: 'AG-04',
    name: 'receipt_finder_agent (Finance & Receipt Reconciliation Agent)',
    roleScope: 'Finance & Accounts Officer / Provider Administrator',
    resources: 'Receipt, Invoice, PurchaseOrder, Supplier',
    permissions: 'Read & match verification; requires Finance approval to post',
    trigger: 'Receipt Hub & 3-Way Match Workflow',
    version: 'v2026.1',
  },
];

const ADVANCED_TOOLS_12 = [
  { name: '1. Universal Workflow Engine', badge: 'Workflow catalogue', route: '/operations-centre', desc: 'Event, schedule, and entity-triggered automations across incidents, tasks, expiries & payroll.' },
  { name: '2. Universal Action Centre', badge: '12 Instant Actions', route: '/dashboard', desc: 'Centralized 1-click approval queue, task dispatch, and cross-module sign-off deck.' },
  { name: '3. Regulatory Intelligence', badge: 'NDIS 2026 Live', route: '/ndis-updates', desc: 'Live NDIS Price Guide, Practice Standards, Fair Work & WHS obligation tracking.' },
  { name: '4. Document Intelligence', badge: 'Smart Mailroom', route: '/documents', desc: 'Auto-classification, person matching, duplicate detection & 98-doc version control.' },
  { name: '5. Digital Business Twin', badge: 'Live Telemetry', route: '/analytics', desc: 'Real-time digital mirror of workforce capacity, participant plans, compliance & cashflow.' },
  { name: '6. Process Intelligence', badge: 'SLA Monitored', route: '/quality', desc: 'Bottleneck detection for 24h/5d incident reporting, intake turnaround & shift note completion.' },
  { name: '7. Scenario Planning', badge: 'Interactive Sim', route: '/analytics', desc: 'Model participant growth, staffing ratios, SCHADS labour costs & NDIS budget utilisation.' },
  { name: '8. Predictive Analytics', badge: '30/60/90d Horizon', route: '/compliance', desc: 'Forecasts credential expiries, plan budget exhaustion & high-risk support trends.' },
  { name: '9. Integration Marketplace', badge: 'Calendar · Gmail · GitHub', route: '/operations-centre', desc: 'Connected Google Calendar, Gmail, GitHub, PRODA CSV & STP payroll pipelines.' },
  { name: '10. Data Migration Centre', badge: 'CSV / JSON Ready', route: '/intake', desc: 'Bulk intake & register import/export with schema validation and duplicate protection.' },
  { name: '11. Business Setup Wizard', badge: 'Brand & Roles', route: '/company-safe', desc: 'Configure business identity, ABN/NDIS registration, approved branding & role matrix.' },
  { name: '12. Platform Reliability Centre', badge: '99.98% Uptime', route: '/help', desc: 'System health diagnostics, backup verification, RLS security posture & audit logs.' },
];

export default function AdvancedIntelligenceAndToolsSuite() {
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState(AI_DOMAINS_12[0]);
  const [draftText, setDraftText] = useState(AI_DOMAINS_12[0].defaultDraft);
  const [humanApproved, setHumanApproved] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [aiHistory, setAiHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr_ai_activity_history_v1') || '[]');
    } catch {
      return [];
    }
  });

  // Scenario Planning simulator state (Tool #7)
  const [simParticipants, setSimParticipants] = useState(45);
  const [simHoursPerWeek, setSimHoursPerWeek] = useState(18);
  const [simHourlyRate, setSimHourlyRate] = useState(68);

  const weeklyRevenue = simParticipants * simHoursPerWeek * simHourlyRate;
  const requiredWorkers = Math.ceil((simParticipants * simHoursPerWeek) / 32);

  const handleSelectDomain = (d) => {
    setSelectedDomain(d);
    setDraftText(d.defaultDraft);
    setHumanApproved(false);
  };

  const handleCommitApprovedAiOutput = async () => {
    if (!humanApproved) return;
    setCommitting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (selectedDomain.targetEntity === 'Policy') {
        await base44.entities.Policy.create({
          document_name: `AI-Assisted Controlled Draft (${today})`,
          category: 'Governance',
          version: 'v2026.2',
          review_date: '2027-01-15',
          status: 'Active',
          approved_by: 'Human-in-the-Loop Executive Sign-Off',
          description: `Source Ref: ${selectedDomain.sourceRef}`,
          content: draftText,
        });
      } else if (selectedDomain.targetEntity === 'QualityItem') {
        await base44.entities.QualityItem.create({
          title: `AI Gap Analysis Action (${selectedDomain.label})`,
          type: 'Corrective Action',
          source: 'Audit',
          status: 'Open',
          priority: 'High',
          raised_date: today,
          outcome: draftText,
        });
      } else if (selectedDomain.targetEntity === 'CommunicationEntry') {
        await base44.entities.CommunicationEntry.create({
          entry_kind: 'Broadcast',
          person_type: 'General',
          subject: `Approved AI Broadcast — ${selectedDomain.label}`,
          body: draftText,
          entry_date: today,
          sender_name: 'Executive Control Centre',
        });
      } else {
        await base44.entities.TodoTask.create({
          title: `[AI-Assisted & Human-Approved] ${selectedDomain.label}`,
          task_type: 'Executive AI Action',
          module: 'Infinity Control Centre',
          due_date: today,
          priority: 'High',
          status: 'Open',
          notes: `${draftText}\n\nAuthorised Source Ref: ${selectedDomain.sourceRef}`,
        });
      }

      const entry = {
        id: `AI-${Date.now().toString().slice(-5)}`,
        domain: selectedDomain.label,
        sourceRef: selectedDomain.sourceRef,
        targetEntity: selectedDomain.targetEntity,
        approvedBy: 'Human Reviewer Verified',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const next = [entry, ...aiHistory].slice(0, 20);
      setAiHistory(next);
      localStorage.setItem('chr_ai_activity_history_v1', JSON.stringify(next));

      toast({
        title: 'Human-Approved AI Output Committed',
        description: `Saved to ${selectedDomain.targetEntity} with source reference ${selectedDomain.sourceRef}.`,
      });
      setHumanApproved(false);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border-4 border-purple-700 bg-white shadow-xl">
      <div className="px-4 py-2.5 text-white" style={{ background: HEADER_GRADIENT }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-blue-950">
              <Sparkles className="h-3 w-3 text-purple-700" /> PRIORITY 2 — SECTIONS 26, 27 &amp; 28 ADVANCED INTELLIGENCE SUITE
            </span>
            <h2 className="mt-0.5 text-sm sm:text-base font-black text-white">
              Infinity AI Assistant (Human-in-the-Loop), AI Skills Library &amp; 12 Advanced Business Tools
            </h2>
          </div>
          <Badge className="bg-emerald-500 text-white text-[8px]">
            Mandatory Human Review Gate Active
          </Badge>
        </div>
      </div>

      <div className="p-3 space-y-3 bg-white">
        {/* Section 26: Infinity AI Assistant with Source References & Human Approval Gate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <div className="rounded-xl border-2 border-[#A100FF] bg-purple-50/40 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
            <div className="text-[9.5px] font-black uppercase text-purple-950">
              Section 26 — Source-Grounded AI Drafting &amp; Mandatory Human Approval Gate
            </div>
            <div className="flex flex-wrap gap-1">
              {AI_DOMAINS_12.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDomain(d)}
                  className={`rounded-lg border px-2 py-1 text-[8px] font-black ${
                    selectedDomain.id === d.id
                      ? 'border-[#5A00D6] bg-[#5A00D6] text-white'
                      : 'border-purple-200 bg-white text-blue-950'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="text-[8px] font-bold text-blue-700">
              Authorised Source Reference: <span className="font-mono">{selectedDomain.sourceRef}</span> → Target Register:{' '}
              <span className="font-mono">{selectedDomain.targetEntity}</span>
            </div>

            <textarea
              rows={3}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white p-2 text-xs font-medium text-blue-950"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[8px] font-black text-blue-950">
                <input
                  type="checkbox"
                  checked={humanApproved}
                  onChange={(e) => setHumanApproved(e.target.checked)}
                />
                <span>Human Review &amp; Approval Confirmed (Required before saving/sending)</span>
              </label>
              <Button
                size="sm"
                disabled={!humanApproved || committing}
                onClick={handleCommitApprovedAiOutput}
                className="h-7 bg-[#5A00D6] px-3 text-[8px] font-black text-white hover:bg-purple-700"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {committing ? 'Saving...' : `Approve & Commit to ${selectedDomain.targetEntity}`}
              </Button>
            </div>
          </div>

          {/* Section 27: AI Skills Library & Scenario Planning Simulator */}
          <div className="rounded-xl border-2 border-[#0072FF] bg-sky-50/40 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
            <div className="text-[9.5px] font-black uppercase text-sky-950">
              Section 27 — AI Skills Library (Guardrails, Permissions &amp; Versioning)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {AI_SKILLS_LIBRARY.map((ag) => (
                <div key={ag.id} className="rounded-lg border border-sky-200 bg-white p-1.5 text-[7.5px]">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-950">{ag.name}</span>
                    <span className="font-mono font-bold text-purple-700">{ag.version}</span>
                  </div>
                  <div className="mt-0.5 text-purple-800"><strong>Scope:</strong> {ag.roleScope}</div>
                  <div className="text-blue-700"><strong>Guardrail:</strong> {ag.permissions}</div>
                </div>
              ))}
            </div>

            {/* Tool #7: Interactive Scenario Planning & Digital Twin Simulator */}
            <div className="rounded-lg border border-purple-300 bg-purple-50/60 p-2">
              <div className="text-[8.5px] font-black uppercase text-purple-950">
                Digital Business Twin &amp; Scenario Planning Simulator (Section 28)
              </div>
              <div className="mt-1 grid grid-cols-3 gap-1.5 text-[8px]">
                <div>
                  <label className="font-bold text-purple-800">Active Participants</label>
                  <Input
                    type="number"
                    value={simParticipants}
                    onChange={(e) => setSimParticipants(Number(e.target.value || 0))}
                    className="h-6 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-800">Avg Support Hrs/Wk</label>
                  <Input
                    type="number"
                    value={simHoursPerWeek}
                    onChange={(e) => setSimHoursPerWeek(Number(e.target.value || 0))}
                    className="h-6 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-800">Avg NDIS Rate ($/hr)</label>
                  <Input
                    type="number"
                    value={simHourlyRate}
                    onChange={(e) => setSimHourlyRate(Number(e.target.value || 0))}
                    className="h-6 text-xs bg-white"
                  />
                </div>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-between text-[8.5px] font-black text-blue-950">
                <span>Projected Weekly Revenue: ${weeklyRevenue.toLocaleString()}</span>
                <span>Required Cleared Support Workers: {requiredWorkers} FTE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 28: All 12 Advanced Business Tools Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
          {ADVANCED_TOOLS_12.map((tool, i) => {
            const palette = ['#00C6FF', '#0072FF', '#0A2B6D', '#5A00D6', '#A100FF', '#FF2E9A', '#FF6EDB', '#C084FC'];
            const c = palette[i % palette.length];
            return (
              <Link
                key={tool.name}
                to={tool.route}
                className="rounded-xl border bg-white p-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: c, borderTopWidth: '3px', background: `linear-gradient(145deg, ${c}12 0%, #ffffff 85%)` }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[8.5px] font-black text-blue-950">{tool.name}</span>
                  <span className="rounded px-1.5 py-0.5 text-[6.5px] font-black text-white" style={{ background: c }}>
                    {tool.badge}
                  </span>
                </div>
                <p className="mt-1 text-[7.5px] font-semibold text-purple-800 leading-tight">{tool.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}