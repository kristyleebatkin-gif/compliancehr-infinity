import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Zap, Cpu, Activity, ShieldCheck, FileText, Layers,
  ClipboardCheck, Sparkles, ArrowRight, Vault,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import Standard2026PrintableTemplatesSuite from '@/components/compliance/Standard2026PrintableTemplatesSuite';
import MasterComplianceAuditForms from '@/components/compliance/MasterComplianceAuditForms';
import ScreenByScreenMasterAudit2026 from '@/components/compliance/ScreenByScreenMasterAudit2026';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

const EXECUTIVE_RESOURCE_SUITES = [
  {
    id: 'all',
    label: 'All Executive Resources (Full Command View)',
    shortLabel: 'All Resources',
    icon: Building2,
    color: '#4f46e5',
    badge: 'Complete Suite',
    description: 'View Infinity One-Click Operations alongside every flagship executive resource in one unified command centre.',
  },
  {
    id: 'one-click',
    label: '1. Infinity One-Click Operations Deck',
    shortLabel: '1-Click Operations',
    icon: Zap,
    color: '#db2777',
    badge: '12 Instant Actions',
    description: '1-Click Audit Packs, Smart-Fill Filing, Staff/Roster/Task Dispatch & Incident/Risk/Expiry Sweeps.',
  },
  {
    id: 'core-engine',
    label: '2. Infinity Core Engine (104 Functions · 65 Workflows)',
    shortLabel: 'Infinity Core Engine',
    icon: Cpu,
    color: '#7c3aed',
    badge: '99.98% Uptime',
    description: 'AI & Automation Command Hub, 6 Real-Time Validation Gates & Predictive Alert Radar.',
  },
  {
    id: 'health-intelligence',
    label: '3. Business Health & Compliance Intelligence',
    shortLabel: 'Health & NDIS Readiness',
    icon: Activity,
    color: '#2563eb',
    badge: '8 NDIS Standards',
    description: 'Live NDIS Practice Standards readiness scores, 8 executive health indices & board PDF export.',
  },
  {
    id: 'office-workspace',
    label: '4. Executive Office & Dual Profile Workspace',
    shortLabel: 'Executive Office Wall',
    icon: Vault,
    color: '#0891b2',
    badge: 'Dual Screen View',
    description: 'Interactive Executive Office Room with framed wall screens, smart monitor feeds & side-by-side profile comparison.',
  },
  {
    id: 'printable-2026',
    label: '5. Standard 2026 Printable Office Templates (12 A4)',
    shortLabel: '12 A4 Office Templates',
    icon: FileText,
    color: '#0d9488',
    badge: 'A4 Print Ready',
    description: '12 A4 ruled & Smart-Fill 2026 templates (Service Agreement, Incident 24h/5d, Risk Matrix, Screening & Handover).',
  },
  {
    id: 'master-checklists',
    label: '6. Master Compliance Audit Checklists (CHR-AUD-001 & 002)',
    shortLabel: 'Master Audit Checklists',
    icon: ClipboardCheck,
    color: '#6d28d9',
    badge: '17 Cats · 356 Checks',
    description: 'Dual 11-page Master Compliance Audit Checklists for NDIS & HR governance with instant A4 PDF export.',
  },
  {
    id: 'screen-audit-2026',
    label: '7. 45-Screen 2026 Master Audit & Smart-Fill Studio',
    shortLabel: '45-Screen Audit Studio',
    icon: Sparkles,
    color: '#ea580c',
    badge: '45 Modules',
    description: 'Screen-by-screen 2026 compliance blueprints with 1-Click Smart-Fill document filing & task creation.',
  },
  {
    id: 'module-matrix',
    label: '8. All Platform Modules & Registers Directory',
    shortLabel: 'All Modules Matrix',
    icon: Layers,
    color: '#be123c',
    badge: `${MODULE_DIRECTORY.length} Modules`,
    description: 'Direct executive launchpad to every operational module, register, portal & AI assistant.',
  },
];

export default function ExecutiveOperationsCentre({ defaultSuite = 'all' }) {
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
      <div className="overflow-hidden rounded-2xl border-4 border-purple-700 bg-white shadow-xl">
        <div className="px-3.5 py-2.5 text-white" style={{ background: SQUISHED_GRADIENT }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-md ring-2 ring-amber-300">
                <Image
                  src={CHR_LOGO}
                  alt="ComplianceHR Infinity"
                  fittingType="fit"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-blue-950">
                    <Building2 className="h-3 w-3" /> EXECUTIVE OPERATIONS &amp; RESOURCE COMMAND CENTRE
                  </span>
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[7.5px] font-black text-white">
                    ● LIVE EXECUTIVE COMMAND · 9 FLAGSHIP SUITES
                  </span>
                </div>
                <h1 className="mt-0.5 text-base sm:text-lg font-black tracking-tight text-white">
                  ComplianceHR Infinity — Executive Operations Centre &amp; One-Click Resource Hub
                </h1>
                <p className="text-[8.5px] font-extrabold text-amber-100">
                  Software: ComplianceHR Infinity · Business: ComplianceHR Infinity · Developer: Kristy Lee Whelan · Email: kristyleebatkin@live.com.au · Complete Control. Greater Confidence. Brighter Success.
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
              { label: 'Active Staff', value: kpi.staff, sub: 'HR & Screening', color: '#2563eb', path: '/our-employees' },
              { label: 'Participants', value: kpi.participants, sub: 'NDIS Plans & Goals', color: '#e11d48', path: '/our-participants' },
              { label: 'Rostered Shifts', value: kpi.shifts, sub: 'Validated Coverage', color: '#4f46e5', path: '/roster' },
              { label: 'Command Tasks', value: kpi.tasks, sub: 'Shared To-Do Board', color: '#ef4444', path: '/tasks' },
              { label: 'Incidents', value: kpi.incidents, sub: '24h/5d NDIS SLA', color: '#dc2626', path: '/incidents' },
              { label: 'Active Risks', value: kpi.risks, sub: 'ISO 31000 Controls', color: '#ea580c', path: '/risks' },
              { label: 'Vault Credentials', value: kpi.documents, sub: 'Expiry Monitored', color: '#0d9488', path: '/documents' },
              { label: 'Active Policies', value: kpi.policies, sub: 'Version Controlled', color: '#6d28d9', path: '/compliance' },
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
          <div className="rounded-xl border-2 border-purple-300 bg-purple-50/30 p-1.5">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1 px-1">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-purple-950">
                Executive Resource Command Switcher — Select Any Resource Suite or View All Together
              </span>
              <span className="text-[7.5px] font-extrabold text-pink-700">
                9 Executive Suites + All {MODULE_DIRECTORY.length} Operational Modules Connected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
              {EXECUTIVE_RESOURCE_SUITES.map((suite) => {
                const Icon = suite.icon;
                const active = activeSuite === suite.id;
                return (
                  <button
                    key={suite.id}
                    type="button"
                    onClick={() => setActiveSuite(suite.id)}
                    className={`flex flex-col justify-between rounded-lg border p-1.5 text-left transition-all ${
                      active
                        ? 'ring-2 ring-pink-500 text-white shadow-md'
                        : 'bg-white text-blue-950 hover:bg-purple-50'
                    }`}
                    style={
                      active
                        ? { background: SQUISHED_GRADIENT, borderColor: '#ec4899' }
                        : { borderColor: suite.color, borderLeftWidth: '4px' }
                    }
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-white`}
                        style={{ background: active ? 'rgba(255,255,255,0.25)' : suite.color }}
                      >
                        <Icon className="h-2.5 w-2.5" />
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0 text-[6.5px] font-black ${
                          active ? 'bg-amber-300 text-blue-950' : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {suite.badge}
                      </span>
                    </div>
                    <div
                      className={`mt-1 truncate text-[8.5px] font-black leading-tight ${
                        active ? 'text-white' : 'text-blue-950'
                      }`}
                    >
                      {suite.shortLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
        <section className="overflow-hidden rounded-2xl border-4 border-purple-700 bg-white shadow-xl">
          <div className="px-3 py-2 text-white" style={{ background: SQUISHED_GRADIENT }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-300" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    Executive All-Modules Command Matrix ({MODULE_DIRECTORY.length} Connected Modules)
                  </h2>
                  <p className="text-[8px] font-bold text-amber-100">
                    Direct 1-Click Executive Launchpad to Every Register, Hub, Portal &amp; AI Assistant
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 p-1.5 bg-white">
            {MODULE_DIRECTORY.map((mod) => {
              const Icon = mod.icon;
              const colour = moduleKeyColour(mod.key);
              return (
                <Link
                  key={mod.key}
                  to={mod.path}
                  className="group flex flex-col justify-between rounded-lg border bg-white p-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderColor: colour,
                    borderLeftWidth: '4px',
                    background: `linear-gradient(135deg, ${colour}12 0%, #ffffff 85%)`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-sm"
                      style={{ background: colour }}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <span className="truncate text-[8.5px] font-black text-blue-950">
                      {mod.label}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[7px] font-semibold text-blue-900/85 leading-tight">
                    {mod.blurb}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}