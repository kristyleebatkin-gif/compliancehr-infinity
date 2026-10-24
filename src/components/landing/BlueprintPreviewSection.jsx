import React from 'react';
import {
  ArrowRight,
  FileSpreadsheet,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import Reveal from '@/components/landing/Reveal';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) => keys.map((k) => byKey[k]).filter(Boolean).map((m) => [m.label, m.blurb, m.key]);

const APP_MODULE_GROUPS = [
  {
    title: 'People, intake and profiles',
    color: '#7c3aed',
    modules: pick('dashboard', 'intake', 'staff', 'participants', 'visual-boards', 'key-contacts', 'volunteering-placements', 'users'),
  },
  {
    title: 'Service delivery and workforce',
    color: '#2563eb',
    modules: pick('communications', 'incidents', 'risks', 'rostering', 'goals', 'tasks', 'emergency-response'),
  },
  {
    title: 'Compliance, safety and evidence',
    color: '#0d9488',
    modules: pick('compliance', 'documents', 'company-safe', 'training', 'certificates', 'quality', 'feedback', 'meetings'),
  },
  {
    title: 'Business, finance and growth',
    color: '#16a34a',
    modules: pick('invoicing', 'quotes', 'receipts', 'procurement', 'assets', 'analytics', 'human-resources', 'crm', 'projects'),
  },
  {
    title: 'Information, providers and access',
    color: '#ea580c',
    modules: pick('ndis-provider', 'ndis-news', 'equipment-manuals', 'community-council', 'community-referral', 'programs', 'help', 'user-guides', 'assistant'),
  },
];

const DATA_FLOWS = [
  ['Intake Centre', 'Staff & Participant Profiles', 'Rostering', 'Communication Centre', 'Invoicing Centre'],
  ['Document Vault & forms', 'Company Safe', 'Details checks & reminders', 'Compliance & Report Centre', 'NDIS Provider Portal'],
  ['Incident Clinic & Risk Reporting', 'Safety insights & controls', 'Quality & Improvement', 'Registers & reports', 'Continuous improvement'],
  ['Tasks & Goal Progress', 'Feedback & Surveys', 'Business Analytics', 'Projects Hub', 'CRM & growth'],
];

const ACCESS_LEVELS = [
  ['Admin & Provider Administrator', 'Full organisation-wide setup, governance and management'],
  ['Compliance, Quality, HR & Finance', 'Compliance Manager, Quality & Improvement Manager, Human Resources Manager and Finance & Accounts Officer'],
  ['Operational & coordination roles', 'Administration, Team Leader, Rostering Coordinator, Intake Officer and CRM & Marketing Officer'],
  ['Support Workers & Volunteers', 'Only their connected profiles, shifts, training and records'],
  ['Participants & Auditors', 'Participants see their own profile, goals and forms; Auditors see only audit-consented records'],
];

export default function BlueprintPreviewSection() {
  const moduleCount = APP_MODULE_GROUPS.reduce((total, group) => total + group.modules.length, 0);

  return (
    <section
      id="blueprint"
      className="relative mx-auto my-10 max-w-7xl scroll-mt-16 overflow-hidden rounded-[2.5rem] border-2 border-violet-200 bg-gradient-to-br from-cyan-50/90 via-white to-violet-50/90 px-4 py-12 sm:py-16 shadow-xl md:px-8"
    >
      <Reveal className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex rounded-full border border-cyan-300 bg-cyan-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-800">
          Current platform blueprint
        </div>
        <h2 className="mt-4 font-editorial text-3xl font-medium tracking-tight text-foreground md:text-[2.6rem] md:leading-tight">
          An accurate map of the <span className="font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">ComplianceHR Infinity app</span>
        </h2>
        <p className="mt-3 text-lg font-medium text-foreground/70">
          All {moduleCount} current modules, their purpose, access model and connected information flows in one view.
        </p>
      </Reveal>

      <div className="relative mt-10 overflow-hidden rounded-3xl border-2 border-violet-300 bg-white shadow-xl">
        <div
          className="flex items-center gap-2 px-4 py-3 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="h-3 w-3 rounded-full bg-rose-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <div className="ml-3 min-w-0 flex-1 truncate rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white">
            compliancehrinfinity.com/dashboard
          </div>
          <span className="hidden rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black text-blue-950 sm:inline">
            LIVE WORKSPACE
          </span>
        </div>

        <div className="grid lg:grid-cols-[230px_1fr]">
          <aside className="hidden border-r border-violet-200 bg-violet-50/50 p-4 lg:block">
            <div className="flex items-center gap-2 text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-extrabold text-blue-950">ComplianceHR Infinity</div>
                <div className="text-[10px] font-bold text-violet-700">Provider workspace</div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-[10px] font-bold text-violet-800">
              Role-based navigation
            </div>
            <div className="mt-4 space-y-4">
              {APP_MODULE_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: group.color }}>
                    {group.title}
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {group.modules.slice(0, 4).map(([title]) => (
                      <div key={title} className="truncate rounded bg-white px-2 py-1 text-[11px] font-semibold text-foreground shadow-2xs">
                        {title}
                      </div>
                    ))}
                    {group.modules.length > 4 && (
                      <div className="px-2 text-[10px] font-bold" style={{ color: group.color }}>
                        + {group.modules.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-editorial text-xl font-bold text-blue-950">
                  <LayoutDashboard className="h-5 w-5 text-violet-600" />
                  Organisation Dashboard
                </div>
                <div className="mt-1 text-xs font-medium text-foreground/70">
                  People, service delivery, compliance and business operations connected.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1.5 text-[11px] font-bold text-cyan-900">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-700" />
                  Spreadsheet Exchange
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-pink-300 bg-pink-50 px-2.5 py-1.5 text-[11px] font-bold text-pink-900">
                  <Sparkles className="h-3.5 w-3.5 text-pink-700" />
                  A1 Assistant
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {APP_MODULE_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-950">{group.title}</h3>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900">
                      {group.modules.length} modules
                    </span>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {group.modules.map(([title, description, key], index) => {
                      const modColor = moduleKeyColour(key) || group.color;
                      return (
                        <div
                          key={title}
                          className="group relative overflow-hidden rounded-xl border bg-white p-3 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                          style={{
                            borderColor: `${modColor}50`,
                            borderLeftWidth: '4px',
                            borderLeftColor: modColor,
                            background: `linear-gradient(135deg, ${modColor}10 0%, #ffffff 85%)`,
                          }}
                        >
                          <div className="pr-5 text-xs font-extrabold text-foreground">{title}</div>
                          <div className="mt-1 text-[11px] leading-4 text-foreground/75">{description}</div>
                          <span className="absolute right-2 top-2 text-[9px] font-black opacity-50" style={{ color: modColor }}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border-2 border-blue-200 bg-white p-5 shadow-sm">
          <h3 className="font-editorial text-lg font-bold text-blue-950">How information connects</h3>
          <p className="mt-1 text-xs font-medium text-foreground/70">
            Records move through connected workflows instead of being entered repeatedly.
          </p>
          <div className="mt-4 space-y-3">
            {DATA_FLOWS.map((flow) => (
              <div key={flow[0]} className="flex flex-wrap items-center gap-1.5">
                {flow.map((item, index) => (
                  <React.Fragment key={item}>
                    <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-900">
                      {item}
                    </span>
                    {index < flow.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-blue-500" />}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-violet-200 bg-white p-5 shadow-sm">
          <h3 className="font-editorial text-lg font-bold text-violet-950">Access follows the person&apos;s role</h3>
          <div className="mt-4 space-y-3">
            {ACCESS_LEVELS.map(([title, description]) => (
              <div key={title} className="border-l-4 border-violet-500 pl-3">
                <div className="text-xs font-extrabold text-foreground">{title}</div>
                <div className="mt-0.5 text-[11px] leading-4 text-foreground/75">{description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}