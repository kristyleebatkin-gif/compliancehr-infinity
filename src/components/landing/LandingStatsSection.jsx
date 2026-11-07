import React from 'react';
import { Layers, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

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
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        <LandingSectionHeader
          badge="Enterprise Scale & Verification"
          tone="blue"
          icon={ShieldCheck}
          title="Verified Platform Scale Across Modules, Checkpoints, Registers & Security"
          description="Every operational module, statutory register, and audit checkpoint operates on a single governed data model."
          rightTag="100% Connected Architecture"
        />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {STATS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#0072FF]"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: item.accent }}
                />

                <div>
                  {/* Header First -> Sentence -> Blue/Purple Badge & White-Lit Symbol After */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-[#0A2B6D]">
                      {item.title}
                    </h3>
                    <span className="font-editorial text-xl sm:text-2xl font-black text-[#0A2B6D] leading-none">
                      {item.value}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium leading-snug text-[#0A2B6D]/80">
                    {item.subtitle}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <span
                      className="inline-flex items-center rounded px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
                      style={{ backgroundColor: `${item.accent}14`, color: item.accent }}
                    >
                      {item.badge}
                    </span>
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                      style={{
                        backgroundColor: item.accent,
                        boxShadow: '0 0 8px 1px rgba(255,255,255,0.85)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                    </div>
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