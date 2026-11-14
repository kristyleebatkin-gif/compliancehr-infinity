import {
  LayoutDashboard, UserPlus, FolderOpen, Vault, Users, Heart, LayoutPanelTop, Sparkles, UserCircle,
  Megaphone, AlertTriangle, ShieldAlert, ShieldCheck, GraduationCap, BadgeCheck,
  Boxes, CalendarClock, FileSpreadsheet, Target, Siren, CalendarDays, UsersRound,
  ReceiptText, Wrench, MapPin, HeartHandshake, Building2, Newspaper, Landmark,
  UserCog, Handshake, BarChart3, Briefcase, ShoppingCart, KanbanSquare,
  ClipboardList, MessageSquare, Lightbulb, LifeBuoy, BookOpen, Bot, ClipboardCheck, Activity, TrendingUp,
  Sun, Link2,
} from 'lucide-react';

// Single source of truth for every module in the app: the sidebar, bottom nav and
// the dashboard module hub all read this list so nothing can go missing again.
export const MODULE_DIRECTORY = [
  { key: 'today', label: 'Administration – Lead (Sherelle)', path: '/today', icon: Sun, group: '1. My Workspace', blurb: 'Sherelle’s daily operations workspace: morning brief, emails, roster, invoices, NDIS updates, compliance job, to-dos and team.' },
  { key: 'team-leader', label: 'Team Leader - Lead (Jamie)', path: '/team-leader', icon: Sparkles, group: '1. My Workspace', blurb: 'Jamie’s team leader workspace: escalations, shift notes, who is on shift, roster cover, highlights, calculator and handover notes.' },
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: '1. My Workspace', blurb: 'Executive Dashboard, Subscriptions, Communication, Mailbox, Live Roster, Briefings, Meetings, Feedback & Shared To-Do in one hub.' },
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
  { key: 'programs', label: 'Programs & Events', path: '/programs', icon: Handshake, group: '3. Service Delivery', blurb: 'Programs, events, ad builder, invites and survey collection.' },
  { key: 'frontline-hub', label: 'Frontline Rapid Hub', path: '/frontline-hub', icon: ClipboardCheck, group: '3. Service Delivery', blurb: 'Mobile-first My Day dashboard, Finish My Shift 7-gate check, Voice-to-Text and smart checklists.' },
  { key: 'workforce-presence', label: 'Attendance & Availability', path: '/workforce-presence', icon: Siren, group: '4. Workforce & Training', blurb: 'Unified site attendance, visitor & contractor registers, live occupancy and emergency roll call.' },

  { key: 'incidents', label: 'Incidents', path: '/incidents', icon: AlertTriangle, group: '6. Incidents, Risk & Safety', blurb: 'Incident reporting, investigations, health responses and kanban tracking.' },
  { key: 'incident-analytics', label: 'Incident Analytics', path: '/incident-analytics', icon: Activity, group: '6. Incidents, Risk & Safety', blurb: 'Charts of incident trends by category and by staff, to target support where it is needed.' },
  { key: 'risks', label: 'Risk Management', path: '/risks', icon: ShieldAlert, group: '6. Incidents, Risk & Safety', blurb: 'Risk reports, hazards, near misses, assessments and treatment controls.' },
  { key: 'emergency-response', label: 'Emergency Response', path: '/emergency-response', icon: Siren, group: '6. Incidents, Risk & Safety', blurb: 'Live alerts, quick dial, plans, emergency drills, WHS safety checks and visitor logs.' },
  { key: 'equipment-manuals', label: 'Equipment Manuals & MSDS', path: '/equipment-manuals', icon: Wrench, group: '6. Incidents, Risk & Safety', blurb: 'Equipment manuals, operating instructions and chemical MSDS library.' },

  { key: 'compliance', label: 'Compliance & Evidence', path: '/compliance', icon: ShieldCheck, group: '7. Compliance, Quality & Documents', blurb: 'Merged Compliance Centre, Business Analytics, checklists, audit management, file matrices, KPIs and board exports.' },
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
  { key: 'connected-workflows', label: 'Connected Workflows', path: '/connected-workflows', icon: Link2, group: '8. Finance, Assets & Growth', blurb: 'Journey gates: billing exceptions, incident follow-up and effectiveness, shift eligibility, document release and acknowledgement.' },
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

// Approved task-based navigation: each module has exactly one home.
export const NAV_GROUPS = [
  {
    "id": "my-workspace",
    "label": "1. My Workspace",
    "keys": [
      "dashboard",
      "today",
      "team-leader",
      "my-profile",
      "daily-briefing",
      "tasks",
      "assistant"
    ]
  },
  {
    "id": "people-intake",
    "label": "2. People & Intake",
    "keys": [
      "intake",
      "our-participants",
      "our-staff",
      "key-contacts",
      "community-referral",
      "volunteering-placements"
    ]
  },
  {
    "id": "service-delivery",
    "label": "3. Service Delivery",
    "keys": [
      "rostering",
      "goals",
      "programs",
      "frontline-hub",
      "visual-boards"
    ]
  },
  {
    "id": "workforce-training",
    "label": "4. Workforce & Training",
    "keys": [
      "human-resources",
      "workforce-presence",
      "training",
      "certificates"
    ]
  },
  {
    "id": "communication-engagement",
    "label": "5. Communication & Engagement",
    "keys": [
      "communications",
      "meetings",
      "feedback",
      "community-council"
    ]
  },
  {
    "id": "incidents-risk-safety",
    "label": "6. Incidents, Risk & Safety",
    "keys": [
      "incidents",
      "incident-analytics",
      "risks",
      "emergency-response",
      "equipment-manuals"
    ]
  },
  {
    "id": "compliance-quality-documents",
    "label": "7. Compliance, Quality & Documents",
    "keys": [
      "compliance",
      "auditor-portal",
      "documents",
      "quality",
      "checklists",
      "review-due",
      "user-success",
      "ndis-provider"
    ]
  },
  {
    "id": "finance-assets-growth",
    "label": "8. Finance, Assets & Growth",
    "keys": [
      "invoicing",
      "quotes",
      "receipts",
      "procurement",
      "assets",
      "crm"
    ]
  },
  {
    "id": "governance-operations",
    "label": "9. Governance & Operations",
    "keys": [
      "governance",
      "operations-centre",
      "projects",
      "suggestions-hub"
    ]
  },
  {
    "id": "administration-help",
    "label": "10. Administration & Help",
    "keys": [
      "users",
      "remote-access",
      "ndis-news",
      "help"
    ]
  }
];

export function buildNavigationGroups(directory = MODULE_DIRECTORY, groups = NAV_GROUPS) {
  const byKey = new Map(directory.map((module) => [module.key, module]));
  return groups.map((group) => {
    const children = group.keys.map((key) => byKey.get(key)).filter(Boolean)
      .map((module) => ({ ...module, sub: module.blurb }));
    if (!children.length) return null;
    return { ...group, path: children[0].path, icon: children[0].icon,
      sub: children.map((module) => module.label).join(', '), children };
  }).filter(Boolean);
}