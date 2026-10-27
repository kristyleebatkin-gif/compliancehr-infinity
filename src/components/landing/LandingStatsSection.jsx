import React from 'react';
import { Layers, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';

const STATS = [
  {
    value: '46',
    title: '46 Connected Modules',
    subtitle: 'Unified people, rostering, incidents, compliance, HR, finance and governance in one platform.',
    icon: Layers,
    accent: '#0072FF',
    badge: '100% Integrated',
  },
  {
    value: '356',
    title: '356 Compliance Checkpoints',
    subtitle: 'Pre-mapped to NDIS Practice Standards with live evidence links and instant audit exports.',
    icon: ClipboardCheck,
    accent: '#5A00D6',
    badge: 'Audit Verified',
  },
  {
    value: '17',
    title: '17 Compliance Categories',
    subtitle: 'Complete coverage across Core Modules, High-Intensity Supports, WHS, HR and Financial Governance.',
    icon: ShieldCheck,
    accent: '#FF2E9A',
    badge: 'Full Governance',
  },
  {
    value: '24/7',
    title: '24/7 AI Assistant',
    subtitle: 'Always-on compliance copilot for policy guidance, incident triage, and automated reminders.',
    icon: Sparkles,
    accent: '#0A2B6D',
    badge: 'Live AI Copilot',
  },
];

export default function LandingStatsSection() {
  return (
    <section aria-label="Platform key statistics" className="w-full">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {STATS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md"
              >
                {/* Top Gradient Accent Bar */}
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{
                    background: 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                  }}
                />

                <div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap"
                      style={{ backgroundColor: item.accent }}
                    >
                      {item.badge}
                    </span>
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="mt-4 font-editorial text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0A2B6D] leading-none">
                    {item.value}
                  </div>

                  <h3 className="mt-2.5 text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#0A2B6D]/75">
                    {item.subtitle}
                  </p>
                </div>

                {/* Full Progress Bar */}
                <div className="mt-5 border-t border-slate-100 pt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full w-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                      }}
                    />
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