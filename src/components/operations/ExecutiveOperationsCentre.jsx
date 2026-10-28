import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Zap, Cpu, Activity, ShieldCheck, FileText, Layers,
  ClipboardCheck, Sparkles, ArrowRight, Vault, CalendarRange,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import { getHeaderView } from '@/lib/fullColourTiles';
import Rostering from '@/pages/Rostering';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import Standard2026PrintableTemplatesSuite from '@/components/compliance/Standard2026PrintableTemplatesSuite';
import MasterComplianceAuditForms from '@/components/compliance/MasterComplianceAuditForms';
import ScreenByScreenMasterAudit2026 from '@/components/compliance/ScreenByScreenMasterAudit2026';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import IncidentAnalytics from '@/pages/IncidentAnalytics';
import Feedback from '@/pages/Feedback';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';
const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

const EXECUTIVE_RESOURCE_SUITES = [
  {
    id: 'roster',
    label: '1. Live Roster, Shift Coverage & Scheduling Command',
    shortLabel: '1. Roster & Shifts',
    subject: 'Rostering & Shifts',
    icon: CalendarRange,
    color: '#0072FF',
    badge: '1st Option · Live Roster',
    description: 'Weekly shift roster board, today’s shifts, open shift fill, staff availability, approvals & labour forecast.',
  },
  {
    id: 'all',
    label: 'All Executive Resources (Roster First + Full Command View)',
    shortLabel: 'All Resources (Roster 1st)',
    subject: 'Full Executive Command',
    icon: Building2,
    color: '#5A00D6',
    badge: 'Complete Suite',
    description: 'View Live Roster first alongside Infinity One-Click Operations and every flagship executive resource.',
  },
  {
    id: 'one-click',
    label: '2. Infinity One-Click Operations Deck',
    shortLabel: '2. 1-Click Operations',
    subject: 'Executive Actions',
    icon: Zap,
    color: '#0A2B6D',
    badge: '12 Instant Actions',
    description: '1-Click Audit Packs, Smart-Fill Filing, Staff/Roster/Task Dispatch & Incident/Risk/Expiry Sweeps.',
  },
  {
    id: 'core-engine',
    label: '3. Infinity Core Engine (104 Functions · 65 Workflows)',
    shortLabel: '3. Infinity Core Engine',
    subject: 'AI & Automation',
    icon: Cpu,
    color: '#5A00D6',
    badge: '99.98% Uptime',
    description: 'AI & Automation Command Hub, 6 Real-Time Validation Gates & Predictive Alert Radar.',
  },
  {
    id: 'health-intelligence',
    label: '4. Business Health & Compliance Intelligence',
    shortLabel: '4. Health & NDIS Readiness',
    subject: 'NDIS Practice Standards',
    icon: Activity,
    color: '#A100FF',
    badge: '8 NDIS Standards',
    description: 'Live NDIS Practice Standards readiness scores, 8 executive health indices & board PDF export.',
  },
  {
    id: 'office-workspace',
    label: '5. Executive Office & Dual Profile Workspace',
    shortLabel: '5. Executive Office Wall',
    subject: 'Office & Profiles',
    icon: Vault,
    color: '#FF2E9A',
    badge: 'Dual Screen View',
    description: 'Interactive Executive Office Room with framed wall screens, smart monitor feeds & side-by-side profile comparison.',
  },
  {
    id: 'printable-2026',
    label: '6. Standard 2026 Printable Office Templates (12 A4)',
    shortLabel: '6. 12 A4 Office Templates',
    subject: 'Printable A4 Forms',
    icon: FileText,
    color: '#A100FF',
    badge: 'A4 Print Ready',
    description: '12 A4 ruled & Smart-Fill 2026 templates (Service Agreement, Incident 24h/5d, Risk Matrix, Screening & Handover).',
  },
  {
    id: 'master-checklists',
    label: '7. Master Compliance Audit Checklists (CHR-AUD-001 & 002)',
    shortLabel: '7. Master Audit Checklists',
    subject: 'Audit Checklists',
    icon: ClipboardCheck,
    color: '#5A00D6',
    badge: '17 Cats · 356 Checks',
    description: 'Dual 11-page Master Compliance Audit Checklists for NDIS & HR governance with instant A4 PDF export.',
  },
  {
    id: 'screen-audit-2026',
    label: '8. 45-Screen 2026 Master Audit & Smart-Fill Studio',
    shortLabel: '8. 45-Screen Audit Studio',
    subject: '45-Screen Audit',
    icon: Sparkles,
    color: '#00C6FF',
    badge: '45 Modules',
    description: 'Screen-by-screen 2026 compliance blueprints with 1-Click Smart-Fill document filing & task creation.',
  },
  {
    id: 'incident-analytics',
    label: '9. Friendly Incident & Safety Analytics',
    shortLabel: '9. Friendly Incident Analytics',
    subject: 'Safety Analytics',
    icon: Activity,
    color: '#0072FF',
    badge: 'Supportive View',
    description: 'User-friendly, blame-free incident trends, location hotspots, and supportive safety analytics.',
  },
  {
    id: 'feedback-surveys',
    label: '10. Feedback, Complaints & Satisfaction Surveys',
    shortLabel: '10. Feedback & Surveys',
    subject: 'Feedback & Surveys',
    icon: Sparkles,
    color: '#FF2E9A',
    badge: 'Live Surveys',
    description: 'Participant and staff feedback register, complaint lifecycle tracking, and satisfaction surveys.',
  },
  {
    id: 'module-matrix',
    label: '11. All Platform Modules & Registers Directory',
    shortLabel: '11. All Modules Matrix',
    subject: 'All 45 Modules',
    icon: Layers,
    color: '#FF6EDB',
    badge: `${MODULE_DIRECTORY.length} Modules`,
    description: 'Direct executive launchpad to every operational module, register, portal & AI assistant.',
  },
];

export default function ExecutiveOperationsCentre({ defaultSuite = 'one-click' }) {
  const [activeSuite, setActiveSuite] = useState(defaultSuite);
  const [kpi, setKpi] = useState({
    staff: 0,
    participants: 0,
    shifts: 0,
    tasks: 0,
    incidents: 0,
    risks: 0,
    documents: 0,
    policies: 0,
  });

  const loadKpi = useCallback(async () => {
    const [staff, participants, shifts, tasks, incidents, risks, documents, policies] =
      await Promise.all([
        base44.entities.StaffProfile.count().catch(() => 0),
        base44.entities.ParticipantProfile.count().catch(() => 0),
        base44.entities.Shift.count().catch(() => 0),
        base44.entities.TodoTask.count().catch(() => 0),
        base44.entities.Incident.count().catch(() => 0),
        base44.entities.Risk.count().catch(() => 0),
        base44.entities.EmployeeDocument.count().catch(() => 0),
        base44.entities.Policy.count().catch(() => 0),
      ]);
    setKpi({ staff, participants, shifts, tasks, incidents, risks, documents, policies });
  }, []);

  useEffect(() => {
    loadKpi();
  }, [loadKpi]);

  return (
    <div className="space-y-2 bg-white">
      {/* ==================== EXECUTIVE OPERATIONS CENTRE MASTER BANNER ==================== */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#5A00D6] bg-white shadow-xl">
        <div
          className="border-b-4 border-[#FF2E9A] px-4 py-3 text-white shadow-md"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white p-1 shadow-md">
                <Image
                  src={CHR_LOGO}
                  alt="ComplianceHR Infinity"
                  fittingType="fit"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    <Building2 className="h-3 w-3 text-[#00C6FF]" /> SUBJECT: EXECUTIVE OPERATIONS &amp; ROSTER COMMAND
                  </span>
                  <span className="rounded-full bg-[#00C6FF] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                    ● ROSTER 1ST OPTION · 10 FLAGSHIP SUITES
                  </span>
                </div>
                <h1 className="mt-1 text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  ComplianceHR Infinity — Executive Operations Centre &amp; Live Roster Hub
                </h1>
                <p className="mt-0.5 text-[11px] font-medium text-white/95">
                  Software: ComplianceHR Infinity · Developer: Kristy Lee Whelan · Complete Control. Greater Confidence. Brighter Success.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/compliance"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-sm hover:bg-[#F5F0FF]"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#5A00D6]" />
                Compliance &amp; Report Centre
              </Link>
              <Link
                to="/shared-to-do"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-sm hover:bg-[#F5F0FF]"
              >
                <ClipboardCheck className="h-3.5 w-3.5 text-[#0072FF]" />
                Shared To-Do Command Board
              </Link>
            </div>
          </div>
        </div>

        {/* Executive Live KPI Command Bar — Visually Matching Quick Access */}
        <div className="bg-white p-3 space-y-3">
          <div className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8 items-stretch">
            {[
              { label: 'Active Staff', value: kpi.staff, sub: 'HR & Screening', path: '/our-employees' },
              { label: 'Participants', value: kpi.participants, sub: 'NDIS Plans & Goals', path: '/our-participants' },
              { label: 'Rostered Shifts', value: kpi.shifts, sub: 'Validated Coverage', path: '/roster' },
              { label: 'Command Tasks', value: kpi.tasks, sub: 'Shared To-Do Board', path: '/tasks' },
              { label: 'Incidents', value: kpi.incidents, sub: '24h/5d NDIS SLA', path: '/incidents' },
              { label: 'Active Risks', value: kpi.risks, sub: 'ISO 31000 Controls', path: '/risks' },
              { label: 'Vault Credentials', value: kpi.documents, sub: 'Expiry Monitored', path: '/documents' },
              { label: 'Active Policies', value: kpi.policies, sub: 'Version Controlled', path: '/compliance' },
            ].map((item, idx) => {
              const headerBg = getHeaderView(idx);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group flex h-full min-h-[86px] flex-col gap-[3px] rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] p-[3px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md"
                >
                  <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                    <div
                      className="flex min-h-[34px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                      style={{ background: headerBg }}
                    >
                      <span className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white">
                        {item.label}
                      </span>
                      <span className="rounded-full bg-white px-1.5 py-0.2 text-[9.5px] font-black text-[#0A2B6D]">
                        {item.value}
                      </span>
                    </div>
                    <div className="flex min-h-[34px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                      <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10px] font-bold leading-[12.5px] text-[#0A2B6D]/85">
                        {item.sub}
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                    </div>
                  </div>
                  <div className="flex h-[5px] items-center justify-center">
                    <span className="h-[2.5px] w-6 rounded-full bg-white/45 transition-all group-hover:bg-white/80" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Executive Resource Suite Navigator — Visually Matching Quick Access */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
            <div className="h-1 w-full" style={{ background: SQUISHED_GRADIENT }} />

            <div className="flex flex-col items-center px-3.5 pb-1 pt-2.5 text-center sm:px-4">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs"
              />
              <span className="mt-1 font-editorial text-[12px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]">
                Compliance
                <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </span>
            </div>

            <div className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-2 sm:grid-cols-3 md:grid-cols-6 items-stretch">
              {EXECUTIVE_RESOURCE_SUITES.map((suite, idx) => {
                const Icon = suite.icon;
                const active = activeSuite === suite.id;
                const headerBg = getHeaderView(idx);
                return (
                  <button
                    key={suite.id}
                    type="button"
                    onClick={() => setActiveSuite(suite.id)}
                    aria-pressed={active}
                    className={`group flex h-full min-h-[98px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] text-left transition-all duration-200 focus-visible:outline-none ${
                      active
                        ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                        : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                    }`}
                  >
                    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                      <div
                        className="flex min-h-[38px] w-full items-center justify-between gap-1 px-1.5 py-1 text-white"
                        style={{ background: headerBg }}
                      >
                        <div className="flex min-w-0 items-center gap-1">
                          <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                          <span
                            className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                            style={{ color: '#FFFFFF', wordBreak: 'normal', overflowWrap: 'normal' }}
                          >
                            {suite.shortLabel}
                          </span>
                        </div>
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            active ? 'bg-[#00C6FF]' : 'bg-white/75'
                          }`}
                        />
                      </div>

                      <div className="flex min-h-[40px] w-full flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                        <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/85">
                          {suite.badge} · {suite.subject}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                      </div>
                    </div>

                    <div className="flex h-[5px] w-full items-center justify-center">
                      <span
                        className={`h-[2.5px] w-6 rounded-full transition-all ${
                          active ? 'w-8 bg-[#00C6FF]' : 'bg-white/45 group-hover:bg-white/80'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ==================== 1ST OPTION IN OPERATIONS CENTRE: LIVE ROSTER & SHIFT COVERAGE COMMAND ==================== */}
      {(activeSuite === 'roster' || activeSuite === 'all') && (
        <section className="overflow-hidden rounded-2xl border-2 border-[#0072FF] bg-white shadow-lg">
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-[#FF2E9A] px-4 py-3 text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-white/60 bg-white/20 text-white shadow-sm">
                <CalendarRange className="h-5 w-5 text-white" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-white/45 bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    1st Option · Subject: Rostering, Shifts &amp; Staff Coverage
                  </span>
                  <span className="rounded-full bg-[#00C6FF] px-2 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                    Live Roster Board
                  </span>
                </div>
                <h2 className="mt-0.5 text-base sm:text-lg font-extrabold tracking-tight text-white">
                  1. Live Roster, Shift Scheduling &amp; Coverage Command Centre
                </h2>
                <p className="text-[11px] font-medium text-white/90">
                  View today&apos;s rostered shifts, weekly shift calendar, open shift fill, staff availability, timesheet approvals, and SCHADS labour forecast.
                </p>
              </div>
            </div>
            <Link
              to="/roster"
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-sm hover:bg-[#F5F0FF]"
            >
              Open Full Roster Page <ArrowRight className="h-3.5 w-3.5 text-[#5A00D6]" />
            </Link>
          </div>

          <div className="space-y-3 p-3">
            <RosterMiniOverview />
            <Rostering embedded />
          </div>
        </section>
      )}

      {/* ==================== SUITE: INFINITY CONTROL CENTRE, 356 CHECKS, 98 DOCS & 31 DEV REGISTER ==================== */}
      {activeSuite === 'all' && <InfinityControlCentreMasterSuite />}

      {/* ==================== SUITE 1: INFINITY ONE-CLICK OPERATIONS DECK ==================== */}
      {(activeSuite === 'all' || activeSuite === 'one-click') && <InfinityOneClickOperations />}

      {/* ==================== SUITE 2: INFINITY CORE ENGINE ==================== */}
      {(activeSuite === 'all' || activeSuite === 'core-engine') && <InfinityCoreEngine />}

      {/* ==================== SUITE 3: BUSINESS HEALTH & COMPLIANCE INTELLIGENCE ==================== */}
      {(activeSuite === 'all' || activeSuite === 'health-intelligence') && (
        <BusinessHealthComplianceIntelligenceDashboard />
      )}

      {/* ==================== SUITE 4: EXECUTIVE OFFICE & DUAL PROFILE WORKSPACE ==================== */}
      {(activeSuite === 'all' || activeSuite === 'office-workspace') && (
        <ExecutiveWallScene showRosterAbove={true} />
      )}

      {/* ==================== SUITE 5: STANDARD 2026 PRINTABLE A4 OFFICE TEMPLATES ==================== */}
      {(activeSuite === 'all' || activeSuite === 'printable-2026') && (
        <Standard2026PrintableTemplatesSuite />
      )}

      {/* ==================== SUITE 6: MASTER COMPLIANCE AUDIT CHECKLISTS ==================== */}
      {(activeSuite === 'all' || activeSuite === 'master-checklists') && (
        <MasterComplianceAuditForms />
      )}

      {/* ==================== SUITE 7: 45-SCREEN 2026 MASTER AUDIT & SMART-FILL STUDIO ==================== */}
      {(activeSuite === 'all' || activeSuite === 'screen-audit-2026') && (
        <ScreenByScreenMasterAudit2026 />
      )}

      {/* ==================== SUITE: FRIENDLY INCIDENT ANALYTICS & FEEDBACK SURVEYS IN OPERATIONS CENTRE ==================== */}
      {(activeSuite === 'all' || activeSuite === 'incident-analytics' || activeSuite === 'feedback-surveys') && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {(activeSuite === 'all' || activeSuite === 'incident-analytics') && (
            <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-lg">
              <div
                className="flex items-center justify-between border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
                style={{ background: SQUISHED_GRADIENT }}
              >
                <span className="text-sm font-extrabold text-white">
                  Friendly Incident &amp; Safety Support Analytics (Operations Centre)
                </span>
                <Link to="/incident-analytics" className="rounded-lg bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]">
                  Full View
                </Link>
              </div>
              <div className="p-3">
                <IncidentAnalytics embedded />
              </div>
            </section>
          )}

          {(activeSuite === 'all' || activeSuite === 'feedback-surveys') && (
            <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-lg">
              <div
                className="flex items-center justify-between border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
                style={{ background: SQUISHED_GRADIENT }}
              >
                <span className="text-sm font-extrabold text-white">
                  Feedback, Complaints &amp; Surveys Register (Operations Centre)
                </span>
                <Link to="/feedback" className="rounded-lg bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]">
                  Full View
                </Link>
              </div>
              <div className="p-3">
                <Feedback embedded />
              </div>
            </section>
          )}
        </div>
      )}

      {/* ==================== SUITE 8: ALL MODULES & REGISTERS EXECUTIVE MATRIX ==================== */}
      {(activeSuite === 'all' || activeSuite === 'module-matrix') && (
        <section className="overflow-hidden rounded-2xl border-2 border-[#5A00D6] bg-white shadow-xl">
          <div
            className="border-b-4 border-[#FF2E9A] px-4 py-3 text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/50 bg-white/20 text-white">
                  <Layers className="h-4 w-4 text-white" />
                </span>
                <div>
                  <span className="inline-block rounded-full border border-white/40 bg-white/20 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                    Subject: Complete Platform Directory ({MODULE_DIRECTORY.length} Modules)
                  </span>
                  <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-white">
                    Executive All-Modules Command Matrix ({MODULE_DIRECTORY.length} Connected Modules)
                  </h2>
                  <p className="text-[11px] font-medium text-white/90">
                    Direct 1-Click Executive Launchpad to Every Register, Hub, Portal &amp; AI Assistant
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid auto-rows-fr grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-6 items-stretch bg-white">
            {MODULE_DIRECTORY.map((mod, idx) => {
              const Icon = mod.icon;
              const headerBg = getHeaderView(idx);
              return (
                <Link
                  key={mod.key}
                  to={mod.path}
                  title={`${mod.label} — ${mod.blurb}`}
                  className="group flex h-full min-h-[98px] flex-col gap-[3px] rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] p-[3px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md focus-visible:outline-none"
                >
                  <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                    <div
                      className="flex min-h-[38px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                      style={{ background: headerBg }}
                    >
                      <div className="flex min-w-0 items-center gap-1">
                        <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                        <span
                          className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                          style={{ color: '#FFFFFF', wordBreak: 'normal', overflowWrap: 'normal' }}
                        >
                          {mod.label}
                        </span>
                      </div>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/75" />
                    </div>
                    <div className="flex min-h-[40px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                      <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/85">
                        {mod.blurb}
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                    </div>
                  </div>
                  <div className="flex h-[5px] items-center justify-center">
                    <span className="h-[2.5px] w-6 rounded-full bg-white/45 transition-all group-hover:bg-white/80" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}