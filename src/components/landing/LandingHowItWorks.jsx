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
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        <LandingSectionHeader
          badge="Implementation Lifecycle"
          tone="blue"
          icon={Route}
          title="Three Stages to Continuous Audit Readiness"
          description="Transition from fragmented spreadsheets to a governed, inspection-ready operating system in three structured stages."
          rightTag="3-Stage Deployment"
        />

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3 items-stretch">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.title}
                delay={idx * 0.03}
                className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#0072FF]"
              >
                <div>
                  {/* Header First -> Sentence -> Blue/Purple Badge & White-Lit Symbol After */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-editorial text-sm sm:text-base font-black text-[#0A2B6D]">
                      {item.title}
                    </h3>
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{
                        backgroundColor: item.accent,
                        boxShadow: '0 0 8px 1px rgba(255,255,255,0.85)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                    </div>
                  </div>

                  <p className="mt-1 text-xs font-medium leading-snug text-[#0A2B6D]/80">
                    {item.detail}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className="rounded px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
                      style={{ backgroundColor: `${item.accent}14`, color: item.accent }}
                    >
                      {item.step}
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: item.accent }}>
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <ul className="mt-2.5 space-y-1 border-t border-slate-100 pt-2">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-1.5 text-[11px] font-bold text-[#0A2B6D]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
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