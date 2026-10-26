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
import {
  getHeaderView,
  getSubheaderColourView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

// Bright Pink, Light Blue, and Purple tiles for "How Information Connects Automatically"
const FLOW_TILE_STYLES = [
  { bg: '#FF2E9A', text: '#FFFFFF' }, // Bright Pink
  { bg: '#38BDF8', text: '#0A2B6D' }, // Light Blue
  { bg: '#9333EA', text: '#FFFFFF' }, // Purple
];

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
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* "An accurate map..." and Black Writing Under Inside a Stretched App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white px-4 py-3.5 sm:px-6 sm:py-4 text-center space-y-1.5">
            <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
              <span className="text-[#0A2B6D]">An accurate map of the </span>
              <span className="text-[#0A2B6D]">Compliance</span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity app
              </span>
            </h2>
            <p
              className="mx-auto w-full text-xs sm:text-sm font-extrabold leading-snug text-black"
              style={{ color: '#000000' }}
            >
              All {moduleCount} current modules, their purpose, access model and connected information flows in one view.
            </p>
          </div>
        </div>

        {/* Stretched Side-to-Side "Current Platform Blueprint" Underneath Writing in App Design Coloured Border */}
        <div
          className="w-full rounded-full p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(1) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Layers className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-center">Current Platform Blueprint · {moduleCount} Connected Modules</span>
          </div>
        </div>

        {/* How Information Connects & Role-Based Access Model — App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white p-4 text-left space-y-3.5">
            {/* Stretched Header Border with White Writing */}
            <div
              className="w-full rounded-2xl p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="gradient-brand flex w-full items-center justify-center gap-2.5 rounded-[13px] px-4 py-2.5 text-white"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <Workflow className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span
                  className="text-xs sm:text-sm md:text-base font-extrabold text-white"
                  style={{ color: '#FFFFFF' }}
                >
                  How Information Connects &amp; Role-Based Access Model
                </span>
              </div>
            </div>

            {expandConnections && (
              <div className="grid gap-4 lg:grid-cols-12">
                {/* Left Column: How Information Connects Automatically */}
                <div
                  className="lg:col-span-7 rounded-2xl p-[3.5px] shadow-2xs flex"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex w-full flex-col justify-between rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Stretched Header in App Design Coloured Border with White Writing */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="gradient-brand flex w-full flex-wrap items-center justify-between gap-2 rounded-[9px] px-4 py-2 text-white"
                        style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                      >
                        <span
                          className="font-editorial text-sm sm:text-base font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          How Information Connects Automatically
                        </span>
                        <span
                          className="rounded-full border border-white bg-white/20 px-3 py-0.5 text-[10px] font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          Zero Double-Entry
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {DATA_FLOWS.map((flow, fIdx) => (
                        <div
                          key={flow.steps[0]}
                          className="rounded-2xl p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 rounded-[13px] bg-white px-3 py-2">
                            {flow.steps.map((item, index) => {
                              const idx = fIdx * 5 + index;
                              const flowTile = FLOW_TILE_STYLES[idx % FLOW_TILE_STYLES.length];
                              return (
                                <React.Fragment key={item}>
                                  <div
                                    className="rounded-full p-[2px] shadow-2xs"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <span
                                      className="block rounded-full px-3 py-1 text-[11px] font-extrabold"
                                      style={{
                                        backgroundColor: flowTile.bg,
                                        color: flowTile.text,
                                      }}
                                    >
                                      {item}
                                    </span>
                                  </div>
                                  {index < flow.steps.length - 1 && (
                                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Access Follows Role */}
                <div
                  className="lg:col-span-5 rounded-2xl p-[3.5px] shadow-2xs flex"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex w-full flex-col justify-between rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Stretched Header in App Design Coloured Border with White Writing */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="gradient-brand flex w-full flex-wrap items-center justify-between gap-2 rounded-[9px] px-4 py-2 text-white"
                        style={{ background: getHeaderView(5), color: '#FFFFFF' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <Lock className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span
                            className="font-editorial text-sm sm:text-base font-extrabold text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            Access Follows Role
                          </span>
                        </div>
                        <span
                          className="rounded-full border border-white bg-white/20 px-3 py-0.5 text-[10px] font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          Strict RLS Security
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {ACCESS_LEVELS.map((lvl, idx) => {
                        const sym = getSymbolView(idx + 2);
                        const borderCol = getAppBorderView(idx + 2);
                        const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                        return (
                          <div
                            key={lvl.title}
                            className="rounded-2xl p-[2.5px] shadow-2xs"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          >
                            <div
                              className="flex flex-col gap-1.5 rounded-[13px] p-2.5 text-[#0A2B6D]"
                              style={{ background: sprayBg }}
                            >
                              {/* Title Header in App Design Coloured Border with White Background */}
                              <div
                                className="w-full rounded-xl p-[2px] shadow-2xs"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <div className="flex items-center gap-2 rounded-[9px] bg-white px-2.5 py-1.5">
                                  <span
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                    style={{ borderColor: borderCol }}
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                                  </span>
                                  <span className="text-xs font-extrabold leading-tight text-[#0A2B6D]">
                                    {lvl.title}
                                  </span>
                                </div>
                              </div>
                              <div className="px-1 text-[11px] font-bold leading-snug text-[#0A2B6D]">
                                {lvl.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Smaller Minimise Button on Bottom Right of Section */}
            <div className="flex w-full justify-end pt-1">
              <div
                className="rounded-full p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <button
                  type="button"
                  onClick={() => setExpandConnections((v) => !v)}
                  className="gradient-brand inline-flex min-h-[26px] items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white transition-all hover:opacity-95"
                  style={{ background: getHeaderView(2), color: '#FFFFFF' }}
                >
                  <span style={{ color: '#FFFFFF' }}>
                    {expandConnections ? 'Minimise' : 'Expand'}
                  </span>
                  {expandConnections ? (
                    <ChevronUp className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Workspace Groups — App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white p-4 space-y-4 text-left">
            {/* Stretched Header Border for Organisation Live Workspace */}
            <div
              className="w-full rounded-2xl p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-[13px] px-4 py-2.5 text-white"
                style={{ background: getHeaderView(7) }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                    <LayoutDashboard className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-extrabold text-white">
                    Organisation Live Workspace
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div
                    className="rounded-full p-[2px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <span
                      className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-white"
                      style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                        <FileSpreadsheet className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>Spreadsheet Exchange</span>
                    </span>
                  </div>
                  <div
                    className="rounded-full p-[2px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <span
                      className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-white"
                      style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                        <Sparkles className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>AI Assistant</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {APP_MODULE_GROUPS.map((group, gIdx) => (
                <div
                  key={group.title}
                  className="rounded-2xl p-[3.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Stretched Group Header Border */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="gradient-brand flex w-full flex-wrap items-center justify-between gap-2 rounded-[9px] px-4 py-2 text-white"
                        style={{ background: getHeaderView(gIdx), color: '#FFFFFF' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <Layers className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span
                            className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {group.title}
                          </span>
                        </div>
                        <span
                          className="rounded-full border border-white bg-white/20 px-3 py-0.5 text-xs font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {group.modules.length} modules
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                      {group.modules.map((mod, mIdx) => {
                        const Icon = mod.icon || ShieldCheck;
                        const idx = gIdx * 3 + mIdx;
                        const sym = getSymbolView(idx);
                        const borderCol = getAppBorderView(idx);
                        const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                        return (
                          <Link
                            key={mod.key}
                            to={mod.path}
                            className="group flex h-full rounded-2xl p-[3px] shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          >
                            <div
                              className="flex h-full w-full flex-col justify-between gap-2 rounded-[13px] p-3 text-[#0A2B6D]"
                              style={{ background: sprayBg }}
                            >
                              {/* Module Header in App Design Coloured Border with White Background */}
                              <div
                                className="w-full rounded-xl p-[2.5px] shadow-2xs"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <div className="flex items-center gap-2 rounded-[9px] bg-white px-2.5 py-1.5">
                                  <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                    style={{ borderColor: borderCol }}
                                  >
                                    <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                                  </span>
                                  <span className="min-w-0 flex-1 text-xs font-extrabold leading-tight text-[#0A2B6D]">
                                    {mod.label}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 px-1 text-[11px] font-bold leading-snug text-[#0A2B6D]">
                                {mod.blurb}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
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