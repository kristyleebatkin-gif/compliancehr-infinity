import React from 'react';
import {
  ShieldCheck, Lock, Sparkles, BarChart3, Workflow, FileCheck2, CheckCircle2, Award,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const BENEFITS = [
  {
    title: 'Continuous Audit Readiness',
    badge: '356 Checkpoints',
    icon: ShieldCheck,
    accent: '#0072FF',
    description:
      'Pre-mapped to all 17 NDIS compliance categories and Strengthened Aged Care Standards with live evidence links and 1-click PDF board packs.',
    points: ['Dual Master Audit Checklists', 'Consent-Gated External Auditor Portal'],
  },
  {
    title: 'Row-Level Security (RLS)',
    badge: '15 Role Tiers',
    icon: Lock,
    accent: '#5A00D6',
    description:
      'Strict tenant and role-level security isolates participant, employee, clinical, finance, and external auditor access across 170+ data schemas.',
    points: ['Granular Permission Matrix', 'Immutable Server-Side Audit Trail'],
  },
  {
    title: 'AI Governance Copilot',
    badge: 'Human-in-the-Loop',
    icon: Sparkles,
    accent: '#FF2E9A',
    description:
      'Embedded AI assistants assist with NDIS shift notes, LMS training quizzes, receipt extraction, and daily risk briefings under supervisor review.',
    points: ['AI Course & Quiz Authoring', 'Structured Receipt & Intake Extraction'],
  },
  {
    title: 'Executive Telemetry',
    badge: 'Real-Time KPIs',
    icon: BarChart3,
    accent: '#0A2B6D',
    description:
      'Command centres track Organisation Health, Compliance Score, Workforce Clearance, Risk Mitigation, and NDIS plan utilisation in real time.',
    points: ['5-Index Executive Scorecard', 'Departmental SLA Benchmarks'],
  },
  {
    title: '65+ Automated Workflows',
    badge: '24/7 Watchdogs',
    icon: Workflow,
    accent: '#5A00D6',
    description:
      'Background workflows enforce credential expiry sweeps, 24h/5d reportable incident countdowns, task escalations, and batch audit reports.',
    points: ['Automated Roster Screening Gate', 'Statutory SLA Escalation Alerts'],
  },
  {
    title: 'Controlled Document Vault',
    badge: '125+ Masters',
    icon: FileCheck2,
    accent: '#0072FF',
    description:
      'Encrypted Document Vault and Company Safe with version control, mandatory staff read-receipts, and 90/60/30-day review horizons.',
    points: ['Version Lifecycle Governance', 'Digital Signatures & Read-Receipts'],
  },
];

export default function BenefitsSection() {
  return (
    <section id="why-choose" className="w-full scroll-mt-20">
      <div className="enterprise-surface rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
        <LandingSectionHeader
          badge="Enterprise Assurance"
          tone="purple"
          icon={Award}
          title="Built for Regulated Care, Clinical Governance & Audit Integrity"
          description="Six foundational controls that eliminate spreadsheet drift and keep your organisation inspection-ready every day."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Reveal
                key={card.title}
                delay={idx * 0.04}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 text-left transition hover:border-[#0072FF] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: card.accent }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span
                      className="rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${card.accent}12`, color: card.accent }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-editorial text-xl font-extrabold text-[#0A2B6D]">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm font-normal leading-relaxed text-[#0A2B6D]/80">
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
      </div>
    </section>
  );
}