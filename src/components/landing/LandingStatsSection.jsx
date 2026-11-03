import React from 'react';
import { Layers, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';

const STATS = [
  {
    value: '46',
    title: '46 Connected Modules',
    subtitle: 'Unified people, rostering, incidents, compliance, HR, finance, and governance in one platform.',
    icon: Layers,
    accent: '#0072FF',
    badge: 'Single Data Model',
  },
  {
    value: '356',
    title: '356 Audit Checkpoints',
    subtitle: 'Pre-mapped to NDIS Practice Standards and Aged Care Quality Standards with live evidence links.',
    icon: ClipboardCheck,
    accent: '#5A00D6',
    badge: 'Audit Verified',
  },
  {
    value: '45',
    title: '45 Master Registers',
    subtitle: 'Self-maintaining statutory registers across clinical risk, WHS, HR screening, and financial governance.',
    icon: ShieldCheck,
    accent: '#FF2E9A',
    badge: 'Auto-Maintained',
  },
  {
    value: '15',
    title: '15 RLS Permission Tiers',
    subtitle: 'Strict Row-Level Security and explicit participant audit-consent gates enforced across 170+ entities.',
    icon: Sparkles,
    accent: '#0A2B6D',
    badge: 'Zero-Trust Access',
  },
];

export default function LandingStatsSection() {
  return (
    <section aria-label="Platform key statistics" className="w-full">
      <div className="enterprise-surface rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {STATS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-6 text-left transition hover:border-[#0072FF]"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: item.accent }}
                />

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${item.accent}12`, color: item.accent }}
                    >
                      {item.badge}
                    </span>
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: item.accent }}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="mt-4 font-editorial text-4xl font-extrabold tracking-tight text-[#0A2B6D] leading-none">
                    {item.value}
                  </div>

                  <h3 className="mt-3 text-lg font-extrabold text-[#0A2B6D]">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-sm font-normal leading-relaxed text-[#0A2B6D]/75">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}