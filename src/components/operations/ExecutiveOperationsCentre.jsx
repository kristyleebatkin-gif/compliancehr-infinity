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
    id: 'module-matrix',
    label: '9. All Platform Modules & Registers Directory',
    shortLabel: '9. All Modules Matrix',
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

            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                to="/compliance"
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[8px] font-black text-purple-950 shadow-sm hover:bg-purple-50"
              >
                <ShieldCheck className="h-3 w-3 text-purple-700" />
                Compliance &amp; Report Centre
              </Link>
              <Link
                to="/shared-to-do"
                className="inline-flex items-center gap-1 rounded-lg bg-amber-300 px-2.5 py-1 text-[8px] font-black text-blue-950 shadow-sm hover:bg-amber-200"
              >
                <ClipboardCheck className="h-3 w-3" />
                Shared To-Do Command Board
              </Link>
            </div>
          </div>
        </div>

        {/* Executive Live KPI Command Bar */}
        <div className="bg-white p-1.5 space-y-1.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
            {[
              { label: 'Active Staff', value: kpi.staff, sub: 'HR & Screening', color: '#0072FF', path: '/our-employees' },
              { label: 'Participants', value: kpi.participants, sub: 'NDIS Plans & Goals', color: '#0A2B6D', path: '/our-participants' },
              { label: 'Rostered Shifts', value: kpi.shifts, sub: 'Validated Coverage', color: '#5A00D6', path: '/roster' },
              { label: 'Command Tasks', value: kpi.tasks, sub: 'Shared To-Do Board', color: '#A100FF', path: '/tasks' },
              { label: 'Incidents', value: kpi.incidents, sub: '24h/5d NDIS SLA', color: '#FF2E9A', path: '/incidents' },
              { label: 'Active Risks', value: kpi.risks, sub: 'ISO 31000 Controls', color: '#FF6EDB', path: '/risks' },
              { label: 'Vault Credentials', value: kpi.documents, sub: 'Expiry Monitored', color: '#00C6FF', path: '/documents' },
              { label: 'Active Policies', value: kpi.policies, sub: 'Version Controlled', color: '#C084FC', path: '/compliance' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="group rounded-lg border bg-white p-1.5 shadow-sm transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: item.color,
                  borderTopWidth: '3px',
                  background: `linear-gradient(145deg, ${item.color}12 0%, #ffffff 82%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-black uppercase tracking-wider text-purple-900">
                    {item.label}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 text-purple-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-0.5 text-sm font-black text-blue-950">{item.value}</div>
                <div className="text-[6.8px] font-bold text-purple-800">{item.sub}</div>
              </Link>
            ))}
          </div>

          {/* Executive Resource Suite Navigator */}
          <div className="rounded-xl border-2 border-[#5A00D6]/50 bg-[#F5F0FF] p-2">
            <div
              className="mb-2 flex flex-wrap items-center justify-between gap-1.5 rounded-lg border-2 border-[#5A00D6] border-b-4 border-b-[#FF2E9A] px-3 py-1.5 text-white shadow-sm"
              style={{ background: SQUISHED_GRADIENT }}
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                Executive Command Switcher — Option 1: Live Roster &amp; Shift Coverage
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                10 Executive Suites + All {MODULE_DIRECTORY.length} Modules
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {EXECUTIVE_RESOURCE_SUITES.map((suite) => {
                const Icon = suite.icon;
                const active = activeSuite === suite.id;
                return (
                  <button
                    key={suite.id}
                    type="button"
                    onClick={() => setActiveSuite(suite.id)}
                    className={`flex flex-col justify-between rounded-xl border-2 p-2 text-left transition-all ${
                      active
                        ? 'ring-2 ring-[#FF2E9A] text-white shadow-md'
                        : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                    }`}
                    style={
                      active
                        ? { background: SQUISHED_GRADIENT, borderColor: '#FF2E9A' }
                        : { borderColor: suite.color, borderTopWidth: '4px' }
                    }
                  >
                    <div className="flex items-center justify-between gap-1 border-b pb-1" style={{ borderColor: active ? 'rgba(255,255,255,0.25)' : `${suite.color}35` }}>
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-2xs"
                        style={{ background: active ? 'rgba(255,255,255,0.25)' : suite.color }}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                          active ? 'bg-white text-[#0A2B6D]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                        }`}
                      >
                        {suite.subject}
                      </span>
                    </div>
                    <div
                      className={`mt-1.5 text-xs font-extrabold leading-snug ${
                        active ? 'text-white' : 'text-[#0A2B6D]'
                      }`}
                    >
                      {suite.shortLabel}
                    </div>
                    <p
                      className={`mt-0.5 line-clamp-2 text-[10px] font-medium leading-tight ${
                        active ? 'text-white/90' : 'text-[#0A2B6D]/75'
                      }`}
                    >
                      {suite.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2.5 bg-white">
            {MODULE_DIRECTORY.map((mod) => {
              const Icon = mod.icon;
              const colour = moduleKeyColour(mod.key);
              return (
                <Link
                  key={mod.key}
                  to={mod.path}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderColor: colour }}
                >
                  <div
                    className="flex items-center justify-between gap-1.5 border-b-2 px-2.5 py-1.5 text-white"
                    style={{
                      background: `linear-gradient(120deg, ${colour} 0%, #5A00D6 100%)`,
                      borderBottomColor: '#FF2E9A',
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/50 bg-white/20 text-white shadow-2xs">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[9px] font-extrabold uppercase tracking-wider text-white/90">
                          {mod.group || 'Module'}
                        </div>
                        <div className="text-xs font-extrabold leading-tight text-white">
                          {mod.label}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/90 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-[11px] font-medium text-[#0A2B6D]/85 leading-snug">
                      {mod.blurb}
                    </p>
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