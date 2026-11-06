import {
  LayoutDashboard, UserPlus, FolderOpen, Vault, Users, Heart, LayoutPanelTop, Sparkles, UserCircle,
  Megaphone, AlertTriangle, ShieldAlert, ShieldCheck, GraduationCap, BadgeCheck,
  Boxes, CalendarClock, FileSpreadsheet, Target, Siren, CalendarDays, UsersRound,
  ReceiptText, Wrench, MapPin, HeartHandshake, Building2, Newspaper, Landmark,
  UserCog, Handshake, BarChart3, Briefcase, ShoppingCart, KanbanSquare,
  ClipboardList, MessageSquare, Lightbulb, LifeBuoy, BookOpen, Bot, ClipboardCheck, Activity, TrendingUp,
} from 'lucide-react';

// Single source of truth for every module in the app: the sidebar, bottom nav and
// the dashboard module hub all read this list so nothing can go missing again.
export const MODULE_DIRECTORY = [
  // 1. DASHBOARD & EXECUTIVE COMMAND
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: '1. Dashboard & Executive Command', blurb: 'Live overview of compliance, safety and work across the organisation.' },
  { key: 'operations-centre', label: 'Operations Centre', path: '/operations-centre', icon: Sparkles, group: '1. Dashboard & Executive Command', blurb: 'Executive intelligence, executive reports, 1-click operations, Core Engine and 2026 printable templates.' },
  { key: 'analytics', label: 'Business Analytics', path: '/analytics', icon: BarChart3, group: '1. Dashboard & Executive Command', blurb: 'Business-wide analytics, KPIs, trends, executive reports and growth dashboards.' },
  { key: 'suggestions-hub', label: 'Suggestions Hub', path: '/suggestions', icon: Sparkles, group: '1. Dashboard & Executive Command', blurb: 'AI review of every module: what to visualise, automate and refine.' },
  { key: 'assistant', label: 'AI Assistant', path: '/assistant', icon: Bot, group: '1. Dashboard & Executive Command', blurb: 'Talk to the compliance, rostering, receipts and personal AI assistants.' },
  { key: 'daily-briefing', label: 'Daily Briefing', path: '/briefing', icon: Newspaper, group: '1. Dashboard & Executive Command', blurb: 'Daily organisational briefing, operational priorities and executive updates.' },

  // 2. PEOPLE, INTAKE & PROFILES
  { key: 'my-profile', label: 'My Profile', path: '/my-profile', icon: UserCircle, group: '2. People, Intake & Profiles', blurb: 'Your profile, work, documents, payroll and name tag in one place.' },
  { key: 'intake', label: 'Intake Centre', path: '/intake', icon: UserPlus, group: '2. People, Intake & Profiles', blurb: 'Participant and employee intake forms, reviews and onboarding conversions.' },
  { key: 'our-staff', label: 'Employee Profiles', path: '/our-employees', icon: Users, group: '2. People, Intake & Profiles', blurb: 'Main employee records, documents, screening, forms, progress and connected modules.' },
  { key: 'our-participants', label: 'Participant Profiles', path: '/our-participants', icon: Heart, group: '2. People, Intake & Profiles', blurb: 'Main participant records, plans, documents, forms, goals and connected modules.' },
  { key: 'visual-boards', label: 'Visual Boards', path: '/visual-boards', icon: LayoutPanelTop, group: '2. People, Intake & Profiles', blurb: 'Accessible routines, communication boards, sign prompts and translators.' },
  { key: 'key-contacts', label: 'Key Personnel Contacts', path: '/key-contacts', icon: UserCog, group: '2. People, Intake & Profiles', blurb: 'Personnel profiles and delegated authority registers.' },
  { key: 'volunteering-placements', label: 'Volunteering & Placements', path: '/volunteers', icon: Handshake, group: '2. People, Intake & Profiles', blurb: 'Volunteer and student onboarding, screening and placement records.' },
  { key: 'users', label: 'Users & Permissions', path: '/users', icon: UsersRound, group: '2. People, Intake & Profiles', blurb: 'User accounts, permission matrix, archived users and activity log.' },

  // 3. COMMUNICATIONS & WORKFORCE
  { key: 'communications', label: 'Communication Centre', path: '/communications', icon: Megaphone, group: '3. Communications & Workforce', blurb: 'Diary, inbox, professional email, broadcasts, video calls and AI compose.' },
  { key: 'rostering', label: 'Rostering', path: '/rostering', icon: CalendarClock, group: '3. Communications & Workforce', blurb: 'Shift calendar, patterns, availability, approvals, payroll and ICS feeds.' },
  { key: 'goals', label: 'Goals', path: '/goals', icon: Target, group: '3. Communications & Workforce', blurb: 'Goals, progress notes grouped by goal, insights and AI coaching.' },
  { key: 'tasks', label: 'Tasks', path: '/tasks', icon: ClipboardList, group: '3. Communications & Workforce', blurb: 'Tasks, board view, reminders, leaderboards and completion records.' },
  { key: 'meetings', label: 'Meetings', path: '/meetings', icon: CalendarDays, group: '3. Communications & Workforce', blurb: 'Meetings, agenda assistant, templates, minutes and overdue tracking.' },
  { key: 'programs', label: 'Programs & Events', path: '/programs', icon: Handshake, group: '3. Communications & Workforce', blurb: 'Programs, events, ad builder, invites and survey collection.' },
  { key: 'frontline-hub', label: 'Frontline Rapid Hub', path: '/frontline-hub', icon: ClipboardCheck, group: '3. Communications & Workforce', blurb: 'Mobile-first My Day dashboard, Finish My Shift 7-gate check, Voice-to-Text and smart checklists.' },
  { key: 'workforce-presence', label: 'Workforce Presence Centre', path: '/workforce-presence', icon: Siren, group: '3. Communications & Workforce', blurb: 'Unified site attendance, visitor & contractor registers, live occupancy and emergency roll call.' },

  // 4. INCIDENTS, RISK & SAFETY
  { key: 'incidents', label: 'Incident Clinic', path: '/incidents', icon: AlertTriangle, group: '4. Incidents, Risk & Safety', blurb: 'Incident reporting, investigations, health responses and kanban tracking.' },
  { key: 'incident-analytics', label: 'Incident Analytics', path: '/incident-analytics', icon: Activity, group: '4. Incidents, Risk & Safety', blurb: 'Charts of incident trends by category and by staff, to target support where it is needed.' },
  { key: 'risks', label: 'Risk Reporting', path: '/risks', icon: ShieldAlert, group: '4. Incidents, Risk & Safety', blurb: 'Risk reports, hazards, near misses, assessments and treatment controls.' },
  { key: 'emergency-response', label: 'Emergency Response', path: '/emergency-response', icon: Siren, group: '4. Incidents, Risk & Safety', blurb: 'Live alerts, quick dial, plans, emergency drills, WHS safety checks and visitor logs.' },
  { key: 'equipment-manuals', label: 'Equipment Manuals & MSDS', path: '/equipment-manuals', icon: Wrench, group: '4. Incidents, Risk & Safety', blurb: 'Equipment manuals, operating instructions and chemical MSDS library.' },

  // 5. COMPLIANCE, QUALITY & EVIDENCE
  { key: 'compliance', label: 'Compliance Centre', path: '/compliance', icon: ShieldCheck, group: '5. Compliance, Quality & Evidence', blurb: 'Checklists, audit management, file matrices, expiry scans and full business audit exports.' },
  { key: 'auditor-portal', label: 'Auditor Portal', path: '/auditor-portal', icon: ClipboardCheck, group: '5. Compliance, Quality & Evidence', blurb: 'Live read-only collaboration view for auditors: evidence, audits, corrective actions and observations.' },
  { key: 'documents', label: 'Document Vault', path: '/documents', icon: FolderOpen, group: '5. Compliance, Quality & Evidence', blurb: 'Document register, central routing, uploads and vault exports.' },
  { key: 'company-safe', label: 'Company Safe', path: '/company-safe', icon: Vault, group: '5. Compliance, Quality & Evidence', blurb: 'Submitted forms, business details, branding and completed documents.' },
  { key: 'quality', label: 'Quality & Improvement', path: '/quality', icon: Lightbulb, group: '5. Compliance, Quality & Evidence', blurb: 'Continuous improvement register, CAPA corrective/preventive actions and quality reviews.' },
  { key: 'feedback', label: 'Feedback & Surveys', path: '/feedback', icon: MessageSquare, group: '5. Compliance, Quality & Evidence', blurb: 'Feedback register, complaint routing and branded surveys.' },
  { key: 'checklists', label: 'Checklists', path: '/checklists', icon: ClipboardCheck, group: '5. Compliance, Quality & Evidence', blurb: 'Compliance checklists, assessments, sign-offs and evidence verification.' },
  { key: 'review-due', label: 'Review Due Board', path: '/review-due', icon: CalendarClock, group: '5. Compliance, Quality & Evidence', blurb: 'Upcoming and overdue compliance, policy, plan and document reviews.' },
  { key: 'universal-storage', label: 'Universal Storage & Export Hub', path: '/universal-storage', icon: FolderOpen, group: '5. Compliance, Quality & Evidence', blurb: 'Automatic 6-destination storage, 11-attribute search, 9-way record linking, 7-layer retention and 4-format exports.' },
  { key: 'registers', label: 'Universal Register Hub', path: '/registers', icon: Sparkles, group: '5. Compliance, Quality & Evidence', blurb: '45 auto-updated organisational master registers, 28-source indexing & Register Health Dashboard.' },
  { key: 'user-success', label: 'Evidence & User Success Hub', path: '/user-success', icon: Sparkles, group: '5. Compliance, Quality & Evidence', blurb: 'Personalised role workspaces, automatic 5-point evidence stamp, Manager Review Mode & Audit Mode.' },
  { key: 'record-intelligence', label: 'Record Intelligence & Routing', path: '/record-intelligence', icon: Sparkles, group: '5. Compliance, Quality & Evidence', blurb: 'Single-entry intelligence across 28 record types, 18 auto-extracted signals & 11 Document Hub categories.' },

  // 6. TRAINING & CAPABILITY
  { key: 'training', label: 'Training Centre', path: '/training', icon: GraduationCap, group: '6. Training & Capability', blurb: 'Learning academy, curriculum, LMS, competency management, skills matrix, learning pathways and workforce development.' },
  { key: 'certificates', label: 'Certificates', path: '/certificates', icon: BadgeCheck, group: '6. Training & Capability', blurb: 'Participant journey, staff journey, employee recognition leaderboard and my certificates in one place.' },

  // 7. FINANCE & COMMERCIAL
  { key: 'invoicing', label: 'Invoicing Centre', path: '/invoicing', icon: FileSpreadsheet, group: '7. Finance & Commercial', blurb: 'NDIS invoicing, funding management, revenue intelligence and payroll reports.' },
  { key: 'quotes', label: 'Quote Centre', path: '/quotes', icon: Landmark, group: '7. Finance & Commercial', blurb: 'Quotes, live branded preview, win-rate analytics and re-issue workflows.' },
  { key: 'receipts', label: 'Receipt Hub', path: '/receipts', icon: ReceiptText, group: '7. Finance & Commercial', blurb: 'Receipt scanning to PDF, reconciliation, reimbursement and exports.' },
  { key: 'procurement', label: 'Procurement', path: '/procurement', icon: ShoppingCart, group: '7. Finance & Commercial', blurb: 'Suppliers, purchase orders, receipts-to-assets and stock tracking.' },
  { key: 'assets', label: 'Asset Management', path: '/assets', icon: Boxes, group: '7. Finance & Commercial', blurb: 'Asset register, maintenance, compliance reviews and disposal records.' },

  // 8. HUMAN RESOURCES
  { key: 'human-resources', label: 'HR Hub', path: '/hr', icon: UsersRound, group: '8. Human Resources', blurb: 'Contracts, position descriptions, performance reviews, leave management, onboarding, offboarding and recognition.' },

  // 9. CRM, GROWTH & RELATIONSHIPS
  { key: 'crm', label: 'CRM & Leads', path: '/crm', icon: Briefcase, group: '9. CRM, Growth & Relationships', blurb: 'Lead pipeline, provider relationships, support coordinators, business development and conversion tracking.' },
  { key: 'community-referral', label: 'Referrals', path: '/referrals', icon: HeartHandshake, group: '9. CRM, Growth & Relationships', blurb: 'Referrals, crisis information, local services, community contacts and referral PDFs.' },

  // 10. GOVERNANCE & STRATEGY
  { key: 'governance', label: 'Governance Layer', path: '/governance', icon: ShieldCheck, group: '10. Governance & Strategy', blurb: 'Universal object lifecycle, acknowledgement centre, automatic register updates and one-click NDIS audit pack.' },
  { key: 'projects', label: 'Projects Hub', path: '/projects', icon: KanbanSquare, group: '10. Governance & Strategy', blurb: 'Business projects, governance hub, board packs, strategic planning, corporate reporting and KPI framework.' },

  // 11. NDIS & REGULATORY
  { key: 'ndis-provider', label: 'NDIS Provider Portal', path: '/ndis-portal', icon: Building2, group: '11. NDIS & Regulatory', blurb: 'Provider registration details, practice standards, registration groups, obligations and audit readiness.' },
  { key: 'ndis-news', label: 'NDIS Updates & News', path: '/ndis-updates', icon: Newspaper, group: '11. NDIS & Regulatory', blurb: 'Automated NDIS news, pricing updates and regulatory deadline tracking.' },

  // 12. COMMUNITY & SUPPORT SERVICES
  { key: 'community-council', label: 'Community Council Hub', path: '/community-council', icon: MapPin, group: '12. Community & Support Services', blurb: 'Local council lookup, community networks, accessibility services, crisis support and resource library.' },

  // 13. HELP, KNOWLEDGE & SUPPORT
  { key: 'help', label: 'Help Centre', path: '/help', icon: LifeBuoy, group: '13. Help, Knowledge & Support', blurb: 'Support centre, AI troubleshooter, system health and support desk.' },
];

// Permanent 13-Group Architectural Map: every existing module key appears in exactly one permanent home.
export const NAV_GROUPS = [
  {
    label: '1. Dashboard & Executive Command',
    keys: ['dashboard', 'operations-centre', 'analytics', 'suggestions-hub', 'assistant', 'daily-briefing'],
  },
  {
    label: '2. People, Intake & Profiles',
    keys: ['my-profile', 'intake', 'our-staff', 'our-participants', 'visual-boards', 'key-contacts', 'volunteering-placements', 'users'],
  },
  {
    label: '3. Communications & Workforce',
    keys: ['communications', 'rostering', 'goals', 'tasks', 'meetings', 'programs', 'frontline-hub', 'workforce-presence'],
  },
  {
    label: '4. Incidents, Risk & Safety',
    keys: ['incidents', 'incident-analytics', 'risks', 'emergency-response', 'equipment-manuals'],
  },
  {
    label: '5. Compliance, Quality & Evidence',
    keys: [
      'compliance',
      'auditor-portal',
      'documents',
      'company-safe',
      'quality',
      'feedback',
      'checklists',
      'review-due',
      'universal-storage',
      'registers',
      'user-success',
      'record-intelligence',
    ],
  },
  {
    label: '6. Training & Capability',
    keys: ['training', 'certificates'],
  },
  {
    label: '7. Finance & Commercial',
    keys: ['invoicing', 'quotes', 'receipts', 'procurement', 'assets'],
  },
  {
    label: '8. Human Resources',
    keys: ['human-resources'],
  },
  {
    label: '9. CRM, Growth & Relationships',
    keys: ['crm', 'community-referral'],
  },
  {
    label: '10. Governance & Strategy',
    keys: ['governance', 'projects'],
  },
  {
    label: '11. NDIS & Regulatory',
    keys: ['ndis-provider', 'ndis-news'],
  },
  {
    label: '12. Community & Support Services',
    keys: ['community-council'],
  },
  {
    label: '13. Help, Knowledge & Support',
    keys: ['help'],
  },
];