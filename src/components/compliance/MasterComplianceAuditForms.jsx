import React, { useState } from 'react';
import {
  ClipboardList, CheckCircle2, Target, Settings, Users, Mail, Phone,
  MapPin, Globe, FileText, Layers, Calendar, UserCheck, Building2,
  ShieldCheck, Infinity as InfinityIcon, ChevronLeft, ChevronRight, Columns,
} from 'lucide-react';
import { Image } from '@/components/ui/image';

const CHR_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export const AUDIT_CATEGORIES_17 = [
  {
    number: 1,
    page: 1,
    title: '1. BUSINESS GOVERNANCE AND OPERATIONAL MANAGEMENT',
    rows: [
      { no: '1.1', req: 'Business registration is current and valid.' },
      { no: '1.2', req: 'ABN details are correct and up to date.' },
      { no: '1.3', req: 'Organisational structure is documented.' },
      { no: '1.4', req: 'Defined roles and responsibilities for key personnel.' },
      { no: '1.5', req: 'Delegations are documented and authorised.' },
    ],
  },
  {
    number: 2,
    page: 2,
    title: '2. RIGHTS AND RESPONSIBILITIES OF PARTICIPANTS',
    rows: [
      { no: '2.1', req: 'Participant charter of rights is provided in accessible formats.' },
      { no: '2.2', req: 'Dignity, privacy and confidentiality policies are implemented.' },
      { no: '2.3', req: 'Supported decision-making and advocacy access are documented.' },
      { no: '2.4', req: 'Informed consent is recorded for information sharing and supports.' },
      { no: '2.5', req: 'Cultural safety and diversity preferences are embedded in plans.' },
    ],
  },
  {
    number: 3,
    page: 3,
    title: '3. HUMAN RESOURCES AND WORKFORCE SCREENING',
    rows: [
      { no: '3.1', req: 'NDIS Worker Screening Checks are verified and current for all staff.' },
      { no: '3.2', req: 'National Police Checks and Working with Children / Blue Cards are current.' },
      { no: '3.3', req: 'Signed employment contracts and position descriptions are on file.' },
      { no: '3.4', req: 'Mandatory NDIS Worker Orientation Module completion is recorded.' },
      { no: '3.5', req: 'Annual performance appraisals and supervision logs are maintained.' },
    ],
  },
  {
    number: 4,
    page: 4,
    title: '4. INCIDENT MANAGEMENT AND REPORTABLE INCIDENTS',
    rows: [
      { no: '4.1', req: 'Incident Management System complies with NDIS Commission Rules 2018.' },
      { no: '4.2', req: '24-hour and 5-day NDIS reportable incident notification workflows active.' },
      { no: '4.3', req: 'Root-cause investigations and corrective actions are tracked to closure.' },
      { no: '4.4', req: 'Participants and nominees are notified and supported following incidents.' },
      { no: '4.5', req: 'Incident trend analytics are reviewed quarterly by governance leadership.' },
    ],
  },
  {
    number: 5,
    page: 5,
    title: '5. COMPLAINTS MANAGEMENT AND FEEDBACK RESOLUTION',
    rows: [
      { no: '5.1', req: 'Accessible complaints and feedback pathways are available to all stakeholders.' },
      { no: '5.2', req: 'Zero-retaliation policy and NDIS Commission escalation rights are clear.' },
      { no: '5.3', req: 'Complaints register records acknowledgment, investigation and resolution SLAs.' },
      { no: '5.4', req: 'Systemic complaint trends feed directly into Continuous Improvement.' },
      { no: '5.5', req: 'Participant satisfaction surveys are conducted and analysed regularly.' },
    ],
  },
  {
    number: 6,
    page: 6,
    title: '6. RISK MANAGEMENT AND WORKPLACE HEALTH & SAFETY',
    rows: [
      { no: '6.1', req: 'Organisational and participant risk registers are actively monitored.' },
      { no: '6.2', req: 'Hierarchy of controls (Eliminate, Minimise, Isolate, Admin, PPE) applied.' },
      { no: '6.3', req: 'Individual and home environment risk assessments are reviewed 6-monthly.' },
      { no: '6.4', req: 'Take-5 pre-shift safety checks and vehicle safety inspections are logged.' },
      { no: '6.5', req: 'Chemical MSDS register and equipment manuals are current and accessible.' },
    ],
  },
  {
    number: 7,
    page: 7,
    title: '7. EMERGENCY AND DISASTER MANAGEMENT',
    rows: [
      { no: '7.1', req: 'Emergency and Disaster Management Plan covers continuity of critical supports.' },
      { no: '7.2', req: 'Personal Emergency Evacuation Plans (PEEPs) are current for each participant.' },
      { no: '7.3', req: 'Fire evacuation drills and emergency lighting tests are completed 6-monthly.' },
      { no: '7.4', req: 'First Aid kits and Natural Disaster kits are stocked and inspected.' },
      { no: '7.5', req: 'After-hours emergency on-call escalation contacts are tested and published.' },
    ],
  },
  {
    number: 8,
    page: 8,
    title: '8. PROVISION OF SUPPORTS, INTAKE AND CARE PLANNING',
    rows: [
      { no: '8.1', req: 'Service Agreements and NDIS Support Plans are signed and current.' },
      { no: '8.2', req: 'Participant goals and 10-weekly / 3-monthly progress reviews are logged.' },
      { no: '8.3', req: 'Shift notes and daily support logs are completed for every rostered shift.' },
      { no: '8.4', req: 'Medication consents, MAR charts and supervision protocols are verified.' },
      { no: '8.5', req: 'Safe transition or exit plans are documented where supports change.' },
    ],
  },
  {
    number: 9,
    page: 9,
    title: '9. QUALITY ASSURANCE AND CONTINUOUS IMPROVEMENT',
    rows: [
      { no: '9.1', req: 'Internal audit schedule covers all 8 NDIS Practice Standards annually.' },
      { no: '9.2', req: 'Continuous Improvement Register links audit findings to assigned owners.' },
      { no: '9.3', req: 'Policy and procedure library is version-controlled with annual reviews.' },
      { no: '9.4', req: 'Staff policy acknowledgements and read-receipts are tracked digitally.' },
      { no: '9.5', req: 'Management review meetings evaluate KPIs, audits and safeguard outcomes.' },
    ],
  },
  {
    number: 10,
    page: 10,
    title: '10. INFORMATION SECURITY, PRIVACY AND RECORD KEEPING',
    rows: [
      { no: '10.1', req: 'Australian Privacy Principles (APPs) and NDIS privacy rules are enforced.' },
      { no: '10.2', req: 'Role-based access controls restrict sensitive participant and staff records.' },
      { no: '10.3', req: 'Notifiable Data Breach (NDB) response plan and register are maintained.' },
      { no: '10.4', req: 'Audit consent status is verified prior to external auditor record access.' },
      { no: '10.5', req: 'Records retention and secure archival schedules are followed.' },
    ],
  },
  {
    number: 11,
    page: 11,
    title: '11. FINANCIAL INTEGRITY, NDIS PRICING AND CLAIMS',
    rows: [
      { no: '11.1', req: 'Invoicing and claims align strictly with the current NDIS Pricing Arrangements.' },
      { no: '11.2', req: 'Shift-to-invoice reconciliation verifies delivered supports before billing.' },
      { no: '11.3', req: 'Participant plan budget utilisation is monitored and communicated.' },
      { no: '11.4', req: 'Insurance policies (Public Liability, Professional Indemnity, WorkCover) current.' },
      { no: '11.5', req: 'Financial delegations, receipts and procurement three-way match are audited.' },
    ],
  },
];

function ComplianceHrInfinityLogoEmblem({ ringClass = 'ring-purple-200/80' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      <div className={`flex h-24 w-52 sm:h-28 sm:w-60 items-center justify-center overflow-hidden rounded-xl bg-white px-2 py-0.5 shadow-sm ring-1 ${ringClass}`}>
        <Image
          src={CHR_LOGO}
          alt="ComplianceHR Infinity — Complete Control. Greater Confidence. Brighter Success."
          fittingType="fit"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

/**
 * Single Master Compliance Audit Checklist Form Page — supports both visual editions:
 *  - variant="gold" (Gold / Amber / Deep Purple wave theme — CHR-AUD-001 Governance & NDIS Edition)
 *  - variant="infinity" (Blue / Purple / Magenta-Pink wave theme — CHR-AUD-002 Workforce & Operations Edition)
 */
export function SingleMasterComplianceAuditForm({
  variant = 'infinity',
  categoryIndex = 0,
  onChangeCategory,
  compact = false,
}) {
  const isGold = variant === 'gold';
  const category = AUDIT_CATEGORIES_17[categoryIndex] || AUDIT_CATEGORIES_17[0];

  const [meta, setMeta] = useState(() =>
    isGold
      ? {
          docNumber: 'CHR-AUD-001',
          version: '2.0',
          issueDate: '22 October 2026',
          reviewDate: '22 October 2027',
          businessName: 'ComplianceHR Infinity · Governance & NDIS',
          abn: 'Registered Provider Edition',
          approvedBy: 'Kristy Lee Whelan, Managing Director',
          email: 'kristyleebatkin@live.com.au',
        }
      : {
          docNumber: 'CHR-AUD-002',
          version: '2.0',
          issueDate: '22 October 2026',
          reviewDate: '22 October 2027',
          businessName: 'ComplianceHR Infinity · Workforce & HR',
          abn: 'Enterprise Operations Edition',
          approvedBy: 'Kristy Lee Whelan, Director',
          email: 'admin@compliancehr.com.au',
        }
  );

  const [rowStates, setRowStates] = useState({});

  const toggleStatus = (no, status) => {
    setRowStates((prev) => {
      const current = prev[no] || {};
      return {
        ...prev,
        [no]: {
          ...current,
          status: current.status === status ? null : status,
        },
      };
    });
  };

  const updateCell = (no, field, value) => {
    setRowStates((prev) => ({
      ...prev,
      [no]: {
        ...(prev[no] || {}),
        [field]: value,
      },
    }));
  };

  const theme = isGold
    ? {
        outerBorder: 'border-[#0072FF]',
        pillBarGradient: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 50%, #5A00D6 100%)',
        pillBarText: 'text-white',
        sectionRibbon: 'linear-gradient(90deg, #0072FF 0%, #0A2B6D 50%, #5A00D6 100%)',
        sectionRibbonText: 'text-white',
        circleIconBg: '#0A2B6D',
        circleIconRing: 'ring-[#00C6FF]',
        cardBorder: 'border-[#C084FC]/60',
        cardTint: 'bg-[#F5F0FF]',
        cardRowAlt: 'bg-[#EDE9FE]/60',
        labelIconBg: 'bg-[#0A2B6D] text-[#00C6FF]',
        stepBadgeBg: 'bg-[#0072FF] text-white border border-[#0A2B6D]',
        tableHeaderGradient: 'linear-gradient(90deg, #0A2B6D 0%, #0072FF 50%, #5A00D6 100%)',
        tableSubHeaderBg: 'bg-[#F5F0FF] text-[#0A2B6D] border-[#C084FC]',
        tableRowEven: 'bg-[#F5F0FF]/60',
        tableRowOdd: 'bg-white',
        tableBorder: 'border-[#C084FC]/50',
        pagePillBg: 'bg-[#0A2B6D] text-white',
      }
    : {
        outerBorder: 'border-[#A100FF]',
        pillBarGradient: 'linear-gradient(90deg, #5A00D6 0%, #A100FF 50%, #FF2E9A 100%)',
        pillBarText: 'text-white',
        sectionRibbon: 'linear-gradient(90deg, #5A00D6 0%, #A100FF 52%, #FF2E9A 100%)',
        sectionRibbonText: 'text-white',
        circleIconBg: '#5A00D6',
        circleIconRing: 'ring-[#FF6EDB]',
        cardBorder: 'border-[#C084FC]/60',
        cardTint: 'bg-[#F5F0FF]',
        cardRowAlt: 'bg-[#EDE9FE]/60',
        labelIconBg: 'bg-[#5A00D6] text-[#FF6EDB]',
        stepBadgeBg: 'bg-[#FF2E9A] text-white border border-[#FF6EDB]',
        tableHeaderGradient: 'linear-gradient(90deg, #5A00D6 0%, #A100FF 50%, #FF2E9A 100%)',
        tableSubHeaderBg: 'bg-[#F5F0FF] text-[#0A2B6D] border-[#C084FC]',
        tableRowEven: 'bg-[#F5F0FF]/60',
        tableRowOdd: 'bg-white',
        tableBorder: 'border-[#C084FC]/50',
        pagePillBg: 'bg-[#5A00D6] text-white',
      };

  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-xl border-2 ${theme.outerBorder} bg-white shadow-md`}>
      {/* ==================== TOP WAVE BANNER & BRAND LOCKUP ==================== */}
      <div className="relative overflow-hidden bg-white pt-1.5 pb-1 px-2">
        <svg
          viewBox="0 0 600 95"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 w-full"
        >
          {isGold ? (
            <>
              <path d="M0,0 L230,0 C175,26 110,55 0,78 Z" fill="#00C6FF" opacity="0.88" />
              <path d="M0,0 L185,0 C135,22 80,45 0,60 Z" fill="#0A2B6D" opacity="0.92" />
              <path d="M0,0 L140,0 C95,15 50,28 0,38 Z" fill="#0072FF" opacity="0.9" />
              <path d="M600,0 L370,0 C425,26 490,55 600,78 Z" fill="#00C6FF" opacity="0.85" />
              <path d="M600,0 L415,0 C465,22 520,45 600,60 Z" fill="#0A2B6D" opacity="0.92" />
              <path d="M600,0 L460,0 C505,15 550,28 600,38 Z" fill="#5A00D6" opacity="0.9" />
            </>
          ) : (
            <>
              <path d="M0,0 L235,0 C175,28 115,58 0,82 Z" fill="#FF2E9A" opacity="0.85" />
              <path d="M0,0 L190,0 C140,22 85,46 0,62 Z" fill="#5A00D6" opacity="0.92" />
              <path d="M0,0 L140,0 C95,15 50,28 0,38 Z" fill="#00C6FF" opacity="0.85" />
              <path d="M600,0 L365,0 C425,28 485,58 600,82 Z" fill="#FF6EDB" opacity="0.85" />
              <path d="M600,0 L410,0 C460,22 515,46 600,62 Z" fill="#5A00D6" opacity="0.92" />
              <path d="M600,0 L460,0 C505,15 550,28 600,38 Z" fill="#A100FF" opacity="0.9" />
            </>
          )}
        </svg>

        {/* Center Brand Emblem */}
        <div className="relative z-10 flex flex-col items-center">
          <ComplianceHrInfinityLogoEmblem ringClass={isGold ? 'ring-amber-300' : 'ring-purple-200/80'} />

          {/* Document Main Heading */}
          <h3 className="mt-0.5 text-center text-sm sm:text-base font-black tracking-tight text-blue-950">
            Master Compliance Audit Checklist
          </h3>

          {/* 17 AUDIT CATEGORIES | 356 CHECKPOINTS Pill Bar */}
          <div
            className={`mt-1 inline-flex flex-wrap items-center justify-center gap-2 rounded-full px-3 py-0.5 text-[8.5px] font-black uppercase tracking-wider shadow-sm ${theme.pillBarText}`}
            style={{ background: theme.pillBarGradient }}
          >
            <span className="inline-flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-950 text-white">
                <ClipboardList className="h-2.5 w-2.5" />
              </span>
              17 AUDIT CATEGORIES
            </span>
            <span className="opacity-60">|</span>
            <span className="inline-flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-950 text-white">
                <CheckCircle2 className="h-2.5 w-2.5" />
              </span>
              356 CHECKPOINTS
            </span>
          </div>
        </div>
      </div>

      {/* ==================== MAIN FORM BODY ==================== */}
      <div className="space-y-1.5 px-2 pb-1.5">
        {/* TWO-COLUMN DOCUMENT METADATA TABLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {/* Left Metadata Box */}
          <div className={`overflow-hidden rounded-lg border ${theme.cardBorder} ${theme.cardTint} text-[8px]`}>
            {[
              { icon: FileText, label: 'Document number:', key: 'docNumber' },
              { icon: Layers, label: 'Version:', key: 'version' },
              { icon: Calendar, label: 'Issue date:', key: 'issueDate' },
              { icon: Calendar, label: 'Proposed review date:', key: 'reviewDate' },
            ].map((row, idx) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.key}
                  className={`grid grid-cols-12 items-center border-b last:border-b-0 ${theme.tableBorder} px-1.5 py-0.5 ${
                    idx % 2 === 1 ? theme.cardRowAlt : 'bg-white/80'
                  }`}
                >
                  <div className="col-span-6 flex items-center gap-1 font-extrabold text-blue-950">
                    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded ${theme.labelIconBg}`}>
                      <Icon className="h-2 w-2" />
                    </span>
                    <span className="truncate">{row.label}</span>
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={meta[row.key]}
                      onChange={(e) => setMeta({ ...meta, [row.key]: e.target.value })}
                      className="w-full bg-transparent text-[8px] font-bold text-blue-950 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Metadata Box */}
          <div className={`overflow-hidden rounded-lg border ${theme.cardBorder} ${theme.cardTint} text-[8px]`}>
            {[
              { icon: Building2, label: 'Business name:', key: 'businessName' },
              { icon: UserCheck, label: 'Edition / ABN:', key: 'abn', placeholder: 'Enter ABN…' },
              { icon: UserCheck, label: 'Approved by:', key: 'approvedBy' },
              { icon: Mail, label: 'Email:', key: 'email' },
            ].map((row, idx) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.key}
                  className={`grid grid-cols-12 items-center border-b last:border-b-0 ${theme.tableBorder} px-1.5 py-0.5 ${
                    idx % 2 === 1 ? theme.cardRowAlt : 'bg-white/80'
                  }`}
                >
                  <div className="col-span-5 flex items-center gap-1 font-extrabold text-blue-950">
                    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded ${theme.labelIconBg}`}>
                      <Icon className="h-2 w-2" />
                    </span>
                    <span className="truncate">{row.label}</span>
                  </div>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={meta[row.key]}
                      placeholder={row.placeholder || ''}
                      onChange={(e) => setMeta({ ...meta, [row.key]: e.target.value })}
                      className="w-full bg-transparent text-[8px] font-bold text-blue-950 placeholder:text-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== PURPOSE SECTION ==================== */}
        <div className={`overflow-hidden rounded-lg border ${theme.cardBorder} ${theme.cardTint}`}>
          <div
            className={`flex items-center gap-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${theme.sectionRibbonText}`}
            style={{ background: theme.sectionRibbon }}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ring-2 ${theme.circleIconRing}`}
              style={{ background: theme.circleIconBg }}
            >
              <Target className="h-3 w-3" />
            </span>
            PURPOSE
          </div>
          <div className="relative flex items-center justify-between gap-2 px-2.5 py-1.5">
            <p className="text-[7.8px] font-semibold leading-snug text-blue-950">
              This ComplianceHR Infinity Master Compliance Audit Checklist provides a comprehensive tool to help NDIS
              registered providers and care organisations assess and monitor compliance with the NDIS Practice Standards,
              Provider Registration Rules 2018, WHS, Fair Work and relevant legislation.
            </p>
            <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-white/70 p-0.5 opacity-45">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity emblem"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* ==================== HOW TO USE THIS CHECKLIST ==================== */}
        <div className={`overflow-hidden rounded-lg border ${theme.cardBorder} ${theme.cardTint}`}>
          <div
            className={`flex items-center gap-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${theme.sectionRibbonText}`}
            style={{ background: theme.sectionRibbon }}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ring-2 ${theme.circleIconRing}`}
              style={{ background: theme.circleIconBg }}
            >
              <Settings className="h-3 w-3" />
            </span>
            HOW TO USE THIS CHECKLIST
          </div>
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <ol className="space-y-0.5 text-[7.8px] font-semibold text-blue-950">
              {[
                'Review each category and complete all relevant checkpoints for your business.',
                'Tick the compliance status (Yes / No / N/A).',
                'Record evidence, findings and required actions.',
                'Assign responsibility and set timeframes for any corrective actions.',
                'Use this checklist regularly (e.g. quarterly or bi-annually) to monitor ongoing compliance.',
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[7px] font-black ${theme.stepBadgeBg}`}
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="hidden sm:flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-current/20 bg-white/70 p-1 opacity-45">
              <ClipboardList className={`h-8 w-8 ${isGold ? 'text-amber-600' : 'text-purple-600'}`} />
            </div>
          </div>
        </div>

        {/* ==================== COMPLIANCE STATUS KEY ==================== */}
        <div className={`overflow-hidden rounded-lg border ${theme.cardBorder} bg-white`}>
          <div
            className={`flex items-center gap-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${theme.sectionRibbonText}`}
            style={{ background: theme.sectionRibbon }}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ring-2 ${theme.circleIconRing}`}
              style={{ background: theme.circleIconBg }}
            >
              <CheckCircle2 className="h-3 w-3" />
            </span>
            COMPLIANCE STATUS KEY
          </div>
          <div className="grid grid-cols-3 divide-x divide-purple-200 text-[7.5px]">
            <div className="flex items-center">
              <span className="bg-emerald-100 px-2 py-1 font-black text-emerald-950">Yes</span>
              <span className="px-1.5 py-0.5 font-semibold leading-tight text-blue-950">
                Compliant / Evidence available
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-rose-100 px-2 py-1 font-black text-rose-950">No</span>
              <span className="px-1.5 py-0.5 font-semibold leading-tight text-blue-950">
                Not compliant / Action required
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-sky-100 px-2 py-1 font-black text-sky-950">N/A</span>
              <span className="px-1.5 py-0.5 font-semibold leading-tight text-blue-950">
                Not applicable to this business
              </span>
            </div>
          </div>
        </div>

        {/* ==================== CATEGORY CHECKPOINTS TABLE ==================== */}
        <div className={`overflow-hidden rounded-lg border ${theme.cardBorder} bg-white`}>
          <div
            className="flex items-center justify-between gap-1 px-2 py-1 text-white"
            style={{ background: theme.tableHeaderGradient }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40">
                <Users className="h-3 w-3 text-white" />
              </span>
              <span className="truncate text-[8.5px] font-black uppercase tracking-wider">
                {category.title}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onChangeCategory && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeCategory(
                        (categoryIndex - 1 + AUDIT_CATEGORIES_17.length) % AUDIT_CATEGORIES_17.length
                      )
                    }
                    className="rounded bg-white/15 p-0.5 hover:bg-white/25"
                    title="Previous audit category"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeCategory((categoryIndex + 1) % AUDIT_CATEGORIES_17.length)}
                    className="rounded bg-white/15 p-0.5 hover:bg-white/25"
                    title="Next audit category"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </>
              )}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40">
                <ClipboardList className="h-3 w-3 text-white" />
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[7.2px]">
              <thead>
                <tr className={`border-b ${theme.tableSubHeaderBg} font-extrabold`}>
                  <th className="border-r border-purple-200 px-1 py-1 text-center w-7">No.</th>
                  <th className="border-r border-purple-200 px-1.5 py-1 text-left min-w-[115px]">
                    Audit Requirement
                  </th>
                  <th className="border-r border-purple-200 px-1 py-1 text-center w-6">Yes</th>
                  <th className="border-r border-purple-200 px-1 py-1 text-center w-6">No</th>
                  <th className="border-r border-purple-200 px-1 py-1 text-center w-6">N/A</th>
                  <th className="border-r border-purple-200 px-1 py-1 text-center">
                    Evidence / Comments
                  </th>
                  <th className="border-r border-purple-200 px-1 py-1 text-center">
                    Action Required
                  </th>
                  {!compact && (
                    <>
                      <th className="border-r border-purple-200 px-1 py-1 text-center">
                        Responsible Person
                      </th>
                      <th className="border-r border-purple-200 px-1 py-1 text-center">
                        Target Date
                      </th>
                      <th className="px-1 py-1 text-center">Completed Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {category.rows.map((r, idx) => {
                  const st = rowStates[r.no] || {};
                  return (
                    <tr
                      key={r.no}
                      className={`border-b last:border-b-0 ${theme.tableBorder} ${
                        idx % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd
                      }`}
                    >
                      <td className="border-r border-purple-200/70 px-1 py-1 text-center font-extrabold text-blue-950">
                        {r.no}
                      </td>
                      <td className="border-r border-purple-200/70 px-1.5 py-1 font-bold text-blue-950 leading-tight">
                        {r.req}
                      </td>
                      {(['Yes', 'No', 'N/A']).map((opt) => {
                        const checked = st.status === opt;
                        return (
                          <td
                            key={opt}
                            className="border-r border-purple-200/70 px-1 py-1 text-center"
                          >
                            <button
                              type="button"
                              onClick={() => toggleStatus(r.no, opt)}
                              aria-label={`${r.no} ${opt}`}
                              className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded border transition-all ${
                                checked
                                  ? opt === 'Yes'
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : opt === 'No'
                                      ? 'border-rose-600 bg-rose-600 text-white'
                                      : 'border-sky-600 bg-sky-600 text-white'
                                  : 'border-purple-400 bg-white hover:border-purple-700'
                              }`}
                            >
                              {checked ? '✓' : ''}
                            </button>
                          </td>
                        );
                      })}
                      <td className="border-r border-purple-200/70 px-1 py-0.5">
                        <input
                          type="text"
                          value={st.evidence || ''}
                          onChange={(e) => updateCell(r.no, 'evidence', e.target.value)}
                          placeholder="Evidence…"
                          className="w-full bg-transparent text-[7px] font-semibold text-blue-950 placeholder:text-purple-300 focus:outline-none"
                        />
                      </td>
                      <td className="border-r border-purple-200/70 px-1 py-0.5">
                        <input
                          type="text"
                          value={st.action || ''}
                          onChange={(e) => updateCell(r.no, 'action', e.target.value)}
                          placeholder="Action…"
                          className="w-full bg-transparent text-[7px] font-semibold text-blue-950 placeholder:text-purple-300 focus:outline-none"
                        />
                      </td>
                      {!compact && (
                        <>
                          <td className="border-r border-purple-200/70 px-1 py-0.5">
                            <input
                              type="text"
                              value={st.person || ''}
                              onChange={(e) => updateCell(r.no, 'person', e.target.value)}
                              placeholder="Owner…"
                              className="w-full bg-transparent text-[7px] font-semibold text-blue-950 placeholder:text-purple-300 focus:outline-none"
                            />
                          </td>
                          <td className="border-r border-purple-200/70 px-1 py-0.5">
                            <input
                              type="text"
                              value={st.targetDate || ''}
                              onChange={(e) => updateCell(r.no, 'targetDate', e.target.value)}
                              placeholder="dd/mm/yy"
                              className="w-full bg-transparent text-[7px] font-semibold text-blue-950 placeholder:text-purple-300 focus:outline-none"
                            />
                          </td>
                          <td className="px-1 py-0.5">
                            <input
                              type="text"
                              value={st.completedDate || ''}
                              onChange={(e) => updateCell(r.no, 'completedDate', e.target.value)}
                              placeholder="dd/mm/yy"
                              className="w-full bg-transparent text-[7px] font-semibold text-blue-950 placeholder:text-purple-300 focus:outline-none"
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM WAVE FOOTER ==================== */}
      <div className="relative overflow-hidden bg-white px-2 pt-1 pb-1.5 border-t border-purple-100">
        <svg
          viewBox="0 0 600 60"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full"
        >
          {isGold ? (
            <>
              <path d="M0,60 L260,60 C190,42 110,22 0,8 Z" fill="#0A2B6D" opacity="0.9" />
              <path d="M0,60 L340,60 C260,46 160,30 0,20 Z" fill="#00C6FF" opacity="0.82" />
              <path d="M600,60 L340,60 C410,42 490,22 600,8 Z" fill="#0072FF" opacity="0.88" />
              <path d="M600,60 L430,60 C485,46 540,30 600,18 Z" fill="#5A00D6" opacity="0.92" />
            </>
          ) : (
            <>
              <path d="M0,60 L260,60 C190,42 110,22 0,8 Z" fill="#5A00D6" opacity="0.92" />
              <path d="M0,60 L340,60 C260,46 160,30 0,20 Z" fill="#FF2E9A" opacity="0.78" />
              <path d="M600,60 L340,60 C410,42 490,22 600,8 Z" fill="#A100FF" opacity="0.88" />
              <path d="M600,60 L430,60 C485,46 540,30 600,18 Z" fill="#0A2B6D" opacity="0.92" />
            </>
          )}
        </svg>

        <div className="relative z-10 flex flex-col gap-1">
          {/* Contact Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[7.2px] font-extrabold text-blue-950">
            {isGold ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 shadow-sm">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-950 text-white">
                    <Mail className="h-2 w-2" />
                  </span>
                  kristyleebatkin@live.com.au
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 shadow-sm">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-purple-950">
                    <Phone className="h-2 w-2" />
                  </span>
                  0402 165 668
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 shadow-sm">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-purple-950">
                    <MapPin className="h-2 w-2" />
                  </span>
                  ComplianceHR Infinity · Australia
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 shadow-sm">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-900 text-white">
                    <Mail className="h-2 w-2" />
                  </span>
                  admin@compliancehr.com.au
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 shadow-sm">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-pink-600 text-white">
                    <Phone className="h-2 w-2" />
                  </span>
                  1300 COMPLY (1300 266 759)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 shadow-sm">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-900 text-white">
                    <Globe className="h-2 w-2" />
                  </span>
                  www.compliancehr.com.au
                </span>
              </>
            )}
          </div>

          {/* Document Footer Line + Page 1 of 11 Badge */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="rounded bg-white/85 px-1.5 py-0.5 text-[7px] font-extrabold text-blue-950 shadow-sm">
              {meta.docNumber} &nbsp;|&nbsp; Version {meta.version} &nbsp;|&nbsp; {meta.issueDate}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[7.5px] font-extrabold shadow ${theme.pagePillBg}`}>
              Page {category.page} of 11
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ComplianceHR Infinity Master Compliance Audit Checklist Showcase:
 * Displays both Gold Governance (`CHR-AUD-001`) and Infinity Operations (`CHR-AUD-002`)
 * 11-page, 17-category, 356-checkpoint interactive forms side-by-side.
 */
export default function MasterComplianceAuditForms({ compact = false, defaultView = 'both' }) {
  const [displayMode, setDisplayMode] = useState(defaultView); // 'both' | 'infinity' | 'gold'
  const [categoryIndex, setCategoryIndex] = useState(0);

  return (
    <div id="audit-master-doc" className="scroll-mt-14 rounded-xl border-2 border-purple-600 bg-white p-1.5 shadow-md space-y-1.5">
      {/* Top Control & Edition Switcher Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg px-2.5 py-1 text-white"
        style={{
          background:
            'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)',
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <ClipboardList className="h-3.5 w-3.5 shrink-0 text-amber-200" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-[9px] font-black uppercase tracking-wider">
                COMPLIANCEHR INFINITY · MASTER COMPLIANCE AUDIT CHECKLIST (17 AUDIT CATEGORIES | 356 CHECKPOINTS)
              </span>
              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[7.5px] font-black text-blue-950">
                INCLUDED IN $999 OUTRIGHT OR $125/MO (24-MO) DOCS PACKAGE &amp; FULL APP PLANS
              </span>
            </div>
            <div className="truncate text-[7.5px] font-bold text-amber-100">
              Governance &amp; NDIS Edition (CHR-AUD-001) + Workforce &amp; Operations Edition (CHR-AUD-002) — Interactive &amp; Printable 11-Page Visual Forms
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'both', label: 'Both Editions Side-by-Side', icon: Columns },
            { id: 'infinity', label: 'Infinity Purple Edition (CHR-AUD-002)', icon: InfinityIcon },
            { id: 'gold', label: 'Executive Gold Edition (CHR-AUD-001)', icon: ShieldCheck },
          ].map((btn) => {
            const Icon = btn.icon;
            const active = displayMode === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setDisplayMode(btn.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7.5px] font-extrabold transition-all ${
                  active
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Icon className={`h-2.5 w-2.5 ${active ? 'text-pink-600' : 'text-white'}`} />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Category / Page Pill Bar (Pages 1 to 11) */}
      <div className="flex flex-wrap items-center justify-between gap-1 rounded-md border border-purple-200 bg-purple-50/50 px-2 py-1">
        <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-purple-950">
          Audit Category / Page:
        </span>
        <div className="flex flex-wrap items-center gap-0.5">
          {AUDIT_CATEGORIES_17.map((cat, idx) => (
            <button
              key={cat.number}
              type="button"
              onClick={() => setCategoryIndex(idx)}
              className={`rounded px-1.5 py-0.5 text-[7px] font-extrabold transition-all ${
                categoryIndex === idx
                  ? 'bg-purple-800 text-white shadow-sm'
                  : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
              }`}
              title={cat.title}
            >
              P.{cat.page}
            </button>
          ))}
        </div>
      </div>

      {/* Recreated Forms Grid */}
      <div
        className={
          displayMode === 'both'
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-1.5 items-stretch'
            : 'grid grid-cols-1 gap-1.5'
        }
      >
        {(displayMode === 'both' || displayMode === 'gold') && (
          <SingleMasterComplianceAuditForm
            variant="gold"
            categoryIndex={categoryIndex}
            onChangeCategory={setCategoryIndex}
            compact={compact && displayMode === 'both'}
          />
        )}
        {(displayMode === 'both' || displayMode === 'infinity') && (
          <SingleMasterComplianceAuditForm
            variant="infinity"
            categoryIndex={categoryIndex}
            onChangeCategory={setCategoryIndex}
            compact={compact && displayMode === 'both'}
          />
        )}
      </div>
    </div>
  );
}