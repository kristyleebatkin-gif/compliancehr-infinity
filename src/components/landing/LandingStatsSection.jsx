import React from 'react';
import { Layers, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
  {
    value: '46',
    title: '46 Connected Modules',
    subtitle: 'Unified people, rostering, incidents, compliance, HR, finance and governance in one platform.',
    icon: Layers,
    accent: '#0072FF',
    badge: '100% Integrated Ecosystem',
  },
  {
    value: '356',
    title: '356 Compliance Checkpoints',
    subtitle: 'Pre-mapped to NDIS Practice Standards with live evidence links and instant audit exports.',
    icon: ClipboardCheck,
    accent: '#5A00D6',
    badge: 'Audit-Ready Verification',
  },
  {
    value: '17',
    title: '17 Compliance Categories',
    subtitle: 'Complete coverage across Core Modules, High-Intensity Supports, WHS, HR and Financial Governance.',
    icon: ShieldCheck,
    accent: '#FF2E9A',
    badge: 'End-to-End Governance',
  },
  {
    value: '24/7',
    title: '24/7 AI Assistant',
    subtitle: 'Always-on compliance copilot for policy guidance, incident triage, and automated reminders.',
    icon: Sparkles,
    accent: '#0A2B6D',
    badge: 'Intelligent Automation',
  },
];

export default function LandingStatsSection() {
  return (
    <section aria-label="Platform key statistics" className="w-full py-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-md transition-all hover:shadow-xl"
            >
              {/* Top Gradient Accent Bar */}
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{
                  background: 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                }}
              />

              <div>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
                    style={{ backgroundColor: item.accent }}
                  >
                    {item.badge}
                  </span>
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                    }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-editorial text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
                    {item.value}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-extrabold text-[#0A2B6D]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[#0A2B6D]/75">
                  {item.subtitle}
                </p>
              </div>

              {/* Animated Progress Indicator */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.2 + idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}