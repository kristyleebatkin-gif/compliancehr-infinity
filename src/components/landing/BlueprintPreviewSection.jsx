import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileSpreadsheet,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Workflow,
  Lock,
} from 'lucide-react';

import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import Reveal from '@/components/landing/Reveal';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) =>
  keys
    .map((k) => byKey[k])
    .filter(Boolean)
    .map((m) => ({ label: m.label, blurb: m.blurb, key: m.key, path: m.path, icon: m.icon }));

const APP_MODULE_GROUPS = [
  {
    title: 'People, intake and profiles',
    color: '#0072FF',
    modules: pick('dashboard', 'operations-centre', 'my-profile', ' intake'.trim(), 'our-staff', 'our-participants', 'visual-boards', 'key-contacts', 'volunteering-placements', 'users'),
  },
  {
    title: 'Service delivery and workforce',
    color: '#0A2B6D',
    modules: pick('communications', 'incidents', 'incident-analytics', 'risks', 'rostering', 'goals', 'tasks', 'emergency-response'),
  },
  {
    title: 'Compliance, safety and evidence',
    color: '#5A00D6',
    modules: pick('compliance', 'auditor-portal', 'documents', 'company-safe', 'training', 'certificates', 'quality', 'feedback', 'meetings'),
  },
  {
    title: 'Business, finance and growth',
    color: '#A100FF',
    modules: pick('invoicing', 'quotes', 'receipts', 'procurement', 'assets', 'analytics', 'human-resources', 'crm', 'projects'),
  },
  {
    title: 'Information, providers and access',
    color: '#FF2E9A',
    modules: pick('ndis-provider', 'ndis-news', 'equipment-manuals', 'community-council', 'community-referral', 'programs', 'suggestions-hub', 'help', 'user-guides', 'assistant'),
  },
];

const DATA_FLOWS = [
  { color: '#0072FF', steps: ['Intake Centre', 'Staff & Participant Profiles', 'Rostering', 'Communication Centre', 'Invoicing Centre'] },
  { color: '#5A00D6', steps: ['Document Vault & Forms', 'Company Safe', 'Details Checks & Reminders', 'Compliance Centre', 'NDIS Provider Portal'] },
  { color: '#A100FF', steps: ['Incident & Risk Reporting', 'Safety Insights & Controls', 'Quality & Improvement', 'Registers & Reports', 'Continuous Improvement'] },
  { color: '#FF2E9A', steps: ['Tasks & Goal Progress', 'Feedback & Surveys', 'Business Analytics', 'Projects Hub', 'CRM & Growth'] },
];

const ACCESS_LEVELS = [
  { title: 'Admin & Provider Administrator', desc: 'Full organisation-wide setup, governance & management', color: '#0072FF' },
  { title: 'Compliance, Quality, HR & Finance', desc: 'Dedicated domain managers & accounts officers', color: '#5A00D6' },
  { title: 'Operational & Coordination Roles', desc: 'Administration, Team Leader, Rostering, Intake & CRM', color: '#A100FF' },
  { title: 'Support Workers & Volunteers', desc: 'Connected profiles, shifts, training & records', color: '#FF2E9A' },
  { title: 'Participants & External Auditors', desc: 'Own profile/goals or consent-verified audit records', color: '#00C6FF' },
];

export default function BlueprintPreviewSection() {
  const [expandConnections, setExpandConnections] = useState(true);
  const moduleCount = MODULE_DIRECTORY.length;

  return (
    <section
      id="blueprint"
      className="relative mx-auto max-w-6xl scroll-mt-16 overflow-hidden rounded-3xl border-2 border-[#0A2B6D] bg-gradient-to-br from-[#F5F0FF] via-white to-[#FFF0F8] px-4 py-8 sm:py-10 shadow-xl md:px-8 space-y-5"
      style={{ borderTopWidth: '4px', borderTopColor: '#0072FF' }}
    >
      {/* Top Heading Banner: An Accurate Map of the ComplianceHR Infinity App */}
      <Reveal
        className="mx-auto rounded-2xl border-2 border-[#0A2B6D] px-4 py-3.5 text-center text-white shadow-md"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="mx-auto inline-flex rounded-full border border-white/40 bg-white/20 px-3.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
          Current platform blueprint · {moduleCount} Connected Modules
        </div>
        <h2 className="mt-2 font-editorial text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          An accurate map of the ComplianceHR Infinity app
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-white/95">
          All {moduleCount} current modules, their purpose, access model and connected information flows in one colourful view.
        </p>
      </Reveal>

      {/* MINIMISED, COLOURFUL, APP-BORDERED "HOW INFORMATION CONNECTS" & "ACCESS FOLLOWS ROLE" — MOVED HERE BEFORE LIVE WORKSPACE */}
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-md" style={{ borderTopWidth: '4px', borderTopColor: '#5A00D6' }}>
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] px-3 py-1.5 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-[#00C6FF]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              How Information Connects &amp; Role-Based Access Model (Compact Overview)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpandConnections((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-white bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold text-white hover:bg-white/30"
          >
            {expandConnections ? 'Minimise Panel' : 'Expand Panel'}
            {expandConnections ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {expandConnections && (
          <div className="mt-2.5 grid gap-3 lg:grid-cols-12">
            {/* Compact Colourful Information Flows (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/60 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  🔗 How Information Connects Automatically
                </h3>
                <span className="rounded-full bg-[#0072FF] px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                  Zero Double-Entry
                </span>
              </div>
              <div className="space-y-1.5">
                {DATA_FLOWS.map((flow) => (
                  <div
                    key={flow.steps[0]}
                    className="flex flex-wrap items-center gap-1 rounded-lg border border-[#0A2B6D]/40 bg-white px-2 py-1 shadow-2xs"
                    style={{ borderLeftWidth: '4px', borderLeftColor: flow.color }}
                  >
                    {flow.steps.map((item, index) => (
                      <React.Fragment key={item}>
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white"
                          style={{ backgroundColor: flow.color }}
                        >
                          {item}
                        </span>
                        {index < flow.steps.length - 1 && (
                          <ArrowRight className="h-3 w-3 shrink-0 text-[#0A2B6D]" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Colourful Access Model (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border-2 border-[#0A2B6D] bg-[#FFF0F8]/60 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  <Lock className="h-3.5 w-3.5 text-[#FF2E9A]" /> Access Follows the Person&apos;s Role
                </h3>
                <span className="rounded-full bg-[#FF2E9A] px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                  Strict RLS Security
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {ACCESS_LEVELS.map((lvl) => (
                  <div
                    key={lvl.title}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#0A2B6D]/40 bg-white px-2.5 py-1 shadow-2xs"
                    style={{ borderLeftWidth: '4px', borderLeftColor: lvl.color }}
                  >
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-extrabold text-[#0A2B6D] leading-tight">
                        {lvl.title}
                      </div>
                      <div className="text-[9.5px] font-semibold text-[#5A00D6] leading-tight">
                        {lvl.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIBRANT, MULTI-COLOURED LIVE WORKSPACE WINDOW */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#0A2B6D] bg-white shadow-xl">
        <div
          className="flex flex-wrap items-center gap-2 border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="h-3 w-3 rounded-full bg-[#FF2E9A] ring-1 ring-white" />
          <span className="h-3 w-3 rounded-full bg-[#00C6FF] ring-1 ring-white" />
          <span className="h-3 w-3 rounded-full bg-[#C084FC] ring-1 ring-white" />
          <div className="ml-2 min-w-0 flex-1 rounded-lg border border-white/40 bg-white/20 px-3 py-1 text-xs font-extrabold text-white">
            compliancehrinfinity.com/dashboard — All {moduleCount} Connected Modules
          </div>
          <span className="rounded-full border border-[#0A2B6D] bg-[#00C6FF] px-3 py-1 text-[10px] font-extrabold text-[#0A2B6D] shadow-2xs">
            LIVE WORKSPACE
          </span>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr]">
          {/* Colourful Sidebar Preview */}
          <aside
            className="hidden border-r-2 border-[#0A2B6D] p-3 lg:block"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,114,255,0.10) 0%, rgba(90,0,214,0.12) 50%, rgba(255,46,154,0.10) 100%)',
            }}
          >
            <div className="flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white p-2 shadow-2xs">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-brand text-white shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-extrabold text-[#0A2B6D]">ComplianceHR Infinity</div>
                <div className="text-[10px] font-extrabold text-[#5A00D6]">Provider Workspace</div>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {APP_MODULE_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className="rounded-xl border-2 border-[#0A2B6D] bg-white p-2 shadow-2xs"
                  style={{ borderTopWidth: '3px', borderTopColor: group.color }}
                >
                  <div
                    className="text-[9.5px] font-extrabold uppercase tracking-wider"
                    style={{ color: group.color }}
                  >
                    {group.title}
                  </div>
                  <div className="mt-1 space-y-1">
                    {group.modules.slice(0, 3).map((m) => (
                      <Link
                        key={m.key}
                        to={m.path}
                        className="flex items-center gap-1.5 rounded-md bg-[#F5F0FF] px-1.5 py-0.5 text-[10px] font-bold text-[#0A2B6D] hover:bg-[#EDE9FE]"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="truncate">{m.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Colourful Live Workspace Canvas */}
          <div className="bg-gradient-to-br from-white via-[#F5F0FF]/50 to-[#FFF0F8]/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-sm">
                  <LayoutDashboard className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-editorial text-lg font-extrabold text-[#0A2B6D]">
                    Organisation Live Workspace
                  </div>
                  <div className="text-xs font-bold text-[#5A00D6]">
                    People, service delivery, compliance and business operations connected in full colour.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0A2B6D] bg-[#0072FF] px-2.5 py-1 text-[10.5px] font-extrabold text-white">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Spreadsheet Exchange
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0A2B6D] bg-[#FF2E9A] px-2.5 py-1 text-[10.5px] font-extrabold text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Assistant
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {APP_MODULE_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-sm"
                  style={{ borderTopWidth: '4px', borderTopColor: group.color }}
                >
                  <div
                    className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#0A2B6D] px-3 py-1.5 text-white"
                    style={{ backgroundColor: group.color }}
                  >
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      {group.title}
                    </h3>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                      {group.modules.length} modules
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {group.modules.map((mod) => {
                      const modColor = moduleKeyColour(mod.key) || group.color;
                      const Icon = mod.icon || ShieldCheck;
                      return (
                        <Link
                          key={mod.key}
                          to={mod.path}
                          className="group relative flex items-start gap-2.5 overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                          style={{
                            borderLeftWidth: '5px',
                            borderLeftColor: modColor,
                            background: `linear-gradient(135deg, ${modColor}18 0%, #ffffff 82%)`,
                          }}
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#0A2B6D] text-white shadow-sm"
                            style={{ backgroundColor: modColor }}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-extrabold leading-tight text-[#0A2B6D]">
                              {mod.label}
                            </div>
                            <div className="mt-0.5 text-[10.5px] font-semibold leading-snug text-[#0A2B6D]/85">
                              {mod.blurb}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}