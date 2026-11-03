import React from 'react';
import { Database, Workflow, ShieldCheck, CheckCircle2, Route } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const STEPS = [
  {
    step: 'STAGE 01',
    title: 'Onboard & Verify Records',
    subtitle: 'Participants, workforce credentials, and governance baselines.',
    detail:
      'Capture participant intake, 3-part informed consents, NDIS plan budgets, and 100-point employee screening credentials into structured 360° profiles.',
    icon: Database,
    accent: '#0072FF',
    highlights: [
      'Digital Participant & Employee Intake',
      '3-Part Informed & Auditor Consents',
      '100-Point Worker Screening Vault',
    ],
  },
  {
    step: 'STAGE 02',
    title: 'Enforce Automated Guardrails',
    subtitle: 'Rostering gates, statutory timers, and expiry workflows.',
    detail:
      '65+ automated workflows monitor credential expiries, prevent unscreened shift allocation, arm 24h/5d reportable incident timers, and route approvals.',
    icon: Workflow,
    accent: '#5A00D6',
    highlights: [
      '90 / 60 / 30 / 14-Day Expiry Sweeps',
      'Automated Roster Screening Gatekeeper',
      '5-Stage Document & Policy Approval Flow',
    ],
  },
  {
    step: 'STAGE 03',
    title: 'Demonstrate Audit Readiness',
    subtitle: 'Live executive scorecards and consent-gated auditor portal.',
    detail:
      'Generate 1-click PDF board packs, inspect 45 self-maintaining master registers, and grant external auditors read-only access to verified evidence.',
    icon: ShieldCheck,
    accent: '#0A2B6D',
    highlights: [
      '17 Audit Categories & 356 Checkpoints',
      '1-Click A4 PDF Board & Evidence Packs',
      'Consent-Gated External Auditor Portal',
    ],
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="w-full scroll-mt-20">
      <div className="enterprise-surface rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
        <LandingSectionHeader
          badge="Implementation Lifecycle"
          tone="blue"
          icon={Route}
          title="Three Stages to Continuous Audit Readiness"
          description="Transition from fragmented spreadsheets to a governed, inspection-ready operating system in three structured stages."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.title}
                delay={idx * 0.06}
                className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 text-left transition hover:border-[#0072FF]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${item.accent}12`, color: item.accent }}
                    >
                      {item.step}
                    </span>

                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: item.accent }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <h3 className="mt-4 font-editorial text-xl font-extrabold text-[#0A2B6D]">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm font-semibold" style={{ color: item.accent }}>
                    {item.subtitle}
                  </p>

                  <p className="mt-2.5 text-sm font-normal leading-relaxed text-[#0A2B6D]/80">
                    {item.detail}
                  </p>
                </div>

                <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs font-bold text-[#0A2B6D]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0072FF]" />
                      <span>{h}</span>
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