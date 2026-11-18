import {
  LayoutDashboard, UserPlus, FolderOpen, Vault, Users, Heart, LayoutPanelTop, Sparkles, UserCircle,
  Megaphone, AlertTriangle, ShieldAlert, ShieldCheck, GraduationCap, BadgeCheck,
  Boxes, CalendarClock, FileSpreadsheet, Target, Siren, CalendarDays, UsersRound,
  ReceiptText, Wrench, MapPin, HeartHandshake, Building2, Newspaper, Landmark,
  UserCog, Handshake, BarChart3, Briefcase, ShoppingCart, KanbanSquare,
  ClipboardList, MessageSquare, Lightbulb, LifeBuoy, BookOpen, Bot, ClipboardCheck, Activity, TrendingUp,
  Sun, Inbox, Layers, FileCheck2, Network, Stethoscope, Crown, GitBranch, Gavel, Workflow,
} from 'lucide-react';

// Single source of truth for every module in the app: the sidebar, bottom nav and
// the dashboard module hub all read this list so nothing can go missing again.
const CANONICAL_MODULES = [
  { key: 'today', label: 'Administration Workspace', path: '/today', icon: Sun, group: '1. My Workspace', blurb: 'Daily administration workspace: morning brief, emails, roster, invoices, NDIS updates, compliance job, to-dos and team.' },
  { key: 'team-leader', label: 'Team Leader Workspace', path: '/team-leader', icon: Sparkles, group: '1. My Workspace', blurb: 'Team leader workspace: escalations, shift notes, who is on shift, roster cover, highlights, calculator and handover notes.' },
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: '1. My Workspace', blurb: 'Executive Dashboard, Subscriptions, Communication, Mailbox, Live Roster, Briefings, Meetings, Feedback & Shared To-Do in one hub.' },
  { key: 'enterprise-os', label: 'Enterprise OS', path: '/enterprise-os', icon: Layers, group: '1. My Workspace', blurb: 'Every operating system in one console: capability coverage, the modules that serve it, live registers, role workspaces, gaps and roadmap.' },
  { key: 'communications', label: 'Communication', path: '/communications', icon: Megaphone, group: '5. Communication & Engagement', blurb: 'Unified Communication, Mailbox, Live Roster, Merged Tasks & Shared To-Do Lists.' },
  { key: 'daily-briefing', label: 'Daily Briefing', path: '/briefing', icon: Newspaper, group: '1. My Workspace', blurb: 'Daily organisational briefing, operational priorities and executive updates.' },
  { key: 'meetings', label: 'Meetings', path: '/meetings', icon: CalendarDays, group: '5. Communication & Engagement', blurb: 'Meetings, agenda assistant, templates, minutes and action item tracking.' },
  { key: 'feedback', label: 'Feedback & Surveys', path: '/feedback', icon: MessageSquare, group: '5. Communication & Engagement', blurb: 'Feedback register, complaint routing and branded surveys.' },
  { key: 'operations-centre', label: 'Operations Centre', path: '/operations-centre', icon: Sparkles, group: '9. Governance & Operations', blurb: 'Executive intelligence, executive reports, 1-click operations, Core Engine and 2026 printable templates.' },
  { key: 'suggestions-hub', label: 'Suggestions Hub', path: '/suggestions', icon: Sparkles, group: '9. Governance & Operations', blurb: 'AI review of every module: what to visualise, automate and refine.' },
  { key: 'assistant', label: 'AI Assistant', path: '/assistant', icon: Bot, group: '1. My Workspace', blurb: 'Talk to the compliance, rostering, receipts and personal AI assistants.' },

  { key: 'my-profile', label: 'My Profile', path: '/my-profile', icon: UserCircle, group: '1. My Workspace', blurb: 'Your profile, work, documents, payroll and name tag in one place.' },
  { key: 'intake', label: 'Intake Centre', path: '/intake', icon: UserPlus, group: '2. People & Intake', blurb: 'Participant and employee intake forms, reviews and onboarding conversions.' },
  { key: 'our-staff', label: 'Employee Profiles', path: '/our-employees', icon: Users, group: '2. People & Intake', blurb: 'Main employee records, documents, screening, forms, progress and connected modules.' },
  { key: 'our-participants', label: 'Participant Profiles', path: '/our-participants', icon: Heart, group: '2. People & Intake', blurb: 'Main participant records, plans, documents, forms, goals and connected modules.' },
  { key: 'visual-boards', label: 'Visual Boards', path: '/visual-boards', icon: LayoutPanelTop, group: '3. Service Delivery', blurb: 'Accessible routines, communication boards, sign prompts and translators.' },
  { key: 'key-contacts', label: 'Key Personnel Contacts', path: '/key-contacts', icon: UserCog, group: '2. People & Intake', blurb: 'Personnel profiles and delegated authority registers.' },
  { key: 'volunteering-placements', label: 'Volunteering & Placements', path: '/volunteers', icon: Handshake, group: '2. People & Intake', blurb: 'Volunteer and student onboarding, screening and placement records.' },
  { key: 'users', label: 'Users & Permissions', path: '/users', icon: UsersRound, group: '10. Administration & Help', blurb: 'User accounts, permission matrix, archived users and activity log.' },

  { key: 'rostering', label: 'Rostering', path: '/rostering', icon: CalendarClock, group: '3. Service Delivery', blurb: 'Shift calendar, patterns, availability, approvals, payroll and ICS feeds.' },
  { key: 'goals', label: 'Goals', path: '/goals', icon: Target, group: '3. Service Delivery', blurb: 'Goals, progress notes grouped by goal, insights and AI coaching.' },
  { key: 'tasks', label: 'Tasks', path: '/tasks', icon: ClipboardList, group: '1. My Workspace', blurb: 'Tasks, board view, reminders, leaderboards and completion records.' },
  { key: 'approvals', label: 'Approval Inbox', path: '/approvals', icon: Inbox, group: '1. My Workspace', blurb: 'Everything waiting for your sign-off, with signatures and a full record. Nobody approves their own work.' },
  { key: 'programs', label: 'Programs & Events', path: '/programs', icon: Handshake, group: '3. Service Delivery', blurb: 'Programs, events, ad builder, invites and survey collection.' },
  { key: 'frontline-hub', label: 'Frontline Rapid Hub', path: '/frontline-hub', icon: ClipboardCheck, group: '3. Service Delivery', blurb: 'Mobile-first My Day dashboard, Finish My Shift 7-gate check, Voice-to-Text and smart checklists.' },
  { key: 'workforce-presence', label: 'Attendance & Availability', path: '/workforce-presence', icon: Siren, group: '4. Workforce & Training', blurb: 'Unified site attendance, visitor & contractor registers, live occupancy and emergency roll call.' },

  { key: 'incidents', label: 'Incidents', path: '/incidents', icon: AlertTriangle, group: '6. Incidents, Risk & Safety', blurb: 'Incident reporting, investigations, health responses and kanban tracking.' },
  { key: 'incident-analytics', label: 'Incident Analytics', path: '/incident-analytics', icon: Activity, group: '6. Incidents, Risk & Safety', blurb: 'Charts of incident trends by category and by staff, to target support where it is needed.' },
  { key: 'risks', label: 'Risk Management', path: '/risks', icon: ShieldAlert, group: '6. Incidents, Risk & Safety', blurb: 'Risk reports, hazards, near misses, assessments and treatment controls.' },
  { key: 'emergency-response', label: 'Emergency Response', path: '/emergency-response', icon: Siren, group: '6. Incidents, Risk & Safety', blurb: 'Live alerts, quick dial, plans, emergency drills, WHS safety checks and visitor logs.' },
  { key: 'equipment-manuals', label: 'Equipment Manuals & MSDS', path: '/equipment-manuals', icon: Wrench, group: '6. Incidents, Risk & Safety', blurb: 'Equipment manuals, operating instructions and chemical MSDS library.' },

  { key: 'compliance', label: 'Compliance & Evidence', path: '/compliance', icon: ShieldCheck, group: '7. Compliance, Quality & Documents', blurb: 'Merged Compliance Centre, Business Analytics, checklists, audit management, file matrices, KPIs and board exports.' },
  { key: 'evidence', label: 'Evidence OS', path: '/evidence', icon: FileCheck2, group: '7. Compliance, Quality & Documents', blurb: 'The assurance chain: every control traced from standard to evidence to finding, with coverage scoring and verified evidence only.' },
  { key: 'assurance-matrix', label: 'Assurance Audit Matrix', path: '/assurance-matrix', icon: Layers, group: '7. Compliance, Quality & Documents', blurb: '356 audit checkpoints traced to 150 indicators, 50 controls and 350 evidence requirements, scored from the live registers with weighted criticality and compliance ratings.' },
  { key: 'workflow-studio', label: 'Workflow Studio', path: '/workflows', icon: GitBranch, group: '9. Governance & Operations', blurb: 'The orchestration layer: 33 node types, enterprise templates, a graph designer with validation, a runtime engine that assigns each step by role, enforces SLAs and records every action.' },
  { key: 'ai-os', label: 'AI Intelligence OS', path: '/ai-os', icon: Sparkles, group: '7. Compliance, Quality & Documents', blurb: 'Governed copilots over the registers, with explainable recommendations, confidence scoring and an AI audit trail.' },
  { key: 'knowledge-graph', label: 'Knowledge Graph OS', path: '/knowledge-graph', icon: Network, group: '7. Compliance, Quality & Documents', blurb: 'Every register in one graph: typed relationships, the 14-stage compliance DNA and per-standard traceability scored from the records you hold.' },
  { key: 'decision-intelligence', label: 'Decision Intelligence OS', path: '/decision-intelligence', icon: Gavel, group: '7. Compliance, Quality & Documents', blurb: 'Governed decisions with their evidence, approval authority, risk and measured outcomes, kept as records rather than recollection.' },
  { key: 'v8000-command', label: 'V8000 Evidence Fabric', path: '/v8000', icon: Layers, group: '7. Compliance, Quality & Documents', blurb: 'The V8000 foundation: framework-to-outcome evidence fabric, readiness, trust, gap and review calculations from stored records, validation findings and the nine dashboard entry points.' },
  { key: 'compliance-operations', label: 'Compliance Operations OS', path: '/compliance-operations', icon: ShieldCheck, group: '7. Compliance, Quality & Documents', blurb: 'Autonomous assessments, gap analysis, control testing and remediation plans built from the standards, controls and evidence you hold.' },
  { key: 'digital-twin', label: 'Digital Twin OS', path: '/digital-twin', icon: Boxes, group: '7. Compliance, Quality & Documents', blurb: 'Versioned twin models, approved scenarios and simulation runs that estimate what a change would do, with every figure labelled an estimate and traced to the records behind it.' },
  { key: 'automation-fabric', label: 'Automation Fabric', path: '/automation-fabric', icon: Workflow, group: '7. Compliance, Quality & Documents', blurb: 'Event catalogue, subscriptions, orchestration rules and connectors that route validated events into existing published workflows, with attempts, retries, dead letters and a redacted delivery history.' },
  { key: 'ai-workforce', label: 'AI Workforce OS', path: '/ai-workforce', icon: Bot, group: '7. Compliance, Quality & Documents', blurb: 'Tenant-scoped models, agents, versioned prompts, tool policies and human review: every AI proposal traced to the versions that produced it, redacted before storage, and settled by a named person.' },
  { key: 'enterprise-strategy', label: 'Enterprise Strategy OS', path: '/enterprise-strategy', icon: Target, group: '7. Compliance, Quality & Documents', blurb: 'Strategy and transformation in one workspace: portfolios, programs, objectives and benefits rolled up from real measures, capability maturity proven by validated assessments, and versioned roadmaps approved by a person.' },
  { key: 'clinical-os', label: 'Clinical & Allied Health OS', path: '/clinical-os', icon: Stethoscope, group: '3. Service Delivery', blurb: 'Care plans, review dates, consent, restrictive practice and allied health referrals in one clinical register.' },
  { key: 'board-ceo', label: 'Board & CEO Copilots', path: '/board-ceo', icon: Crown, group: '9. Governance & Operations', blurb: 'Board and CEO assurance briefings from the recorded position, with the resolutions that record what was decided.' },
  { key: 'approval-engine', label: 'Approval Chains', path: '/approval-engine', icon: GitBranch, group: '1. My Workspace', blurb: 'Up to five signed levels per decision: expenditure, policy, risk acceptance, clinical and access approvals.' },
  { key: 'auditor-portal', label: 'Auditor Portal', path: '/auditor-portal', icon: ClipboardCheck, group: '7. Compliance, Quality & Documents', blurb: 'Live read-only collaboration view for auditors: evidence, audits, corrective actions and observations.' },
  { key: 'documents', label: 'Documents & Policies', path: '/documents', icon: FolderOpen, group: '7. Compliance, Quality & Documents', blurb: 'Every Document, 45 Master Registers, Universal Storage & Export, Record Intelligence, 2026 Templates & Company Safe.' },
  { key: 'remote-access', label: 'Remote Access', path: '/remote-access', icon: ShieldCheck, group: '10. Administration & Help', blurb: 'Remote access without the headaches: Zero-Trust browser access, MFA perimeter and managed VPN rules.' },
  { key: 'quality', label: 'Quality & Improvement', path: '/quality', icon: Lightbulb, group: '7. Compliance, Quality & Documents', blurb: 'Continuous improvement register, CAPA corrective/preventive actions and quality reviews.' },
  { key: 'checklists', label: 'Checklists', path: '/checklists', icon: ClipboardCheck, group: '7. Compliance, Quality & Documents', blurb: 'Compliance checklists, assessments, sign-offs and evidence verification.' },
  { key: 'review-due', label: 'Review Due Board', path: '/review-due', icon: CalendarClock, group: '7. Compliance, Quality & Documents', blurb: 'Upcoming and overdue compliance, policy, plan and document reviews.' },
  { key: 'user-success', label: 'Evidence & Guidance', path: '/user-success', icon: Sparkles, group: '7. Compliance, Quality & Documents', blurb: 'Personalised role workspaces, automatic 5-point evidence stamp, Manager Review Mode & Audit Mode.' },

  { key: 'training', label: 'Training Centre', path: '/training', icon: GraduationCap, group: '4. Workforce & Training', blurb: 'Learning academy, curriculum, LMS, competency management, skills matrix, learning pathways and workforce development.' },
  { key: 'certificates', label: 'Certificates', path: '/certificates', icon: BadgeCheck, group: '4. Workforce & Training', blurb: 'Participant journey, staff journey, employee recognition leaderboard and my certificates in one place.' },

  { key: 'invoicing', label: 'Invoicing Centre', path: '/invoicing', icon: FileSpreadsheet, group: '8. Finance, Assets & Growth', blurb: 'NDIS invoicing, funding management, revenue intelligence and payroll reports.' },
  { key: 'quotes', label: 'Quote Centre', path: '/quotes', icon: Landmark, group: '8. Finance, Assets & Growth', blurb: 'Quotes, live branded preview, win-rate analytics and re-issue workflows.' },
  { key: 'receipts', label: 'Receipt Hub', path: '/receipts', icon: ReceiptText, group: '8. Finance, Assets & Growth', blurb: 'Receipt scanning to PDF, reconciliation, reimbursement and exports.' },
  { key: 'procurement', label: 'Procurement', path: '/procurement', icon: ShoppingCart, group: '8. Finance, Assets & Growth', blurb: 'Suppliers, purchase orders, receipts-to-assets and stock tracking.' },
  { key: 'assets', label: 'Asset Management', path: '/assets', icon: Boxes, group: '8. Finance, Assets & Growth', blurb: 'Asset register, maintenance, compliance reviews and disposal records.' },

  { key: 'human-resources', label: 'HR Hub', path: '/hr', icon: UsersRound, group: '4. Workforce & Training', blurb: 'Contracts, position descriptions, performance reviews, leave management, onboarding, offboarding and recognition.' },

  { key: 'crm', label: 'CRM & Leads', path: '/crm', icon: Briefcase, group: '8. Finance, Assets & Growth', blurb: 'Lead pipeline, provider relationships, support coordinators, business development and conversion tracking.' },
  { key: 'community-referral', label: 'Referrals', path: '/referrals', icon: HeartHandshake, group: '2. People & Intake', blurb: 'Referrals, crisis information, local services, community contacts and referral PDFs.' },

  { key: 'governance', label: 'Governance Layer', path: '/governance', icon: ShieldCheck, group: '9. Governance & Operations', blurb: 'Universal object lifecycle, acknowledgement centre, automatic register updates and one-click NDIS audit pack.' },
  { key: 'projects', label: 'Projects Hub', path: '/projects', icon: KanbanSquare, group: '9. Governance & Operations', blurb: 'Business projects, governance hub, board packs, strategic planning, corporate reporting and KPI framework.' },

  { key: 'ndis-provider', label: 'NDIS Provider Portal', path: '/ndis-portal', icon: Building2, group: '7. Compliance, Quality & Documents', blurb: 'Provider registration details, practice standards, registration groups, obligations and audit readiness.' },
  { key: 'ndis-news', label: 'NDIS Updates & News', path: '/ndis-updates', icon: Newspaper, group: '10. Administration & Help', blurb: 'Automated NDIS news, pricing updates and regulatory deadline tracking.' },

  { key: 'community-council', label: 'Community Council Hub', path: '/community-council', icon: MapPin, group: '5. Communication & Engagement', blurb: 'Local council lookup, community networks, accessibility services, crisis support and resource library.' },

  { key: 'help', label: 'Help Centre', path: '/help', icon: LifeBuoy, group: '10. Administration & Help', blurb: 'Support centre, AI troubleshooter, system health and support desk.' },
];

// Version 3.0 navigation reuses existing modules and routes. Shortcuts do not grant access.
export const NAV_GROUPS = [
  {
    "id": "ai-core",
    "label": "AI Core",
    "keys": [
      "assistant",
      "suggestions-hub"
    ]
  },
  {
    "id": "my-workspace",
    "label": "My Workspace",
    "keys": [
      "dashboard",
      "today",
      "team-leader",
      "my-profile",
      "daily-briefing",
      "tasks",
      "approvals",
      "approval-engine",
      "communications",
      "feedback",
      "community-council"
    ]
  },
  {
    "id": "enterprise-os",
    "label": "Enterprise OS",
    "parent": "Operating Systems",
    "keys": [
      "enterprise-os"
    ]
  },
  {
    "id": "strategy-os",
    "label": "Strategy & Transformation OS",
    "parent": "Operating Systems",
    "keys": [
      "enterprise-strategy"
    ]
  },
  {
    "id": "governance-os",
    "label": "Governance OS",
    "parent": "Operating Systems",
    "keys": [
      "governance",
      "workflow-studio",
      "projects",
      "board-ceo",
      "meetings",
      "key-contacts",
      "operations-centre"
    ]
  },
  {
    "id": "compliance-os",
    "label": "Compliance OS",
    "parent": "Operating Systems",
    "keys": [
      "compliance",
      "evidence",
      "assurance-matrix",
      "ai-os",
      "knowledge-graph",
      "decision-intelligence",
      "v8000-command",
      "compliance-operations",
      "digital-twin",
      "automation-fabric",
      "ai-workforce",
      "quality",
      "checklists",
      "review-due",
      "user-success",
      "ndis-provider"
    ]
  },
  {
    "id": "risk-os",
    "label": "Risk OS",
    "parent": "Operating Systems",
    "keys": [
      "risks",
      "incidents",
      "emergency-response",
      "equipment-manuals"
    ]
  },
  {
    "id": "audit-os",
    "label": "Audit OS",
    "parent": "Operating Systems",
    "keys": [
      "auditor-portal"
    ],
    "shortcuts": [
      {
        "key": "audit-management",
        "label": "Audit Management",
        "path": "/compliance?tab=audits",
        "permissionKey": "compliance"
      }
    ]
  },
  {
    "id": "workforce-os",
    "label": "Workforce OS",
    "parent": "Operating Systems",
    "keys": [
      "our-staff",
      "human-resources",
      "rostering",
      "frontline-hub",
      "workforce-presence",
      "training",
      "certificates",
      "volunteering-placements"
    ]
  },
  {
    "id": "clinical-governance-os",
    "label": "Clinical & Allied Health OS",
    "parent": "Operating Systems",
    "keys": [
      "clinical-os"
    ],
    "description": "Care plans, review dates, consent, restrictive practice, allied health referrals and the clinical copilots over them."
  },
  {
    "id": "allied-health-os",
    "label": "Allied Health OS",
    "parent": "Operating Systems",
    "keys": [
      "our-participants",
      "intake",
      "community-referral",
      "goals",
      "visual-boards",
      "programs"
    ],
    "description": "Existing participant and support workspaces. Discipline workflows remain part of Release 8.",
    "shortcuts": [
      {
        "key": "allied-health-catalogue",
        "label": "Allied Health Catalogue",
        "path": "/documents?tab=registers-hub",
        "permissionKey": "documents"
      }
    ]
  },
  {
    "id": "enterprise-registers",
    "label": "Enterprise Registers",
    "keys": [
      "documents",
      "assets",
      "procurement",
      "invoicing",
      "quotes",
      "receipts",
      "crm"
    ],
    "shortcuts": [
      {
        "key": "master-registers",
        "label": "Master Registers",
        "path": "/documents?tab=registers-hub",
        "permissionKey": "documents"
      }
    ]
  },
  {
    "id": "reports-analytics",
    "label": "Reports & Analytics",
    "keys": [
      "analytics",
      "incident-analytics"
    ],
    "shortcuts": [
      {
        "key": "executive-dashboards",
        "label": "Executive Dashboards",
        "path": "/executive-dashboards",
        "permissionKey": "analytics"
      }
    ]
  },
  {
    "id": "administration",
    "label": "Administration",
    "keys": [
      "users",
      "remote-access",
      "ndis-news",
      "help"
    ]
  }
];

export const MODULE_DIRECTORY = [...CANONICAL_MODULES,
  { key: 'analytics', label: 'Reports & Analytics', path: '/analytics', icon: BarChart3, blurb: 'Existing reporting and analytics workspace.' },
].map((module) => ({ ...module, group: NAV_GROUPS.find((group) => group.keys.includes(module.key))?.label || module.group }));

export function buildNavigationGroups(directory = MODULE_DIRECTORY, groups = NAV_GROUPS, { includePlanned = false } = {}) {
  const byKey = new Map(directory.map((module) => [module.key, module]));
  return groups.map((group) => {
    const children = group.keys.map((key) => byKey.get(key)).filter(Boolean)
      .map((module) => ({ ...module, sub: module.blurb }));
    const shortcuts = (group.shortcuts || []).filter((item) => byKey.has(item.permissionKey))
      .map((item) => ({ ...item, icon: byKey.get(item.permissionKey).icon, sub: 'Open existing workspace' }));
    if (!children.length && !shortcuts.length && !(includePlanned && group.planned)) return null;
    return { ...group, path: children[0]?.path || shortcuts[0]?.path, icon: children[0]?.icon || shortcuts[0]?.icon,
      sub: group.description || children.map((module) => module.label).join(', '), children: [...children, ...shortcuts] };
  }).filter(Boolean);
}