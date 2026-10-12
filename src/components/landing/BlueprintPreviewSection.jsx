import React from 'react';
import {
  ArrowRight,
  FileSpreadsheet,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

// The map is generated from the live module directory, so it always matches the app exactly.
const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) => keys.map((k) => byKey[k]).filter(Boolean).map((m) => [m.label, m.blurb]);

const APP_MODULE_GROUPS = [
  {
    title: 'People, intake and profiles',
    colour: 'from-violet-600 to-fuchsia-500',
    modules: pick('dashboard', 'intake', 'staff', 'participants', 'visual-boards', 'key-contacts', 'volunteering-placements', 'users'),
  },
  {
    title: 'Service delivery and workforce',
    colour: 'from-blue-600 to-cyan-500',
    modules: pick('communications', 'incidents', 'risks', 'rostering', 'goals', 'tasks', 'emergency-response'),
  },
  {
    title: 'Compliance, safety and evidence',
    colour: 'from-emerald-600 to-teal-500',
    modules: pick('compliance', 'documents', 'company-safe', 'training', 'certificates', 'quality', 'feedback', 'meetings'),
  },
  {
    title: 'Business, finance and growth',
    colour: 'from-indigo-600 to-blue-500',
    modules: pick('invoicing', 'quotes', 'receipts', 'procurement', 'assets', 'analytics', 'human-resources', 'crm', 'projects'),
  },
  {
    title: 'Information, providers and access',
    colour: 'from-orange-500 to-rose-500',
    modules: pick('ndis-provider', 'ndis-news', 'equipment-manuals', 'community-council', 'community-referral', 'programs', 'help', 'user-guides'),
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
    <section id="blueprint" className="relative mx-auto my-10 max-w-7xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-cyan-50/70 via-white to-violet-50/70 px-4 py-20 shadow-xl shadow-cyan-500/5 dark:border-white/10 dark:from-cyan-950/25 dark:via-background dark:to-violet-950/25 md:px-8">
      <div className="absolute -left-20 bottom-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex rounded-full border border-cyan-200 bg-cyan-50/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">Current platform blueprint</div>
        <h2 className="mt-5 font-editorial text-3xl font-medium tracking-tight text-foreground md:text-[2.6rem] md:leading-tight">
          An accurate map of the <span className="font-editorial-italic bg-gradient-to-r from-cyan-700 via-blue-600 to-violet-700 bg-clip-text text-transparent">ComplianceHR app</span>
        </h2>
        <p className="mt-4 text-lg font-medium text-foreground/65">
          All {moduleCount} current modules, their purpose, access model and connected information flows in one view.
        </p>
      </div>

      <div className="relative mt-12 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl shadow-brand/20">
        <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-900 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-[11px] text-slate-400">compliancehr.app/dashboard</div>
          <span className="hidden rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold text-emerald-300 sm:inline">LIVE WORKSPACE</span>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-slate-800 bg-slate-900/80 p-4 lg:block">
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500"><ShieldCheck className="h-5 w-5" /></span>
              <div><div className="text-sm font-bold">ComplianceHR</div><div className="text-[9px] text-slate-400">Provider workspace</div></div>
            </div>
            <div className="mt-5 rounded-lg bg-violet-500/10 px-3 py-2 text-[10px] font-semibold text-violet-300">Role-based navigation</div>
            <div className="mt-4 space-y-4">
              {APP_MODULE_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{group.title}</div>
                  <div className="mt-1.5 space-y-1">
                    {group.modules.slice(0, 4).map(([title]) => <div key={title} className="truncate rounded px-2 py-1 text-[10px] text-slate-300">{title}</div>)}
                    {group.modules.length > 4 && <div className="px-2 text-[9px] text-cyan-400">+ {group.modules.length - 4} more</div>}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-editorial text-xl font-semibold text-white"><LayoutDashboard className="h-5 w-5 text-cyan-300" />Organisation Dashboard</div>
                <div className="mt-1 text-xs text-slate-400">People, service delivery, compliance and business operations connected.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-200"><FileSpreadsheet className="h-3 w-3" />Spreadsheet Exchange</span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-fuchsia-200"><Sparkles className="h-3 w-3" />A1 Assistant</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {APP_MODULE_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${group.colour}`} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{group.title}</h3>
                    <span className="text-[10px] text-slate-500">{group.modules.length} modules</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {group.modules.map(([title, description], index) => (
                      <div key={title} className="group relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 p-3 transition-colors hover:border-cyan-400/50">
                        <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${group.colour}`} />
                        <div className="pl-1 text-xs font-bold text-white">{title}</div>
                        <div className="mt-1 pl-1 text-[10px] leading-4 text-slate-400">{description}</div>
                        <span className="absolute right-2 top-2 text-[8px] font-bold text-slate-600">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-blue-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-blue-900 dark:bg-card/75">
          <h3 className="font-editorial text-lg font-semibold text-blue-950 dark:text-blue-100">How information connects</h3>
          <p className="mt-1 text-xs text-foreground/55">Records move through connected workflows instead of being entered repeatedly.</p>
          <div className="mt-4 space-y-3">
            {DATA_FLOWS.map((flow) => (
              <div key={flow[0]} className="flex flex-wrap items-center gap-1.5">
                {flow.map((item, index) => (
                  <React.Fragment key={item}>
                    <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-800">{item}</span>
                    {index < flow.length - 1 && <ArrowRight className="h-3 w-3 text-blue-400" />}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-violet-900 dark:bg-card/75">
          <h3 className="font-editorial text-lg font-semibold text-violet-950 dark:text-violet-100">Access follows the person&apos;s role</h3>
          <div className="mt-4 space-y-3">
            {ACCESS_LEVELS.map(([title, description]) => (
              <div key={title} className="border-l-2 border-violet-400 pl-3">
                <div className="text-xs font-bold text-foreground">{title}</div>
                <div className="mt-0.5 text-[10px] leading-4 text-foreground/55">{description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}