import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Palette, HeartHandshake, Award,
  Flame, Database, Building2, CheckCircle2, ArrowUpRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PROMPT_ARCHITECTURES = [
  {
    id: 'prompt-1',
    code: 'PROMPT 1',
    title: 'Organisation Health & Executive Score Framework',
    status: 'Implemented & Live Above',
    icon: ShieldCheck,
    route: '/operations-centre',
    summary:
      '5 Executive Scores (Organisation Health, Compliance, Workforce, Risk, Quality) with mathematical formulas, configurable weightings (ExecutiveScoreConfig), historical snapshots (ExecutiveScoreSnapshot), threshold bands, and click-to-drill-down record inspection.',
    entities: ['ExecutiveScoreConfig', 'ExecutiveScoreSnapshot', 'AuditLog', 'DocumentControl', 'Checklist', 'InternalAudit', 'StaffProfile', 'EmployeeDocument', 'Risk', 'Incident', 'QualityItem', 'Complaint'],
    deliverables: [
      'Live weighted formulas across 16 sub-indicators',
      'Click any score card to inspect formula, weights, live records, trends & audit history',
      'Point-in-time snapshot capture & CSV/Board report export',
    ],
  },
  {
    id: 'prompt-2',
    code: 'PROMPT 2',
    title: 'Universal360 Operational Record Framework',
    status: 'Active in 360° Profiles Tab',
    icon: Users,
    route: '/operations-centre',
    summary:
      'Complete 19-pane zero-hop 360° view across Participant, Employee, Contractor, Volunteer, Supplier, Asset, Incident, Complaint, Risk, and Audit records with automated cross-entity linkage.',
    entities: ['ParticipantProfile', 'StaffProfile', 'Volunteer', 'Supplier', 'Asset', 'Incident', 'Complaint', 'Risk', 'InternalAudit', 'GovernanceObject'],
    deliverables: [
      '19-section Universal360 layout (Overview, Related Docs, Tasks, Risks, Incidents, Complaints, Meetings, Comms, Workflow, Audit Trail)',
      'Universal Link Engine deriving relationships by shared participant, staff, standard & subject',
      '1-click review task & audit log creation from any 360° record',
    ],
  },
  {
    id: 'prompt-3',
    code: 'PROMPT 3',
    title: 'Enterprise White-Label & Multi-Brand Framework',
    status: 'Architecture Specification & Branding Store',
    icon: Palette,
    route: '/company-safe',
    summary:
      'Tenant-level customisation of business/trading names, primary/secondary logos, 8-colour palette tokens, login/dashboard branding, and branded PDF/email templates.',
    entities: ['BusinessDetails', 'InvoiceTemplateSettings', 'HrTemplate', 'FormTemplate'],
    deliverables: [
      'Dynamic CSS token mapping (--primary, --brand, --header-gradient) & companyBranding helper',
      'Branded A4 PDF generators for Board Reports, Audit Packs, Certificates, Invoices & Payslips',
      'MJML email templates aligned with organisation logo & live domain',
    ],
  },
  {
    id: 'prompt-4',
    code: 'PROMPT 4',
    title: 'Family, Guardian & Participant Portal Framework',
    status: 'Consent-Gated RLS & Portal Views',
    icon: HeartHandshake,
    route: '/our-participants',
    summary:
      'Role-isolated and consent-controlled access for Participants, Guardians, Nominees, and Advocates covering support plans, goals, documents, fillable forms, and feedback.',
    entities: ['ParticipantProfile', 'InformationSharingConsent', 'ParticipantDocument', 'Goal', 'Feedback', 'Complaint', 'ProfilePortalInvitation'],
    deliverables: [
      'Granular InformationSharingConsent engine (19 consent categories, expiry, digital signatures, withdrawal tracking)',
      'Participant & Advocate portal views with strict RLS enforcement',
      'Public & authenticated feedback/complaint intake channels',
    ],
  },
  {
    id: 'prompt-5',
    code: 'PROMPT 5',
    title: 'Governance & Board Management Framework',
    status: 'Active in Governance Layer & Meetings',
    icon: Award,
    route: '/governance',
    summary:
      'Board & Committee management, Delegations of Authority, Conflict of Interest declarations, Strategic KPIs, NDIS Practice Standards mapping, and 1-click NDIS Audit Pack.',
    entities: ['GovernanceObject', 'DocumentControl', 'AuthorityDeclaration', 'Meeting', 'MeetingRecord', 'MeetingActionRecord', 'KPI'],
    deliverables: [
      '11-stage Governance Lifecycle Chain (Policy → Improvement)',
      'AuthorityDeclaration register for Financial/Governance delegations & Conflicts of Interest',
      'Board Meeting Centre with agendas, minutes, attendance, and action tracking',
    ],
  },
  {
    id: 'prompt-6',
    code: 'PROMPT 6',
    title: 'Business Continuity, Emergency & Disaster Recovery',
    status: 'Active in Emergency & Presence Centres',
    icon: Flame,
    route: '/emergency-response',
    summary:
      'Emergency response plans, evacuation drill register, live site roll-call accountability (VisitorLog), critical safety checks, and emergency resource directories.',
    entities: ['EmergencyDrill', 'EmergencyDocument', 'EmergencyResource', 'VisitorLog', 'SafetyCheck'],
    deliverables: [
      'Live site presence & emergency roll-call status (Present, Accounted For, Not Accounted For)',
      'Emergency drill scheduling, completion grading & corrective actions',
      'Critical incident escalation & WHS/NDIS regulator notification tracking',
    ],
  },
  {
    id: 'prompt-7',
    code: 'PROMPT 7',
    title: 'Universal Register Engine (45 Master Registers)',
    status: 'Active in Registers Hub',
    icon: Database,
    route: '/registers',
    summary:
      'Unified register architecture indexing Risk, Incident, Complaint, Audit, Staff, Training, Asset, Participant, Consent, and Document Control registers with search, filters, and CSV/PDF export.',
    entities: ['Register', 'RegisterNote', 'Risk', 'Incident', 'Complaint', 'InternalAudit', 'Asset', 'StaffProfile', 'ParticipantProfile'],
    deliverables: [
      'Dynamic register health checks & gap identification',
      'Standardised search, status filtering, and CSV/PDF register exports',
      'Auto-linked register entries from frontline forms and workflows',
    ],
  },
  {
    id: 'prompt-8',
    code: 'PROMPT 8',
    title: 'Multi-Tenant Enterprise SaaS & Security Architecture',
    status: 'RBAC + RLS Enforced Across 150+ Entities',
    icon: Building2,
    route: '/users',
    summary:
      '15-role RBAC hierarchy, entity-level Row-Level Security (RLS) with auditor consent gates, immutable AuditLog tracking, and multi-site/department scoping.',
    entities: ['User', 'AuditLog', 'DataBreach', 'ArchivedUser', 'BusinessDetails'],
    deliverables: [
      'Role-based navigation & route guards (RoleGate) across all 13 enterprise groups',
      'Auditor visibility gated by explicit participant/employee audit_consent fields',
      'Site, department, and program scoping fields across core operational entities',
    ],
  },
];

const MASTER_AUDIT_SECTIONS = {
  gaps: [
    { area: 'Executive Scoring Persistence', gap: 'Previously displayed static or unassessed placeholders without stored weightings or historical trend snapshots.', resolution: 'CLOSED — Added ExecutiveScoreConfig & ExecutiveScoreSnapshot entities + live calculation engine.' },
    { area: 'Multi-Tenant Organisation ID Isolation', gap: 'Tenant and TenantMembership schemas exist, but there are no tenant records or membership records; core entities and branding remain unscoped.', resolution: 'IN PROGRESS — Foundation schemas only. Before activation, duplicate the app, map the existing provider, plan a complete record backfill, add server-side tenant context and RLS/query filters, then verify cross-tenant denial and rollback.' },
    { area: 'Guardian / Family Dedicated Sub-Role', gap: 'Participants have a dedicated role; Guardians/Nominees currently share Participant portal access via InformationSharingConsent.', resolution: 'BACKLOG (Sprint 2) — Add Guardian/Nominee role view filtered by authorised InformationSharingConsent records.' },
    { area: 'BCP / DR System Recovery RTO/RPO Register', gap: 'Emergency drills and site evacuation are live; IT system RTO/RPO recovery testing register can be expanded.', resolution: 'BACKLOG (Sprint 3) — Add ContinuitySystemTest register view under Emergency & Governance.' },
  ],
  sprints: [
    { sprint: 'Sprint 1 (Completed Now)', focus: 'Organisation Health & 5 Executive Scores Engine', items: ['ExecutiveScoreConfig & ExecutiveScoreSnapshot schemas', 'Live weighted score calculation across 16 real database metrics', 'Interactive Score Drill-Down Modal (Formula, Weights, Contributing Records, Trends, Audit Trail)'] },
    { sprint: 'Sprint 2 (Next Priority)', focus: 'Universal360 Deep-Link Drawer & Guardian Portal View', items: ['Embed live 19-tab Universal360 drawer directly inside Participant, Staff, Risk & Incident detail pages', 'Add Guardian/Nominee consent-filtered view in Participant Portal'] },
    { sprint: 'Sprint 3', focus: 'Board Pack Compiler & BCP/DR Continuity Register', items: ['One-click consolidated Board Meeting Pack PDF combining Executive Scores, Risk Heatmap, Financials & Open CAPAs', 'IT & Operational Business Continuity RTO/RPO testing tracker'] },
    { sprint: 'Sprint 4', focus: 'Multi-Tenant White-Label Provisioning Console', items: ['Tenant self-service theme & domain configuration screen', 'Automated starter policy/register seeding for new provider tenants'] },
  ],
  readiness: [
    { domain: 'NDIS Practice Standards & SIRS Readiness', rating: 'Strong', notes: 'Full incident reportability (24h/5d), restrictive practices, consents, worker screening, and 1-click NDIS Audit Pack.' },
    { domain: 'Workforce & HRIS Assurance', rating: 'Strong', notes: 'End-to-end intake, credential expiry radar, LMS training, buddy shifts, appraisals, and payroll integration.' },
    { domain: 'Governance, Risk & Quality (GRC)', rating: 'Strong', notes: 'ISO 31000 5×5 risk matrix, document version control, authority delegations, and continuous improvement register.' },
    { domain: 'Executive & Board Intelligence', rating: 'Production-Ready', notes: 'Live, explainable, configurable 5-score framework with historical snapshot tracking and audit logs.' },
    { domain: 'Commercial Multi-Tenant SaaS', rating: 'Single-Tenant Ready / Multi-Site Capable', notes: 'Ready for dedicated provider deployments; multi-org shared database isolation queued in Sprint 2/4.' },
  ],
};

export default function EnterpriseArchitectureMasterBlueprint() {
  const [subTab, setSubTab] = useState('prompts');

  return (
    <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
            Master Architecture &amp; OpenAPI Gap Closure Blueprint
          </span>
          <h3 className="font-editorial text-lg font-extrabold text-[#0A2B6D]">
            8-Prompt Enterprise Architecture &amp; Master Platform Audit
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'prompts', label: 'Prompts 1–8 Technical Specs' },
            { id: 'gaps', label: 'Master Gap Analysis & Backlog' },
            { id: 'sprints', label: 'Sprint Plan & SaaS Readiness' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                subTab === t.id
                  ? 'bg-[#0A2B6D] text-white'
                  : 'border border-slate-200 bg-[#F6F0FF] text-[#0A2B6D] hover:border-[#0072FF]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {subTab === 'prompts' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PROMPT_ARCHITECTURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F6F0FF]/40 p-3.5 space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#5A00D6]">
                      <Icon className="h-4 w-4 text-[#0072FF]" />
                      {item.code}: {item.title}
                    </span>
                    <Badge className="bg-[#0A2B6D] text-white text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-[#0A2B6D]/90">{item.summary}</p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {item.entities.map((e) => (
                      <span
                        key={e}
                        className="rounded border border-[#C084FC]/60 bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#0A2B6D]"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-1 pt-1">
                    {item.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-1.5 text-[11px] font-semibold text-[#0A2B6D]">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0072FF] mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-1">
                  <Link
                    to={item.route}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF] hover:text-[#5A00D6]"
                  >
                    <span>Open Linked Workspace</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'gaps' && (
        <div className="space-y-2.5">
          {MASTER_AUDIT_SECTIONS.gaps.map((g) => (
            <div
              key={g.area}
              className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#0A2B6D]">{g.area}</span>
                <Badge
                  className={
                    g.resolution.startsWith('CLOSED')
                      ? 'bg-[#0072FF] text-white text-[10px]'
                      : 'bg-[#5A00D6] text-white text-[10px]'
                  }
                >
                  {g.resolution.startsWith('CLOSED') ? 'Resolved in Current Build' : 'Prioritised Backlog'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Audit Finding:</strong> {g.gap}
              </p>
              <p className="text-xs font-bold text-[#0A2B6D]">
                <strong>Action / Resolution:</strong> {g.resolution}
              </p>
            </div>
          ))}
        </div>
      )}

      {subTab === 'sprints' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Recommended Sprint Plan
            </div>
            {MASTER_AUDIT_SECTIONS.sprints.map((sp) => (
              <div key={sp.sprint} className="rounded-xl border border-slate-200 bg-[#F6F0FF]/40 p-3 space-y-1">
                <div className="text-xs font-extrabold text-[#0A2B6D]">
                  {sp.sprint} — {sp.focus}
                </div>
                <ul className="space-y-0.5">
                  {sp.items.map((it) => (
                    <li key={it} className="flex items-start gap-1.5 text-[11px] font-semibold text-[#0A2B6D]">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-[#5A00D6] mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Enterprise &amp; Commercial SaaS Readiness Assessment
            </div>
            {MASTER_AUDIT_SECTIONS.readiness.map((r) => (
              <div key={r.domain} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#0A2B6D]">{r.domain}</span>
                  <Badge className="bg-[#0A2B6D] text-white text-[10px]">{r.rating}</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-600">{r.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}