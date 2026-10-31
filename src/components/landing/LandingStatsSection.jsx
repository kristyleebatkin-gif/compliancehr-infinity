import React from 'react';
import { Layers, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';

const STATS = [
  {
    value: '46',
    title: '46 Connected Modules',
    subtitle: 'Unified people, rostering, incidents, compliance, HR, finance and governance in one platform.',
    icon: Layers,
    badge: '100% Integrated',
  },
  {
    value: '356',
    title: '356 Compliance Checkpoints',
    subtitle: 'Pre-mapped to NDIS Practice Standards with live evidence links and instant audit exports.',
    icon: ClipboardCheck,
    badge: 'Audit Verified',
  },
  {
    value: '17',
    title: '17 Compliance Categories',
    subtitle: 'Complete coverage across Core Modules, High-Intensity Supports, WHS, HR and Financial Governance.',
    icon: ShieldCheck,
    badge: 'Full Governance',
  },
  {
    value: '24/7',
    title: '24/7 AI Assistant',
    subtitle: 'Always-on compliance copilot for policy guidance, incident triage, and automated reminders.',
    icon: Sparkles,
    badge: 'Live AI Copilot',
  },
];

export default function LandingStatsSection() {
  return (
    <section aria-label="Platform key statistics" className="w-full">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {STATS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-indigo-600" />

                <div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 whitespace-nowrap">
                      {item.badge}
                    </span>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-none">
                    {item.value}
                  </div>

                  <h3 className="mt-2.5 text-base sm:text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-200/80 pt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-full rounded-full bg-indigo-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}