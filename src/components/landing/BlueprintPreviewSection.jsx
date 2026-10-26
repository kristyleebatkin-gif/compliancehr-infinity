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
  Layers,
} from 'lucide-react';

import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import Reveal from '@/components/landing/Reveal';
import {
  getTilePalette,
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
  getSymbolView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) =>
  keys
    .map((k) => byKey[k])
    .filter(Boolean)
    .map((m) => ({ label: m.label, blurb: m.blurb, key: m.key, path: m.path, icon: m.icon }));

const APP_MODULE_GROUPS = [
  {
    title: 'People, intake and profiles',
    modules: pick('dashboard', 'operations-centre', 'my-profile', 'intake', 'our-staff', 'our-participants', 'visual-boards', 'key-contacts', 'volunteering-placements', 'users'),
  },
  {
    title: 'Service delivery and workforce',
    modules: pick('communications', 'incidents', 'incident-analytics', 'risks', 'rostering', 'goals', 'tasks', 'emergency-response'),
  },
  {
    title: 'Compliance, safety and evidence',
    modules: pick('compliance', 'auditor-portal', 'documents', 'company-safe', 'training', 'certificates', 'quality', 'feedback', 'meetings'),
  },
  {
    title: 'Business, finance and growth',
    modules: pick('invoicing', 'quotes', 'receipts', 'procurement', 'assets', 'analytics', 'human-resources', 'crm', 'projects'),
  },
  {
    title: 'Information, providers and access',
    modules: pick('ndis-provider', 'ndis-news', 'equipment-manuals', 'community-council', 'community-referral', 'programs', 'suggestions-hub', 'help', 'user-guides', 'assistant'),
  },
];

const DATA_FLOWS = [
  { steps: ['Intake Centre', 'Staff & Participant Profiles', 'Rostering', 'Communication Centre', 'Invoicing Centre'] },
  { steps: ['Document Vault & Forms', 'Company Safe', 'Details Checks & Reminders', 'Compliance Centre', 'NDIS Provider Portal'] },
  { steps: ['Incident & Risk Reporting', 'Safety Insights & Controls', 'Quality & Improvement', 'Registers & Reports', 'Continuous Improvement'] },
  { steps: ['Tasks & Goal Progress', 'Feedback & Surveys', 'Business Analytics', 'Projects Hub', 'CRM & Growth'] },
];

const ACCESS_LEVELS = [
  { title: 'Admin & Provider Administrator', desc: 'Full organisation-wide setup, governance & management' },
  { title: 'Compliance, Quality, HR & Finance', desc: 'Dedicated domain managers & accounts officers' },
  { title: 'Operational & Coordination Roles', desc: 'Administration, Team Leader, Rostering, Intake & CRM' },
  { title: 'Support Workers & Volunteers', desc: 'Connected profiles, shifts, training & records' },
  { title: 'Participants & External Auditors', desc: 'Own profile/goals or consent-verified audit records' },
];

export default function BlueprintPreviewSection() {
  const [expandConnections, setExpandConnections] = useState(true);
  const moduleCount = MODULE_DIRECTORY.length;

  return (
    <section
      id="blueprint"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
        <Reveal className="flex flex-col items-center justify-center space-y-2">
          <span
            className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: getHeaderView(1) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Layers className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-center">Current Platform Blueprint · {moduleCount} Connected Modules</span>
          </span>

          <h2
            className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: getTitleGradientView(4) }}
          >
            An accurate map of the ComplianceHR Infinity app
          </h2>
          <p
            className="mx-auto max-w-3xl text-xs sm:text-sm md:text-base font-extrabold"
            style={{ color: getSubheaderColourView(4) }}
          >
            All {moduleCount} current modules, their purpose, access model and connected information flows in one view.
          </p>
        </Reveal>

        {/* How Information Connects & Role-Based Access Model */}
        <div className="w-full rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 text-left space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="inline-flex min-h-[38px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1 text-xs sm:text-sm font-extrabold text-white shadow-2xs"
              style={{ background: getHeaderView(2) }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Workflow className="h-3.5 w-3.5 text-white" />
              </span>
              <span>How Information Connects &amp; Role-Based Access Model</span>
            </span>

            <button
              type="button"
              onClick={() => setExpandConnections((v) => !v)}
              className="inline-flex min-h-[36px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
              style={{ background: getHeaderView(3) }}
            >
              <span>{expandConnections ? 'Minimise Panel' : 'Expand Panel'}</span>
              {expandConnections ? <ChevronUp className="h-3.5 w-3.5 text-white" /> : <ChevronDown className="h-3.5 w-3.5 text-white" />}
            </button>
          </div>

          {expandConnections && (
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className="font-editorial text-sm sm:text-base font-extrabold bg-clip-text text-transparent"
                    style={{ backgroundImage: getTitleGradientView(0) }}
                  >
                    How Information Connects Automatically
                  </h3>
                  <span
                    className="rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ background: getHeaderView(4) }}
                  >
                    Zero Double-Entry
                  </span>
                </div>
                <div className="space-y-2">
                  {DATA_FLOWS.map((flow, fIdx) => (
                    <div
                      key={flow.steps[0]}
                      className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-[#0A2B6D] bg-white px-3 py-2 shadow-2xs"
                    >
                      {flow.steps.map((item, index) => {
                        const tile = getTilePalette(fIdx * 3 + index);
                        return (
                          <React.Fragment key={item}>
                            <span
                              className="rounded-full border-2 border-[#0A2B6D] px-2.5 py-0.5 text-[10.5px] font-extrabold"
                              style={{ backgroundColor: tile.bg, color: tile.text }}
                            >
                              {item}
                            </span>
                            {index < flow.steps.length - 1 && (
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold text-white"
                    style={{ background: getHeaderView(5) }}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                      <Lock className="h-3 w-3 text-white" />
                    </span>
                    <span>Access Follows Role</span>
                  </span>
                  <span
                    className="rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ background: getHeaderView(6) }}
                  >
                    Strict RLS Security
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {ACCESS_LEVELS.map((lvl, idx) => {
                    const tile = getTilePalette(idx + 2);
                    const sym = getSymbolView(idx + 2);
                    return (
                      <div
                        key={lvl.title}
                        className="flex items-center gap-2.5 rounded-2xl border-2 border-[#0A2B6D] px-3.5 py-2 shadow-2xs"
                        style={{ backgroundColor: tile.bg, color: tile.text }}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                          <ShieldCheck className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-extrabold leading-tight" style={{ color: tile.text }}>
                            {lvl.title}
                          </div>
                          <div className="text-[10px] font-bold leading-tight" style={{ color: tile.subtext }}>
                            {lvl.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Workspace Groups */}
        <div className="w-full rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 space-y-4 text-left shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex min-h-[38px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs sm:text-sm font-extrabold text-white"
                style={{ background: getHeaderView(7) }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                  <LayoutDashboard className="h-3.5 w-3.5 text-white" />
                </span>
                <span>Organisation Live Workspace</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold"
                style={{ backgroundColor: getTilePalette(0).bg, color: getTilePalette(0).text }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                  <FileSpreadsheet className="h-3 w-3 text-[#0072FF]" />
                </span>
                Spreadsheet Exchange
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold"
                style={{ backgroundColor: getTilePalette(1).bg, color: getTilePalette(1).text }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                  <Sparkles className="h-3 w-3 text-[#FF2E9A]" />
                </span>
                AI Assistant
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {APP_MODULE_GROUPS.map((group, gIdx) => (
              <div
                key={group.title}
                className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                    style={{ background: getHeaderView(gIdx) }}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                      <Layers className="h-3 w-3 text-white" />
                    </span>
                    <span>{group.title}</span>
                  </span>
                  <span
                    className="rounded-full border-2 border-[#0A2B6D] px-3 py-0.5 text-xs font-extrabold"
                    style={{ backgroundColor: getTilePalette(gIdx + 2).bg, color: getTilePalette(gIdx + 2).text }}
                  >
                    {group.modules.length} modules
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {group.modules.map((mod, mIdx) => {
                    const Icon = mod.icon || ShieldCheck;
                    const tile = getTilePalette(gIdx * 3 + mIdx);
                    const sym = getSymbolView(gIdx * 3 + mIdx);
                    return (
                      <Link
                        key={mod.key}
                        to={mod.path}
                        className="group flex items-start gap-2.5 rounded-2xl border-2 border-[#0A2B6D] p-3 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                        style={{ backgroundColor: tile.bg, color: tile.text }}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-sm">
                          <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold leading-tight" style={{ color: tile.text }}>
                            {mod.label}
                          </div>
                          <div className="mt-0.5 text-[11px] font-bold leading-snug" style={{ color: tile.subtext }}>
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
    </section>
  );
}