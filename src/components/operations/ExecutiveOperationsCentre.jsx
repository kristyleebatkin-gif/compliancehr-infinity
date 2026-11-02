import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Zap, Cpu, Activity, ShieldCheck, FileText, Layers,
  ClipboardCheck, Sparkles, ArrowRight, Vault, CalendarRange,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
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
    label: '1. Roster, Shift Coverage & Scheduling',
    shortLabel: '1. Roster & Shifts',
    subject: 'Rostering & Shifts',
    icon: CalendarRange,
    color: '#0072FF',
    badge: 'Roster workspace',
    description: 'Open the shift roster, daily shifts, staff availability and related records.',
  },
  {
    id: 'all',
    label: 'All Executive Resources (Roster First + Full Command View)',
    shortLabel: 'All Resources (Roster 1st)',
    subject: 'Full Executive Command',
    icon: Building2,
    color: '#5A00D6',
    badge: 'All workspaces',
    description: 'View the roster alongside the other executive workspaces.',
  },
  {
    id: 'one-click',
    label: '2. Infinity One-Click Operations Deck',
    shortLabel: '2. 1-Click Operations',
    subject: 'Executive Actions',
    icon: Zap,
    color: '#0A2B6D',
    badge: 'Operations workspace',
    description: 'Open available operations actions and review their source records before completion.',
  },
  {
    id: 'core-engine',
    label: '3. Infinity Core Engine',
    shortLabel: '3. Infinity Core Engine',
    subject: 'AI & Automation',
    icon: Cpu,
    color: '#5A00D6',
    badge: 'Core workspace',
    description: 'Review available workflow, automation and assistant tools in the Core Engine.',
  },
  {
    id: 'health-intelligence',
    label: '4. Business Health & Compliance Intelligence',
    shortLabel: '4. Health & NDIS Review',
    subject: 'NDIS Practice Standards',
    icon: Activity,
    color: '#A100FF',
    badge: 'Readiness review',
    description: 'Review NDIS standards coverage and health summaries; confirm evidence and status in source records.',
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
    label: '6. Standard 2026 Printable Office Templates',
    shortLabel: '6. Printable Templates',
    subject: 'Printable A4 Forms',
    icon: FileText,
    color: '#A100FF',
    badge: 'Printable templates',
    description: 'Open available printable templates, including service, incident, risk, screening and handover forms.',
  },
  {
    id: 'master-checklists',
    label: '7. Master Compliance Audit Checklists (CHR-AUD-001 & 002)',
    shortLabel: '7. Master Audit Checklists',
    subject: 'Audit Checklists',
    icon: ClipboardCheck,
    color: '#5A00D6',
    badge: 'Audit checklists',
    description: 'Open the master compliance audit checklists for NDIS and HR governance.',
  },
  {
    id: 'screen-audit-2026',
    label: '8. Screen-by-Screen Master Audit & Filing Studio',
    shortLabel: '8. Audit Studio',
    subject: 'Screen-by-Screen Audit',
    icon: Sparkles,
    color: '#00C6FF',
    badge: 'Audit workspace',
    description: 'Open screen-by-screen compliance blueprints and available filing tools.',
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
    badge: 'Feedback workspace',
    description: 'Participant and staff feedback register, complaint lifecycle tracking, and satisfaction surveys.',
  },
  {
    id: 'module-matrix',
    label: '11. Platform Modules & Registers Directory',
    shortLabel: '11. All Modules Matrix',
    subject: 'Module Directory',
    icon: Layers,
    color: '#FF6EDB',
    badge: `${MODULE_DIRECTORY.length} Modules`,
    description: 'Direct executive launchpad to every operational module, register, portal & AI assistant.',
  },
];

export default function ExecutiveOperationsCentre({ defaultSuite = 'one-click' }) {
  const [activeSuite, setActiveSuite] = useState(defaultSuite);
  const [kpi, setKpi] = useState({
    staff: null,
    participants: null,
    shifts: null,
    tasks: null,
    incidents: null,
    risks: null,
    documents: null,
    policies: null,
  });

  const loadKpi = useCallback(async () => {
    const [staff, participants, shifts, tasks, incidents, risks, documents, policies] =
      await Promise.all([
        base44.entities.StaffProfile.count().catch(() => null),
        base44.entities.ParticipantProfile.count().catch(() => null),
        base44.entities.Shift.count().catch(() => null),
        base44.entities.TodoTask.count().catch(() => null),
        base44.entities.Incident.count().catch(() => null),
        base44.entities.Risk.count().catch(() => null),
        base44.entities.EmployeeDocument.count().catch(() => null),
        base44.entities.Policy.count().catch(() => null),
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
                  ComplianceHR Infinity — Executive Operations Centre
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

        {/* Executive Live KPI Circular Control Pods — 50% Compact & Better Data Fit */}
        <div className="bg-white p-2.5 space-y-2.5">
          <div
            className="preserve-island-theme grid auto-rows-fr grid-cols-2 gap-1.5 rounded-2xl border-2 border-[#0A2B6D] p-2 sm:grid-cols-4 lg:grid-cols-8 items-stretch"
            style={{
              background:
                'radial-gradient(circle at 50% 40%, rgba(0, 198, 255, 0.20) 0%, rgba(90, 0, 214, 0.34) 40%, rgba(10, 43, 109, 0.96) 80%, #061539 100%)',
            }}
          >
            {[
              { label: 'Staff', value: kpi.staff, sub: 'Screening & HR', path: '/our-employees', ring: '#00C6FF' },
              { label: 'Participants', value: kpi.participants, sub: 'Plans & Goals', path: '/our-participants', ring: '#0072FF' },
              { label: 'Shifts', value: kpi.shifts, sub: 'Roster Coverage', path: '/roster', ring: '#A100FF' },
              { label: 'Tasks', value: kpi.tasks, sub: 'Open Actions', path: '/tasks', ring: '#FF6EDB' },
              { label: 'Incidents', value: kpi.incidents, sub: '24h/5d SLA', path: '/incidents', ring: '#FF2E9A' },
              { label: 'Risks', value: kpi.risks, sub: 'Risk Controls', path: '/risks', ring: '#00C6FF' },
              { label: 'Documents', value: kpi.documents, sub: 'Vault Records', path: '/documents', ring: '#0072FF' },
              { label: 'Policies', value: kpi.policies, sub: 'Controlled Docs', path: '/compliance', ring: '#A100FF' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="group flex h-full min-h-[54px] flex-col justify-between rounded-3xl border border-white/25 bg-white/10 px-2.5 py-1.5 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00C6FF] hover:shadow-[0_0_14px_rgba(0,198,255,0.6)]"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(10, 43, 109, 0.92) 72%, #061539 100%)',
                }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.2 shadow-2xs">
                    <span className="text-[8px] leading-none" style={{ color: item.ring }}>
                      ◉
                    </span>
                    <span className="text-[9px] font-extrabold leading-tight text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                      {item.label}
                    </span>
                  </span>
                  <span
                    className="rounded-full px-1.5 py-0 text-[9px] font-black text-white"
                    style={{ backgroundColor: item.ring, color: '#0A2B6D' }}
                  >
                    {item.value ?? '—'}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span className="text-[8px] font-bold leading-tight text-white/90" style={{ color: '#E2E8F0' }}>
                    {item.sub}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>

          {/* Executive Resource Suite Navigator — 50% Compact Circular Control Pods */}
          <section
            className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-lg"
            style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)' }}
          >
            <div className="h-1 w-full" style={{ background: SQUISHED_GRADIENT }} />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 bg-white px-3 py-1">
              <div className="flex items-center gap-2">
                <Image
                  src={CHR_LOGO}
                  alt="ComplianceHR Infinity"
                  fittingType="fit"
                  className="h-5 w-12 rounded border border-slate-200 bg-white px-1 py-0.5 shadow-2xs"
                />
                <span className="font-editorial text-[11px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                  Compliance
                  <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
                  <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    Infinity
                  </span>
                </span>
              </div>
              <span className="text-[8px] font-extrabold leading-tight">
                <span style={{ color: '#0072FF' }}>Complete Control.</span>{' '}
                <span style={{ color: '#5A00D6' }}>Greater Confidence.</span>{' '}
                <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
              </span>
            </div>

            <div className="grid auto-rows-fr grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 items-stretch">
              {EXECUTIVE_RESOURCE_SUITES.map((suite, idx) => {
                const Icon = suite.icon;
                const active = activeSuite === suite.id;
                const ringColor = active ? '#00C6FF' : idx % 2 === 0 ? '#00C6FF' : '#FF6EDB';
                return (
                  <button
                    key={suite.id}
                    type="button"
                    onClick={() => setActiveSuite(suite.id)}
                    aria-pressed={active}
                    className={`group flex h-full min-h-[50px] items-center gap-2 rounded-3xl border px-2.5 py-1.5 text-left backdrop-blur-md transition-all duration-200 focus-visible:outline-none ${
                      active
                        ? 'border-[#00C6FF] shadow-[0_0_18px_rgba(0,198,255,0.75)] scale-[1.01]'
                        : 'border-white/25 hover:-translate-y-0.5 hover:border-[#00C6FF] hover:shadow-[0_0_12px_rgba(161,0,255,0.5)]'
                    }`}
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(10, 43, 109, 0.92) 72%, #061539 100%)',
                    }}
                  >
                    {/* Glowing Circular Ring Orb */}
                    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                      <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
                        <circle
                          cx="14"
                          cy="14"
                          r="12"
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="75"
                          strokeDashoffset={active ? '6' : '14'}
                        />
                      </svg>
                      <span
                        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-white"
                        style={{ background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)' }}
                      >
                        <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-white px-2 py-0.2 shadow-2xs">
                          <span className="text-[8px] leading-none" style={{ color: ringColor }}>
                            ◉
                          </span>
                          <span
                            className="text-[9px] font-extrabold leading-tight text-[#0A2B6D]"
                            style={{ color: '#0A2B6D' }}
                          >
                            {suite.shortLabel}
                          </span>
                        </span>
                        <span
                          className={`rounded-full px-1 py-0 text-[6.5px] font-black uppercase ${
                            active ? 'bg-[#00C6FF] text-[#0A2B6D]' : 'bg-white/15 text-white'
                          }`}
                        >
                          {active ? 'ON' : 'LIVE'}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between gap-1">
                        <span
                          className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-white/90"
                          style={{ color: '#E2E8F0' }}
                        >
                          {suite.badge} · {suite.subject}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ==================== ROSTER & SHIFT COVERAGE ==================== */}
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
                    Roster Board
                  </span>
                </div>
                <h2 className="mt-0.5 text-base sm:text-lg font-extrabold tracking-tight text-white">
                  1. Roster, Shift Scheduling &amp; Coverage
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

      {/* ==================== SUITE: INFINITY CONTROL CENTRE ==================== */}
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

      {/* ==================== SUITE: MASTER AUDIT & FILING STUDIO ==================== */}
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

          <div
            className="preserve-island-theme grid auto-rows-fr grid-cols-2 gap-1.5 p-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 items-stretch"
            style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)' }}
          >
            {MODULE_DIRECTORY.map((mod, idx) => {
              const Icon = mod.icon;
              const ringColor = idx % 2 === 0 ? '#00C6FF' : '#FF6EDB';
              return (
                <Link
                  key={mod.key}
                  to={mod.path}
                  title={`${mod.label} — ${mod.blurb}`}
                  className="group flex h-full min-h-[52px] items-center gap-2 rounded-3xl border border-white/25 px-2.5 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00C6FF] hover:shadow-[0_0_16px_rgba(0,198,255,0.65)] focus-visible:outline-none"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(10, 43, 109, 0.92) 72%, #061539 100%)',
                  }}
                >
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                    <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 28 28">
                      <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
                      <circle
                        cx="14"
                        cy="14"
                        r="12"
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="75"
                        strokeDashoffset="10"
                      />
                    </svg>
                    <span
                      className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)' }}
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-white px-2 py-0.2 shadow-2xs">
                        <span className="text-[8px] leading-none" style={{ color: ringColor }}>
                          ◉
                        </span>
                        <span
                          className="text-[9px] font-extrabold leading-tight text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          {mod.label}
                        </span>
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <span
                        className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-white/90"
                        style={{ color: '#E2E8F0' }}
                      >
                        {mod.blurb}
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
                    </div>
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