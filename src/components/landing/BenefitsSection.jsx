import React from 'react';
import {
  ShieldCheck, Lock, Sparkles, BarChart3, Workflow, FileCheck2, CheckCircle2, Award,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const BENEFITS = [
  {
    title: 'Audit Ready',
    badge: '356 Checkpoints',
    icon: ShieldCheck,
    description:
      'Pre-mapped to all 17 NDIS compliance categories with 2-minute express internal audits, live evidence links, and 1-click A4 PDF board packs.',
    points: ['Dual Master Audit Checklists', 'Consent-Gated External Auditor Portal'],
  },
  {
    title: 'Role Based Security',
    badge: '15 Role Levels',
    icon: Lock,
    description:
      'Strict Row-Level Security (RLS) isolates participant, staff, finance, and auditor views automatically across 115+ enterprise data entities.',
    points: ['Granular Permission Matrix', 'Immutable User Action & Breach Logs'],
  },
  {
    title: 'AI Powered',
    badge: '24/7 Copilot',
    icon: Sparkles,
    description:
      'Built-in AI assistants draft compliant NDIS shift notes, generate LMS training quizzes, extract receipt data, and surface daily compliance insights.',
    points: ['AI Course & Quiz Authoring', 'Smart Receipt & Resume Extraction'],
  },
  {
    title: 'Live Dashboards',
    badge: 'Real-Time Telemetry',
    icon: BarChart3,
    description:
      'Executive and operational command centres track compliance scores, screening clearances, open incidents, and NDIS budget utilisation live.',
    points: ['8-Pillar Health Intelligence', 'Departmental KPI Benchmarks'],
  },
  {
    title: 'Automated Workflows',
    badge: '65+ Live Pipelines',
    icon: Workflow,
    description:
      '24/7 background automations handle credential expiry sweeps, 24h/5d reportable incident timers, task escalations, and 30-action PDF batch reports.',
    points: ['Zero Manual Chasing', 'Automated Escalation & Email Alerts'],
  },
  {
    title: 'Document Control',
    badge: '125+ Templates',
    icon: FileCheck2,
    description:
      'Encrypted Document Vault and Company Safe with version control, staff read-receipt acknowledgements, and 90/60/30-day renewal calendars.',
    points: ['100+ Tailored NDIS & HR Masters', 'Digital Signatures & Read-Receipts'],
  },
];

export default function BenefitsSection() {
  return (
    <section id="why-choose" className="w-full scroll-mt-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-7">
        <LandingSectionHeader
          badge="Why Choose ComplianceHR Infinity"
          icon={Award}
          title="Enterprise-Grade Governance, Built for NDIS & Aged Care Providers"
          description="Six core capabilities that eliminate manual compliance chasing and keep your entire organisation audit-ready every day."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Reveal
                key={card.title}
                delay={idx * 0.05}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {card.description}
                  </p>
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-slate-200/80 pt-3.5">
                  {card.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}