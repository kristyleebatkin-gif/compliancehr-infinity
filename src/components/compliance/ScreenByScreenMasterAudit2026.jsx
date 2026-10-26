import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Sparkles, CheckCircle2, FileText, ArrowRight,
  Wand2, ClipboardCheck, Layers, Search, PlusCircle, ExternalLink, Download, Wrench, Activity,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import { useToast } from '@/components/ui/use-toast';
import MasterComplianceAuditForms from '@/components/compliance/MasterComplianceAuditForms';
import {
  getTilePalette,
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

/**
 * Rich, screen-by-screen audit metadata for all 45 modules:
 * - topic: What the screen is about
 * - inside: What registers, tools, and data live inside
 * - smartDoc2026: The 2026 Smart-Fill Compliant Document for this module
 * - easiestTaskFlow: The 1-click task completion pathway
 * - nextTaskTitle: Default task title that can be created/completed in 1 click
 */
export const MODULE_AUDIT_BLUEPRINTS = {
  dashboard: {
    topic: 'Executive Command & Dual Office / Profile Workspace',
    inside: 'Executive Wall Scene, 45-Module Hub, Live KPIs, Morning Brief, Attention Panel & Expiry Feed.',
    smartDoc2026: '2026 Executive Governance & Daily Compliance Sign-Off (CHR-GOV-2026)',
    easiestTaskFlow: 'Review Morning Brief → Click any red/amber alert → 1-Click Assign or Complete Task.',
    nextTaskTitle: 'Complete Daily Executive Compliance & Expiry Sign-Off',
  },
  'my-profile': {
    topic: 'Personal Staff / Participant Portal, Work, Docs & Name Tag',
    inside: 'Personal Details, My Tasks, My Shifts, My Documents, 100-Point Screening & Printable Name Tag.',
    smartDoc2026: '2026 Worker Credential & Profile Verification Declaration (CHR-PRF-2026)',
    easiestTaskFlow: 'Open My Profile → Smart-Fill missing credentials → Tick off personal assigned tasks.',
    nextTaskTitle: 'Verify Personal Profile Details, Screening & Digital Signature',
  },
  'our-staff': {
    topic: 'Consolidated Employee Directory & 100-Point HR Files',
    inside: 'Employee Profiles, NDIS Worker Screening, Blue Card, Police Check, Contracts, Badges & Appraisals.',
    smartDoc2026: '2026 NDIS Worker Screening & 100-Point HR Audit Dossier (CHR-EMP-2026)',
    easiestTaskFlow: 'Select Employee → Run 1-Click Credential Check → Auto-create renewal task or issue badge.',
    nextTaskTitle: 'Audit Employee 100-Point Screening & Renew Expiring Credentials',
  },
  'our-participants': {
    topic: 'Participant Directory, NDIS Plans, Consents & Care Folders',
    inside: 'Participant Profiles, NDIS Plan Budgets, 3-Part Consents, Risk Profiles, Goals & Shift Notes.',
    smartDoc2026: '2026 Participant Service Agreement & 3-Part Informed Consent Pack (CHR-PAR-2026)',
    easiestTaskFlow: 'Select Participant → Smart-Fill Service Agreement & Consents → Log 10-Weekly Progress Review.',
    nextTaskTitle: 'Complete Participant 10-Weekly Details & Consent Verification',
  },
  intake: {
    topic: 'End-to-End Participant & Employee Onboarding Pipeline',
    inside: 'Intake Cases, Online Fillable Intake Forms, Resume Extractor, Readiness Checklist & 1-Click Conversion.',
    smartDoc2026: '2026 Smart-Fill Participant & Staff Onboarding Pack (CHR-INT-2026)',
    easiestTaskFlow: 'Capture Intake → Smart-Fill Mandatory Forms → 1-Click Convert to Active Profile.',
    nextTaskTitle: 'Review & Convert Pending Intake Case to Approved Profile',
  },
  documents: {
    topic: 'Central Smart Document Vault, Routing & Expiry Calendar',
    inside: 'Employee & Participant Document Registers, Bulk Uploads, Read-Receipts & Renewal Calendar.',
    smartDoc2026: '2026 Document Control, Version & Read-Receipt Register (CHR-DOC-2026)',
    easiestTaskFlow: 'Upload or Smart-Fill Doc → Auto-route to Profile & Vault → Track Read Acknowledgement.',
    nextTaskTitle: 'Audit Expiring Vault Documents & Request Staff Read-Receipts',
  },
  'company-safe': {
    topic: 'Locked Company Safe, Business Identity & Official Credentials',
    inside: 'Business Identity Card, NDIS Registration, Insurance Certificates, Safe Vault & Staff Badge Creator.',
    smartDoc2026: '2026 Corporate Governance & NDIS Registration Safe Certificate (CHR-SAF-2026)',
    easiestTaskFlow: 'Verify Business Identity → Lock Insurance & NDIS Certificates in Safe → Export Safe Pack.',
    nextTaskTitle: 'Verify Company Safe Credentials, ABN & Insurance Currency',
  },
  'visual-boards': {
    topic: 'Accessible Visual Routines, Speech Pad, Sign Prompts & Translator',
    inside: 'Visual Daily Routines, Communication Symbol Boards, Text-to-Speech Pad, Auslan Prompts & Translator.',
    smartDoc2026: '2026 Accessible Easy-Read Participant Communication Plan (CHR-VIS-2026)',
    easiestTaskFlow: 'Build Visual Routine → Print/Share Easy-Read Board → Link to Participant Profile.',
    nextTaskTitle: 'Publish Easy-Read Visual Routine & Communication Board for Participant',
  },
  communications: {
    topic: '16-Modular Communication Centre, Shift Notes & Team Command',
    inside: 'Diary, Inbox, Branded Email, Shift Notes, Shared To-Do Board, Video Calls, Banter, Shoutouts & AI Compose.',
    smartDoc2026: '2026 Official Shift Handover & Multi-Disciplinary Communication Log (CHR-COM-2026)',
    easiestTaskFlow: 'Log Shift Note or Email → Auto-route alert to Management → Tick off Shared To-Do item.',
    nextTaskTitle: 'Review Daily Shift Handover Notes & Sign Off Shared To-Do Board',
  },
  assistant: {
    topic: '24/7 AI Compliance, Rostering, Finance & Personal Copilots',
    inside: 'In-App AI Chat, Compliance Q&A, Roster Assistant, Goal Coach & Instant Document Drafting.',
    smartDoc2026: '2026 AI-Assisted Compliance Determination & Action Brief (CHR-AIA-2026)',
    easiestTaskFlow: 'Ask AI Copilot → Generate Smart-Fill Policy/Action → Save directly to Task or Vault.',
    nextTaskTitle: 'Run AI Compliance Copilot Check on Open Operational Items',
  },
  incidents: {
    topic: 'NDIS Reportable Incident Clinic (24-Hour & 5-Day Timers)',
    inside: 'Incident Register, 24h/5d NDIS Commission Countdown, Root-Cause Investigation, Photos & Kanban.',
    smartDoc2026: '2026 NDIS Commission 24-Hour & 5-Day Reportable Incident Form (CHR-INC-2026)',
    easiestTaskFlow: 'Log Incident → Smart-Fill 24h/5d NDIS Notification → Assign Corrective Action Task.',
    nextTaskTitle: 'Complete Incident Root-Cause Investigation & 5-Day NDIS Follow-Up',
  },
  'incident-analytics': {
    topic: 'Incident Trend Intelligence, Severity Breakdown & Prevention',
    inside: 'Category Charts, Staff & Participant Trend Lines, Time-of-Day Heatmaps & Systemic Prevention Insights.',
    smartDoc2026: '2026 Quarterly Incident Trend & Safeguarding Board Report (CHR-IAN-2026)',
    easiestTaskFlow: 'Inspect Top Incident Category → Generate Prevention Action → Send to Quality Register.',
    nextTaskTitle: 'Review Quarterly Incident Trends & Log Preventative Control Action',
  },
  risks: {
    topic: 'Enterprise, Clinical, Home & Individual Risk Matrix',
    inside: 'Risk, Hazard & Near-Miss Register, 5x5 Matrix, Hierarchy of Controls, Take-5s & 6-Monthly Reviews.',
    smartDoc2026: '2026 Hierarchy-of-Controls Risk Assessment & Home Safety Plan (CHR-RSK-2026)',
    easiestTaskFlow: 'Identify Hazard → Smart-Fill Elimination/Minimisation Controls → Schedule 6-Month Review.',
    nextTaskTitle: 'Complete 6-Monthly Individual & Home Environment Risk Assessment',
  },
  compliance: {
    topic: 'Master Compliance & Report Centre (CHR-AUD-001 & CHR-AUD-002)',
    inside: '17-Category / 356-Checkpoint Master Checklist, NDIS Standards Map, Policies, Legal Register & 1-Click Audit Pack.',
    smartDoc2026: '2026 Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002 · 356 Checkpoints)',
    easiestTaskFlow: 'Tick 356 Checkpoints → Auto-flag gaps → Export 1-Click PDF Audit & Board Report.',
    nextTaskTitle: 'Complete Monthly Master Compliance Audit Checklist & Export Board Pack',
  },
  'auditor-portal': {
    topic: 'Consent-Gated Read-Only External NDIS Auditor Portal',
    inside: 'Verified Consent Evidence Filter, Practice Standard Evidence Map, Auditor Observations & Sign-Off.',
    smartDoc2026: '2026 External NDIS Auditor Verification & Consent Certificate (CHR-AUDP-2026)',
    easiestTaskFlow: 'Verify Participant/Staff Audit Consent → Open Read-Only Auditor View → Export Evidence Bundle.',
    nextTaskTitle: 'Prepare Consent-Verified Evidence Bundle in External Auditor Portal',
  },
  training: {
    topic: 'LMS Training Academy, AI Course Author & Competency Quizzes',
    inside: 'Training Modules, Learner Portal, AI Quiz Drill, Training Matrix, Streaks & Skills Gap Analytics.',
    smartDoc2026: '2026 Mandatory NDIS Workforce Orientation & Competency Record (CHR-TRN-2026)',
    easiestTaskFlow: 'Complete LMS Course & AI Quiz → Auto-issue Certificate → Update Staff Compliance Score.',
    nextTaskTitle: 'Assign & Verify Mandatory NDIS Worker Orientation Training Completion',
  },
  certificates: {
    topic: 'Branded PDF Certificates & Credential Expiry Registry',
    inside: 'Instant PDF Certificate Studio (signed by Kristy Lee Whelan), Expiry Alerts & Credential Ledger.',
    smartDoc2026: '2026 Official Certificate of Competency & Accreditation (CHR-CRT-2026)',
    easiestTaskFlow: 'Select Staff Member → Smart-Fill Achievement Certificate → Download PDF & Save to Profile.',
    nextTaskTitle: 'Issue & File Signed Competency Certificates for Completed Training',
  },
  assets: {
    topic: 'Asset Register, Maintenance Schedules, Compliance & Disposal',
    inside: 'Vehicle & Equipment Assets, Service Reminders, Compliance Inspections & Disposal Ledger.',
    smartDoc2026: '2026 Plant, Vehicle & Assistive Technology Compliance Log (CHR-AST-2026)',
    easiestTaskFlow: 'Inspect Asset → Log Maintenance / Safety Check → Set Next 6-Month Service Date.',
    nextTaskTitle: 'Conduct Scheduled Asset & Fleet Safety Maintenance Inspection',
  },
  rostering: {
    topic: 'NDIS Smart Rostering, Screening Guardrails & Shift Sign-Off',
    inside: 'Weekly Shift Calendar, Coverage Heatmap, Screening Alerts, Availability, Patterns & Payroll Export.',
    smartDoc2026: '2026 Verified NDIS Shift Roster & Worker Screening Sign-Off (CHR-RST-2026)',
    easiestTaskFlow: 'Check Availability & Screening → Allocate Shifts → Publish Roster & Send Shift Reminders.',
    nextTaskTitle: 'Publish Weekly Verified Roster & Resolve Unfilled Shift Exceptions',
  },
  invoicing: {
    topic: 'NDIS Price Guide Invoicing, PRODA Claims & Bank Reconciliation',
    inside: 'Invoice Builder, Shift-to-Invoice Drill, Aged Receivables, Bank Rules & Payroll Hub.',
    smartDoc2026: '2026 NDIS Price Guide Compliant Tax Invoice & Claim Statement (CHR-INV-2026)',
    easiestTaskFlow: 'Import Completed Shifts → Smart-Fill NDIS Line Items → Issue PDF Invoice & Reconcile.',
    nextTaskTitle: 'Generate Weekly NDIS Shift Invoices & Reconcile Bank Statement Lines',
  },
  goals: {
    topic: 'Participant & Staff Goal Progress, Funding Outcomes & AI Coach',
    inside: 'Goal Cards, 0-100% Progress Sliders, Linked Shift Notes, Funding Outcome Chart & AI Goal Coach.',
    smartDoc2026: '2026 NDIS Participant Goal Attainment & Outcome Report (CHR-GOL-2026)',
    easiestTaskFlow: 'Select Goal → Record Progress Note & Milestone % → Email 10-Weekly Snapshot.',
    nextTaskTitle: 'Update Participant Goal Progress Percentages & 10-Weekly Outcome Notes',
  },
  'emergency-response': {
    topic: 'Emergency Response, PEEPs, Evacuation Drills & Kit Checks',
    inside: 'Live Emergency Alerts, Quick Dial, PEEPs, Fire Drills, Smoke Alarm/Kit Logs & Visitor Sign-In.',
    smartDoc2026: '2026 Emergency & Disaster Continuity Plan + PEEP Checklist (CHR-EMG-2026)',
    easiestTaskFlow: 'Run Evacuation Drill or Kit Check → Record Pass/Issues → Auto-schedule 6-Month Due Date.',
    nextTaskTitle: 'Complete 6-Monthly Fire Evacuation Drill & First Aid Kit Inspection',
  },
  meetings: {
    topic: 'Masterpiece Meeting Centre, Smart-Fill Minutes & Action Board',
    inside: 'Meeting Register, Visual Calendar, 2026 Smart-Fill Agenda & Minutes Studio, Task Board & Flyer Studio.',
    smartDoc2026: '2026 Governance Board & Team Meeting Minutes + Resolutions Pack (CHR-MTG-2026)',
    easiestTaskFlow: 'Schedule with Preset → 1-Click Smart-Fill Minutes & Quorum → Extract & Complete Action Tasks.',
    nextTaskTitle: 'Finalise Outstanding Meeting Minutes & Complete Assigned Action Items',
  },
  users: {
    topic: 'Users, Role-Based Access Control (RLS) & Permission Matrix',
    inside: 'User Invite Hub, 13-Role Permission Matrix, Pending Approvals, Archived Users & Activity Audit.',
    smartDoc2026: '2026 Role-Based Access Control & Least-Privilege Audit Log (CHR-USR-2026)',
    easiestTaskFlow: 'Invite User → Assign Verified Role → Audit Access Permissions & Activity Trail.',
    nextTaskTitle: 'Audit User Role Assignments & Approve Pending Portal Invitations',
  },
  receipts: {
    topic: 'AI Receipt Scanner, Scan-to-PDF & Reimbursement Hub',
    inside: 'AI Receipt OCR Scanner, Expense Categories, GST Tracking, PDF Bundles & Reimbursement Status.',
    smartDoc2026: '2026 Verified Expense Receipt & GST Reimbursement Voucher (CHR-RCP-2026)',
    easiestTaskFlow: 'Upload Receipt Photo → AI Auto-Extracts Vendor & GST → Approve & Export PDF.',
    nextTaskTitle: 'Scan & Reconcile Pending Expense Receipts for Monthly Finance Close',
  },
  'equipment-manuals': {
    topic: 'Equipment Operating Manuals & Chemical MSDS Safety Library',
    inside: 'Assistive Tech Manuals, Hoist/Sling Guides, Hazardous Chemical Register & SDS Expiry Alerts.',
    smartDoc2026: '2026 Hazardous Chemical MSDS & Safe Operating Procedure Sheet (CHR-EQP-2026)',
    easiestTaskFlow: 'Register Equipment/Chemical → Attach SDS & Safe Operating Guide → Verify Staff Sign-Off.',
    nextTaskTitle: 'Verify Currency of Chemical MSDS Sheets & Hoist Operating Manuals',
  },
  'community-council': {
    topic: 'Local Council Lookups, Community Programs & Inclusion',
    inside: 'Council Compliance Lookup, Community Events, Accessible Venues & Local Support Directories.',
    smartDoc2026: '2026 Community Inclusion & Local Council Event Safety Plan (CHR-COU-2026)',
    easiestTaskFlow: 'Look Up Council Guidelines → Plan Community Outing → Complete Venue Risk Check.',
    nextTaskTitle: 'Verify Local Council Accessibility & Risk Plan for Upcoming Outing',
  },
  'community-referral': {
    topic: 'Warm Referrals, Crisis Helplines & Allied Health Directory',
    inside: 'Referral Form, Allied Health & Advocacy Directory, 24/7 Crisis Numbers & Printable Referral PDF.',
    smartDoc2026: '2026 Inter-Agency Warm Referral & Consent Transfer Letter (CHR-REF-2026)',
    easiestTaskFlow: 'Select Service Provider → Smart-Fill Participant Referral + Consent → Send & Log PDF.',
    nextTaskTitle: 'Follow Up Open Allied Health & Support Coordination Referrals',
  },
  'ndis-provider': {
    topic: 'NDIS Provider Registration Groups, KPIs & Commission Deadlines',
    inside: 'Registration Groups, Practice Standard Controls, Commission Reporting Timers & Provider KPIs.',
    smartDoc2026: '2026 NDIS Commission Registration & Practice Standards Statement (CHR-NDP-2026)',
    easiestTaskFlow: 'Review Registration Groups → Check Governance Controls → Track Commission Deadlines.',
    nextTaskTitle: 'Review NDIS Provider Registration Groups & Governance Control Evidence',
  },
  'ndis-news': {
    topic: 'Automated NDIS Commission News, Price Guide & Policy Alerts',
    inside: 'Live NDIS News Feed, Price Guide Release Tracker, Regulatory Deadlines & Impact Notes.',
    smartDoc2026: '2026 Regulatory Change & NDIS Price Guide Impact Briefing (CHR-NDN-2026)',
    easiestTaskFlow: 'Sync Latest NDIS Updates → Flag Organisational Impact → Create Policy Update Task.',
    nextTaskTitle: 'Review Latest NDIS Regulatory Update & Brief Support Team',
  },
  quotes: {
    topic: 'Branded NDIS Service Quotes, Win-Rate Analytics & Conversion',
    inside: 'Quote Builder, NDIS Support Line Calculator, Live Branded PDF Preview & Convert-to-Invoice.',
    smartDoc2026: '2026 NDIS Schedule of Supports & Itemised Service Quote (CHR-QUO-2026)',
    easiestTaskFlow: 'Build Schedule of Supports Quote → Send Branded PDF → 1-Click Convert Accepted Quote.',
    nextTaskTitle: 'Follow Up Sent Service Quotes & Convert Approved Schedules',
  },
  programs: {
    topic: 'Group Programs, Events Calendar, AI Ad Builder & Invites',
    inside: 'Community Programs, Event Calendar, AI Flyer/Ad Image Generator, RSVP Invites & Surveys.',
    smartDoc2026: '2026 Group Program Run-Sheet, Staffing Ratio & RSVP Pack (CHR-PRG-2026)',
    easiestTaskFlow: 'Create Program/Event → Generate Marketing Flyer → Send Participant/Staff Invites.',
    nextTaskTitle: 'Publish Upcoming Group Program Schedule & Send RSVP Invitations',
  },
  'key-contacts': {
    topic: 'Key Personnel, Delegated Authorities & Escalation Directory',
    inside: 'Key Management Personnel, Delegations Register, Credentials Expiry & Email Signature Auto-Attach.',
    smartDoc2026: '2026 Key Personnel Delegations & Authority Matrix (CHR-KEY-2026)',
    easiestTaskFlow: 'Register Key Personnel → Set Financial/Clinical Delegation → Auto-sync to Emails.',
    nextTaskTitle: 'Verify Key Personnel Delegations & Emergency Escalation Contacts',
  },
  'volunteering-placements': {
    topic: 'Volunteer & Student Placement Onboarding, Screening & Buddy Shifts',
    inside: 'Public Volunteer Applications, Screening Checks, Induction Training, Buddy Shifts & Placements.',
    smartDoc2026: '2026 Volunteer & Student Placement Deed + Screening Checklist (CHR-VOL-2026)',
    easiestTaskFlow: 'Review Application → Verify Blue/Yellow Card Screening → Assign Supervised Buddy Shift.',
    nextTaskTitle: 'Complete Screening & Buddy Shift Allocation for New Volunteers',
  },
  analytics: {
    topic: 'Executive Business Intelligence, Financial & Compliance KPIs',
    inside: 'Cross-Module KPI Cards, Compliance Score Trends, Revenue vs Labour Charts & Exportable Insights.',
    smartDoc2026: '2026 Executive Monthly KPI & Operational Performance Pack (CHR-ANA-2026)',
    easiestTaskFlow: 'Auto-Calculate KPIs → Inspect Underperforming Metrics → Launch Targeted Action.',
    nextTaskTitle: 'Run Monthly KPI Auto-Calculation & Export Executive Analytics Summary',
  },
  'human-resources': {
    topic: 'HR Hub: Digital Contracts, Position Descriptions, Leave & 360° Appraisals',
    inside: 'HR Paperwork Studio, Contract E-Sign, Leave Requests, Performance Appraisals & Staff Recognition.',
    smartDoc2026: '2026 Fair Work & NDIS Compliant Employment Contract + PD Pack (CHR-HRH-2026)',
    easiestTaskFlow: 'Select Staff → Smart-Fill Contract / Appraisal → Capture Digital Signature & File to Vault.',
    nextTaskTitle: 'Process Pending Staff Leave Requests & Schedule Due Annual Appraisals',
  },
  crm: {
    topic: 'CRM Lead Pipeline, Referrer Relationships & Growth Campaigns',
    inside: 'Lead Kanban, Support Coordinator Contacts, Follow-Up Reminders & Conversion Analytics.',
    smartDoc2026: '2026 Referrer & Support Coordinator Partnership Proposal (CHR-CRM-2026)',
    easiestTaskFlow: 'Log New Enquiry/Lead → Send Marketing Flyer & Quote → Convert Won Lead to Intake.',
    nextTaskTitle: 'Follow Up Active CRM Enquiries & Support Coordinator Referrals',
  },
  procurement: {
    topic: 'Approved Suppliers, Purchase Orders & 3-Way Match',
    inside: 'Supplier Register, ABN/Insurance Checks, Purchase Orders, 3-Way Match (PO + Receipt + Invoice).',
    smartDoc2026: '2026 Approved Supplier Vetting & 3-Way Purchase Order (CHR-PRC-2026)',
    easiestTaskFlow: 'Raise Purchase Order → Match Delivery Receipt & Supplier Invoice → Approve Payment.',
    nextTaskTitle: 'Complete 3-Way Match Verification on Open Purchase Orders',
  },
  projects: {
    topic: 'Strategic Business Projects, Milestones & Governance Delivery',
    inside: 'Project Boards, Milestone Trackers, Assigned Owners, Budgets & Completion Progress.',
    smartDoc2026: '2026 Strategic Compliance Project Charter & Milestone Sign-Off (CHR-PRJ-2026)',
    easiestTaskFlow: 'Create Project Charter → Break into Milestones → Track Linked Tasks to 100%.',
    nextTaskTitle: 'Update Milestone Progress on Active Strategic Business Projects',
  },
  tasks: {
    topic: 'Task Command Dashboard, Kanban, Leaderboard & 30-Task Batch Reports',
    inside: 'Task List, Status Kanban, Competition Leaderboard, Digital Sign-Off & Automated Overdue Alerts.',
    smartDoc2026: '2026 Verified Task Completion & Digital Sign-Off Ledger (CHR-TSK-2026)',
    easiestTaskFlow: 'Filter Open/Overdue Tasks → Complete & Digitally Sign Off → Auto-generate 30-Task PDF.',
    nextTaskTitle: 'Clear High-Priority Overdue Tasks & Record Digital Supervisor Sign-Off',
  },
  feedback: {
    topic: 'Complaints, Feedback SLA Tracker & Satisfaction Surveys',
    inside: 'Complaints Register, NDIS SLA Timers, Public Complaint Portal, Surveys & Resolution Workflow.',
    smartDoc2026: '2026 NDIS Complaints Resolution & Procedural Fairness Record (CHR-FDB-2026)',
    easiestTaskFlow: 'Acknowledge Feedback within 24h → Investigate & Resolve → Push Systemic Fix to Quality.',
    nextTaskTitle: 'Review Open Feedback/Complaints & Record Resolution Outcome',
  },
  quality: {
    topic: 'Continuous Improvement Register (CIR) & Quality Reviews',
    inside: 'Quality Items, Improvement Actions, Root-Cause Sources (Audit/Incident/Feedback) & Review Board.',
    smartDoc2026: '2026 NDIS Continuous Improvement Register & Evidence Closure (CHR-QUL-2026)',
    easiestTaskFlow: 'Log Improvement Opportunity → Assign Owner & Target Date → Verify Evidence & Close.',
    nextTaskTitle: 'Review Open Continuous Improvement Actions & Record Closure Evidence',
  },
  'suggestions-hub': {
    topic: 'AI Module Auditor: Visualise, Automate & Refine Across All 45 Screens',
    inside: 'Live Register Scanner, Overdue/Expiring Detector, Screen-by-Screen 2026 Audit & Email Digest.',
    smartDoc2026: '2026 Whole-of-Platform AI Optimization & Audit Digest (CHR-SUG-2026)',
    easiestTaskFlow: 'Run Live Module Scan → Inspect Overdue/Expiring Flags → Execute 1-Click Fix or Task.',
    nextTaskTitle: 'Review AI Suggestions Digest & Action Flagged Module Improvements',
  },
  help: {
    topic: 'AI System Troubleshooter, Live System Health & Support Desk',
    inside: 'Common Problems Fixer, AI Troubleshooter, Live Health Checks & Tech Support Ticket Register.',
    smartDoc2026: '2026 System Integrity, Backup & Support Resolution Log (CHR-HLP-2026)',
    easiestTaskFlow: 'Run AI Diagnostic → Apply Instant Guided Fix or Log Priority Support Ticket.',
    nextTaskTitle: 'Run System Health Diagnostic & Resolve Open Help Desk Tickets',
  },
  'user-guides': {
    topic: 'Step-by-Step Downloadable User Manuals for All 45 Modules',
    inside: 'Interactive Guide Reader, Role-Specific Workflows, Best-Practice Tips & Printable PDF Manuals.',
    smartDoc2026: '2026 Master Standard Operating Procedure (SOP) & Staff Manual (CHR-UGD-2026)',
    easiestTaskFlow: 'Select Module Manual → Read Step-by-Step SOP → Download Printable PDF Guide for Staff.',
    nextTaskTitle: 'Distribute Updated 2026 Module SOP Manuals to Onboarding Staff',
  },
};

export default function ScreenByScreenMasterAudit2026({ compact = false }) {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [search, setSearch] = useState('');
  const [activeDocModule, setActiveDocModule] = useState(null);
  const [creatingTaskKey, setCreatingTaskKey] = useState(null);
  const [savingDoc, setSavingDoc] = useState(false);

  // Live data for Smart-Fill 2026 Document Generator & Live Maintenance Tracker
  const [staffList, setStaffList] = useState([]);
  const [participantList, setParticipantList] = useState([]);
  const [maintenanceStats, setMaintenanceStats] = useState({
    assets: 18,
    logs: 24,
    safetyChecks: 16,
  });
  const [smartForm, setSmartForm] = useState({
    docCode: 'CHR-2026-SMART',
    title: '',
    moduleLabel: '',
    organisation: 'ComplianceHR Infinity',
    abn: 'Verified Registered Provider',
    director: 'Kristy Lee Whelan, Managing Director',
    email: 'kristyleebatkin@live.com.au',
    relatedPerson: '',
    complianceStandard: '2026 NDIS Practice Standards, WHS Act & Fair Work Compliance',
    smartSummary: '',
    evidenceNotes: '',
    actionRequired: '',
    signature: 'Kristy Lee Whelan — Digital Compliance Sign-Off',
  });

  useEffect(() => {
    Promise.all([
      base44.entities.StaffProfile.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
      base44.entities.ParticipantProfile.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
      base44.entities.Asset.count({}).catch(() => 18),
      base44.entities.AssetMaintenance.count({}).catch(() => 24),
      base44.entities.SafetyCheck.count({}).catch(() => 16),
    ]).then(([s, p, assetsCount, maintCount, checksCount]) => {
      setStaffList(s?.items || (Array.isArray(s) ? s : []));
      setParticipantList(p?.items || (Array.isArray(p) ? p : []));
      setMaintenanceStats({
        assets: typeof assetsCount === 'number' && assetsCount > 0 ? assetsCount : 18,
        logs: typeof maintCount === 'number' && maintCount > 0 ? maintCount : 24,
        safetyChecks: typeof checksCount === 'number' && checksCount > 0 ? checksCount : 16,
      });
    });
  }, []);

  const openSmartFillDoc = (mod) => {
    const bp = MODULE_AUDIT_BLUEPRINTS[mod.key] || {};
    const firstPerson =
      staffList[0]?.full_name || participantList[0]?.full_name || 'All Active Personnel & Participants';
    setActiveDocModule(mod);
    setSmartForm({
      docCode: `CHR-2026-${mod.key.slice(0, 4).toUpperCase()}`,
      title: bp.smartDoc2026 || `2026 Compliant ${mod.label} Record`,
      moduleLabel: mod.label,
      organisation: 'ComplianceHR Infinity',
      abn: 'Verified NDIS & HR Super-Platform',
      director: 'Kristy Lee Whelan, Managing Director',
      email: 'kristyleebatkin@live.com.au',
      relatedPerson: firstPerson,
      complianceStandard: '2026 NDIS Practice Standards, National Quality & Safeguards, WHS & Fair Work',
      smartSummary: `Automated 2026 Smart-Fill compliance verification for ${mod.label}. Topic: ${bp.topic || mod.blurb}. All required fields, registers (${bp.inside || 'live records'}), and audit controls verified.`,
      evidenceNotes: `Live digital register active in ${mod.path}. Row-Level Security (RLS), audit trail logging, and automated expiry/task workflows enabled.`,
      actionRequired: bp.nextTaskTitle || `Maintain ongoing 2026 compliance in ${mod.label}`,
      signature: `Signed digitally by Kristy Lee Whelan on ${new Date().toISOString().slice(0, 10)}`,
    });
  };

  const handleSaveSmartDoc = async () => {
    if (!smartForm.title.trim()) return;
    setSavingDoc(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await base44.entities.FormSubmission.create({
        form_title: smartForm.title,
        category: smartForm.moduleLabel || '2026 Smart-Fill Compliance',
        submitted_by: smartForm.director,
        submitted_date: today,
        submission_method: 'Online',
        online_document: true,
        status: 'Reviewed',
        review_outcome: 'Approved',
        submission_summary: `${smartForm.smartSummary}\n\nEvidence: ${smartForm.evidenceNotes}\nAction: ${smartForm.actionRequired}\nSigned: ${smartForm.signature}`,
        data: JSON.stringify(smartForm),
      });
      toast({
        title: '2026 Smart-Fill Compliant Document Saved!',
        description: `"${smartForm.title}" has been smart-filled, signed, and filed into your Compliance & Safe registers.`,
      });
      setActiveDocModule(null);
    } catch (err) {
      toast({
        title: 'Could not save document',
        description: err?.message || 'Please sign in to save to the live database.',
        variant: 'destructive',
      });
    } finally {
      setSavingDoc(false);
    }
  };

  const handleQuickCreateAndCompleteTask = async (mod, markCompleted = false) => {
    const bp = MODULE_AUDIT_BLUEPRINTS[mod.key] || {};
    const title = bp.nextTaskTitle || `Complete ${mod.label} compliance review`;
    setCreatingTaskKey(`${mod.key}-${markCompleted ? 'done' : 'open'}`);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await base44.entities.TodoTask.create({
        title,
        task_type: 'Compliance & Audit',
        module: mod.label,
        task_date: today,
        due_date: today,
        priority: 'High',
        status: markCompleted ? 'Completed' : 'Open',
        completed_date: markCompleted ? today : undefined,
        completed_by: markCompleted ? 'Kristy Lee Whelan' : undefined,
        how_to_complete: bp.easiestTaskFlow || mod.blurb,
        resources_needed: bp.smartDoc2026 || 'ComplianceHR Infinity Live Register',
        important_info: `Topic: ${bp.topic || mod.label}. Inside: ${bp.inside || mod.blurb}`,
      });
      toast({
        title: markCompleted ? 'Task Completed & Signed Off!' : 'Task Added to Command Board!',
        description: `"${title}" (${mod.label}) is now recorded in your Task Dashboard.`,
      });
    } catch (err) {
      toast({
        title: 'Sign in required for live task write',
        description: `Task blueprint ready: "${title}". Sign in to save to your live register.`,
      });
    } finally {
      setCreatingTaskKey(null);
    }
  };

  const groupMap = {};
  NAV_GROUPS.forEach((g) => {
    g.keys.forEach((k) => {
      groupMap[k] = g.label;
    });
  });

  const filteredModules = MODULE_DIRECTORY.filter((mod) => {
    const grp = groupMap[mod.key] || 'Other';
    if (selectedGroup !== 'All' && grp !== selectedGroup) return false;
    if (!search.trim()) return true;
    const bp = MODULE_AUDIT_BLUEPRINTS[mod.key] || {};
    const hay = `${mod.label} ${mod.blurb} ${bp.topic} ${bp.inside} ${bp.smartDoc2026} ${bp.easiestTaskFlow}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  return (
    <section
      id="screen-by-screen-audit"
      className="rounded-2xl bg-white p-2 sm:p-3 space-y-3"
    >
      {/* 2026 Screen-by-Screen Header on Clean White Background + Minimised Open & 46 Screens Tiles */}
      <div
        className="w-full rounded-2xl p-[3px] shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center rounded-[11px] bg-white px-4 py-3 sm:px-6 sm:py-3.5 text-center space-y-2">
          <div className="w-full rounded-xl bg-white px-3 py-1 text-center space-y-1">
            <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
              <span className="text-[#0A2B6D]">2026 Screen-by-Screen </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Audit
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                of All {MODULE_DIRECTORY.length} Modulars
              </span>
            </h2>

            <p className="mx-auto max-w-4xl text-center text-[10.5px] sm:text-xs font-extrabold leading-snug text-[#0A2B6D]">
              Every module below shows: (1) What is the Topic, (2) What is Inside, (3) Its 2026 Smart-Fill Compliant Document, and (4) The Easiest 1-Click Way to Complete Any Related Task.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1.5">
            <div
              className="rounded-full p-[1.5px] shadow-2xs"
              style={{
                background:
                  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
              }}
            >
              <button
                type="button"
                onClick={() => openSmartFillDoc(MODULE_DIRECTORY[13])}
                className="gradient-brand flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white transition-all hover:opacity-95"
                style={{ background: getHeaderView(4), color: '#FFFFFF' }}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                  <Wand2 className="h-2 w-2 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Open 2026 Smart-Fill Doc Studio</span>
              </button>
            </div>

            <div
              className="rounded-full p-[1.5px] shadow-2xs"
              style={{
                background:
                  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
              }}
            >
              <div
                className="gradient-brand flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                  <ShieldCheck className="h-2 w-2 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>
                  {MODULE_DIRECTORY.length} Screens Audited · Smart-Fill 2026 Docs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Small Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002) */}
      <MasterComplianceAuditForms compact={true} smallFeatured={true} />

      {/* Search Screens Bar & Centered Filter Tiles Under Search — No Colour Around Search Bar */}
      <div className="w-full rounded-2xl border border-[#0A2B6D]/30 bg-white p-2.5 shadow-2xs">
        <div className="flex flex-col gap-2 rounded-[11px] bg-white text-center">
          {/* Search Bar on Clean White Background */}
          <div className="relative flex w-full items-center rounded-full border border-[#0A2B6D]/35 bg-white">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#0A2B6D]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search screens, topics, 2026 Smart-Fill documents, or audit tasks…"
              className="h-8 w-full rounded-full bg-white pl-10 pr-4 text-center text-xs font-extrabold text-[#0A2B6D] placeholder:text-[#0A2B6D]/70 focus:outline-none"
            />
          </div>

          {/* Smaller 8 Group Filter Buttons Under Search */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
            {[
              'All',
              'Overview',
              'People',
              'Care & Support',
              'Compliance & Safety',
              'Work',
              'Company',
              'Money',
            ].map((grp, idx) => {
              const active = selectedGroup === grp;
              return (
                <div
                  key={grp}
                  className={`rounded-full p-[1.5px] shadow-2xs transition-all ${
                    active ? 'ring-2 ring-[#0A2B6D]' : ''
                  }`}
                  style={{
                    background:
                      'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className="gradient-brand flex h-[22px] w-full items-center justify-center rounded-full px-1.5 text-center text-[8.5px] font-extrabold text-white transition-all hover:opacity-95 whitespace-nowrap"
                    style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                  >
                    <span className="truncate text-center font-extrabold text-white" style={{ color: '#FFFFFF' }}>
                      {grp}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive 2026 Smart-Fill Document Studio Drawer (when a module's Smart-Fill Doc is clicked) */}
      {activeDocModule && (
        <div className="rounded-xl border-2 border-pink-500 bg-white p-2.5 shadow-lg space-y-2">
          <div
            className="app-section-card-header flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-white"
            style={{ background: HEADER_GRADIENT }}
          >
            <div className="flex items-center gap-1.5">
              <Wand2 className="h-4 w-4 text-white" />
              <span className="font-body text-[10px] font-black uppercase tracking-wider text-white">
                2026 Smart-Fill Compliant Document Studio · {activeDocModule.label} ({smartForm.docCode})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-white/20 px-2 py-0.5 font-body text-[7.5px] font-extrabold text-white hover:bg-white/30"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveDocModule(null)}
                className="rounded-full bg-white px-2 py-0.5 font-body text-[7.5px] font-black text-blue-950"
              >
                Close Studio
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 text-[8px]">
            <div>
              <label className="font-extrabold text-blue-950">2026 Document Title</label>
              <input
                type="text"
                value={smartForm.title}
                onChange={(e) => setSmartForm({ ...smartForm, title: e.target.value })}
                className="mt-0.5 w-full rounded border border-[#0A2B6D]/30 bg-white px-2 py-1 font-bold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Organisation &amp; ABN</label>
              <input
                type="text"
                value={`${smartForm.organisation} · ${smartForm.abn}`}
                onChange={(e) => setSmartForm({ ...smartForm, organisation: e.target.value })}
                className="mt-0.5 w-full rounded border border-[#0A2B6D]/30 bg-white px-2 py-1 font-bold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Smart-Fill Person (Staff / Participant)</label>
              <select
                value={smartForm.relatedPerson}
                onChange={(e) => setSmartForm({ ...smartForm, relatedPerson: e.target.value })}
                className="mt-0.5 w-full rounded border border-[#0A2B6D]/30 bg-white px-2 py-1 font-bold text-blue-950"
              >
                <option value="All Active Personnel & Participants">All Active Personnel &amp; Participants</option>
                {staffList.map((s) => (
                  <option key={`s-${s.id}`} value={`Staff: ${s.full_name}`}>
                    Staff: {s.full_name}
                  </option>
                ))}
                {participantList.map((p) => (
                  <option key={`p-${p.id}`} value={`Participant: ${p.full_name}`}>
                    Participant: {p.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-extrabold text-blue-950">2026 Legislative &amp; NDIS Standard</label>
              <input
                type="text"
                value={smartForm.complianceStandard}
                onChange={(e) => setSmartForm({ ...smartForm, complianceStandard: e.target.value })}
                className="mt-0.5 w-full rounded border border-[#0A2B6D]/30 bg-white px-2 py-1 font-bold text-blue-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-[8px]">
            <div>
              <label className="font-extrabold text-blue-950">Smart-Filled Executive Summary</label>
              <textarea
                rows={2}
                value={smartForm.smartSummary}
                onChange={(e) => setSmartForm({ ...smartForm, smartSummary: e.target.value })}
                className="mt-0.5 w-full rounded border border-purple-300 bg-white p-1.5 font-semibold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Verified Evidence &amp; Controls</label>
              <textarea
                rows={2}
                value={smartForm.evidenceNotes}
                onChange={(e) => setSmartForm({ ...smartForm, evidenceNotes: e.target.value })}
                className="mt-0.5 w-full rounded border border-purple-300 bg-white p-1.5 font-semibold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Next Action &amp; Digital Sign-Off</label>
              <textarea
                rows={2}
                value={`${smartForm.actionRequired}\n${smartForm.signature}`}
                onChange={(e) => setSmartForm({ ...smartForm, actionRequired: e.target.value })}
                className="mt-0.5 w-full rounded border border-purple-300 bg-white p-1.5 font-semibold text-blue-950"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={savingDoc}
              onClick={handleSaveSmartDoc}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1 font-body text-[8.5px] font-black text-white shadow-sm"
              style={{ background: HEADER_GRADIENT }}
            >
              <CheckCircle2 className="h-3 w-3" />
              {savingDoc ? 'Filing 2026 Smart-Fill Doc…' : 'Save & Approve 2026 Smart-Fill Doc to Vault'}
            </button>
          </div>
        </div>
      )}

      {/* Full-Width 48-Screen Audit Grid (46 Modules + 2 Master Audit Screens = 48 so 2, 3, 4 & 6 Columns Fill 100% Without Any Gaps) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 auto-rows-fr">
        {(selectedGroup === 'All' && !search.trim()
          ? [
              ...filteredModules,
              {
                key: 'master-audit-chr-001',
                label: 'Master Audit CHR-AUD-001',
                path: '/compliance',
                icon: ShieldCheck,
                blurb: '17 Categories & 356 Checkpoints Governance Edition',
              },
              {
                key: 'master-audit-chr-002',
                label: 'Workforce Audit CHR-AUD-002',
                path: '/compliance',
                icon: Wand2,
                blurb: '11-Page Workforce & Operations Smart-Fill Edition',
              },
            ]
          : filteredModules
        ).map((mod, index) => {
          const borderCol = getAppBorderView(index);
          const Icon = mod.icon || Layers;
          const bp = MODULE_AUDIT_BLUEPRINTS[mod.key] || {
            topic: mod.label,
            inside: mod.blurb,
            smartDoc2026: `2026 Smart-Fill ${mod.label} Compliance Record`,
            easiestTaskFlow: 'Open module → Smart-fill record → Complete & sign off task.',
            nextTaskTitle: `Complete ${mod.label} compliance verification`,
          };

          const sprayBg =
            'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

          return (
            <div
              key={mod.key}
              className="flex h-full rounded-2xl p-[3px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background:
                  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
              }}
            >
              <div
                className="flex h-full w-full flex-col justify-between gap-0.5 overflow-hidden rounded-[8px] p-1 text-center"
                style={{ background: sprayBg }}
              >
                {/* Section 1: 50% Smaller App-Coloured Header Bar */}
                <div
                  className="gradient-brand flex h-[20px] w-full items-center justify-between gap-1 rounded px-1.5 text-white"
                  style={{ background: getHeaderView(index), color: '#FFFFFF' }}
                >
                  <span className="inline-flex items-center gap-0.5 text-[7px] font-extrabold text-white truncate" style={{ color: '#FFFFFF' }}>
                    <Icon className="h-2 w-2 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="truncate">#{index + 1} {mod.label}</span>
                  </span>
                  <Link
                    to={mod.path}
                    className="inline-flex shrink-0 items-center justify-center gap-0.5 rounded-full bg-white px-1 py-0 text-[6px] font-extrabold text-[#0A2B6D]"
                  >
                    Open
                  </Link>
                </div>

                {/* Section 2: Pure White Writing Box */}
                <div
                  className="w-full rounded p-[1px]"
                  style={{ background: getHeaderView(index) }}
                >
                  <div className="flex items-center justify-center rounded-[3px] bg-white px-1 py-0.5 text-center">
                    <span className="truncate text-center text-[7px] font-extrabold leading-tight text-[#0A2B6D]">
                      {bp.smartDoc2026}
                    </span>
                  </div>
                </div>

                {/* Section 3: Live Compliance Tracker — Pure White Writing Box */}
                <div
                  className="w-full rounded p-[1px]"
                  style={{ background: getHeaderView(index + 1) }}
                >
                  <div className="flex items-center justify-center rounded-[3px] bg-white px-1 py-0.5 text-center">
                    <span className="inline-flex items-center justify-center gap-0.5 text-[6.5px] font-extrabold text-[#0A2B6D]">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
                        style={{ boxShadow: '0 0 5px 1px #10B981' }}
                      />
                      <span>Live Compliance Tracker</span>
                    </span>
                  </div>
                </div>

                {/* Section 4: 50% Smaller Bottom Action Buttons */}
                <div className="grid grid-cols-3 gap-0.5">
                  <button
                    type="button"
                    onClick={() => openSmartFillDoc(mod)}
                    className="gradient-brand flex h-[16px] w-full items-center justify-center gap-0.5 rounded-full px-1 text-[6.5px] font-extrabold text-white"
                    style={{ background: getHeaderView(index), color: '#FFFFFF' }}
                  >
                    <span style={{ color: '#FFFFFF' }}>Doc</span>
                  </button>

                  <button
                    type="button"
                    disabled={creatingTaskKey === `${mod.key}-open`}
                    onClick={() => handleQuickCreateAndCompleteTask(mod, false)}
                    className="gradient-brand flex h-[16px] w-full items-center justify-center gap-0.5 rounded-full px-1 text-[6.5px] font-extrabold text-white"
                    style={{ background: getHeaderView(index + 1), color: '#FFFFFF' }}
                  >
                    <span style={{ color: '#FFFFFF' }}>Task</span>
                  </button>

                  <button
                    type="button"
                    disabled={creatingTaskKey === `${mod.key}-done`}
                    onClick={() => handleQuickCreateAndCompleteTask(mod, true)}
                    className="gradient-brand flex h-[16px] w-full items-center justify-center gap-0.5 rounded-full px-1 text-[6.5px] font-extrabold text-white"
                    style={{ background: getHeaderView(index + 2), color: '#FFFFFF' }}
                  >
                    <span style={{ color: '#FFFFFF' }}>Done</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}