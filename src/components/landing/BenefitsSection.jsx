import React from 'react';
import {
  ShieldCheck, Lock, Sparkles, BarChart3, FileCheck2, Workflow, CheckCircle2,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const BENEFITS = [
  {
    title: 'Audit Ready',
    badge: '356 Checkpoints',
    icon: ShieldCheck,
    accent: '#0072FF',
    description:
      'Pre-mapped to all 17 NDIS compliance categories with 2-minute express internal audits, live evidence links, and 1-click A4 PDF board packs.',
    points: ['Dual Master Audit Checklists', 'Consent-Gated External Auditor Portal'],
  },
  {
    title: 'Role Based Security',
    badge: '15 Role Levels',
    icon: Lock,
    accent: '#5A00D6',
    description:
      'Strict Row-Level Security (RLS) isolates participant, staff, finance, and auditor views automatically across 115+ enterprise data entities.',
    points: ['Granular Permission Matrix', 'Immutable User Action & Breach Logs'],
  },
  {
    title: 'AI Powered',
    badge: '24/7 Copilot',
    icon: Sparkles,
    accent: '#FF2E9A',
    description:
      'Built-in AI assistants draft compliant NDIS shift notes, generate LMS training quizzes, extract receipt data, and surface daily compliance insights.',
    points: ['AI Course & Quiz Authoring', 'Smart Receipt & Resume Extraction'],
  },
  {
    title: 'Live Dashboards',
    badge: 'Real-Time Telemetry',
    icon: BarChart3,
    accent: '#0A2B6D',
    description:
      'Executive and operational command centres track compliance scores, screening clearances, open incidents, and NDIS budget utilisation live.',
    points: ['8-Pillar Health Intelligence', 'Departmental KPI Benchmarks'],
  },
  {
    title: 'Document Control',
    badge: '125+ Templates',
    icon: FileCheck2,
    accent: '#0072FF',
    description:
      'Encrypted Document Vault and Company Safe with version control, staff read-receipt acknowledgements, and 90/60/30-day renewal calendars.',
    points: ['100+ Tailored NDIS & HR Masters', 'Digital Signatures & Read-Receipts'],
  },
  {
    title: 'Automated Workflows',
    badge: '65+ Live Pipelines',
    icon: Workflow,
    accent: '#5A00D6',
    description:
      '24/7 background automations handle credential expiry sweeps, 24h/5d reportable incident timers, task escalations, and 30-action PDF batch reports.',
    points: ['Zero Manual Chasing', 'Automated Escalation & Email Alerts'],
  },
];

export default function BenefitsSection() {
  return (
    <section id="why-choose" className="w-full scroll-mt-20 py-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#5A00D6]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
          Enterprise Advantage
        </span>
        <h2 className="mt-3 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
          Why Choose ComplianceHR Infinity
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#0A2B6D]/75">
          Engineered specifically for Australian NDIS providers and disability support organisations that demand complete governance without administrative overload.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Reveal
              key={card.title}
              delay={idx * 0.06}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 text-left shadow-md transition-all hover:-translate-y-1 hover:border-[#0072FF]/50 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                    }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
                    style={{ backgroundColor: card.accent }}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3 className="mt-5 font-editorial text-xl sm:text-2xl font-extrabold text-[#0A2B6D]">
                  {card.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[#0A2B6D]/75">
                  {card.description}
                </p>
              </div>

              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                {card.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-xs font-bold text-[#0A2B6D]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0072FF]" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}