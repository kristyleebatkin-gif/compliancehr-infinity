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
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        <LandingSectionHeader
          badge="Enterprise Assurance"
          tone="purple"
          icon={Award}
          title="Built for Regulated Care, Clinical Governance & Audit Integrity"
          description="Six foundational controls that eliminate spreadsheet drift and keep your organisation inspection-ready every day."
          rightTag="6 Core Governance Controls"
        />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Reveal
                key={card.title}
                delay={idx * 0.03}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#0072FF]"
              >
                <div>
                  {/* Header First -> Sentence -> Blue/Purple Badge & White-Lit Symbol After */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-editorial text-sm sm:text-base font-black text-[#0A2B6D]">
                      {card.title}
                    </h3>
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{
                        backgroundColor: card.accent,
                        boxShadow: '0 0 8px 1px rgba(255,255,255,0.85)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                    </div>
                  </div>

                  <p className="mt-1 text-xs font-medium leading-snug text-[#0A2B6D]/80">
                    {card.description}
                  </p>

                  <div className="mt-2">
                    <span
                      className="inline-block rounded px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
                      style={{ backgroundColor: `${card.accent}14`, color: card.accent }}
                    >
                      {card.badge}
                    </span>
                  </div>
                </div>

                <ul className="mt-2.5 space-y-1 border-t border-slate-100 pt-2">
                  {card.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-1.5 text-[11px] font-bold text-[#0A2B6D]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
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