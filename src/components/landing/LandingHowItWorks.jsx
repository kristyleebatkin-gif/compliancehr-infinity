import React from 'react';
import { Database, Workflow, ShieldCheck, ArrowRight, CheckCircle2, Route } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const STEPS = [
  {
    step: 'Step 1',
    number: '01',
    title: 'Capture Information',
    description: 'Participants, staff and compliance data.',
    detail:
      'Onboard participants and staff with structured online intake forms, 100-point credential uploads, 3-part informed consents, and NDIS plan budgets in one place.',
    icon: Database,
    highlights: [
      'Digital Participant & Employee Intake',
      '3-Part Informed & Audit Consents',
      '100-Point Screening & Qualification Vault',
    ],
  },
  {
    step: 'Step 2',
    number: '02',
    title: 'Automate Workflows',
    description: 'Tasks, reminders, approvals and notifications.',
    detail:
      '65+ automated workflows monitor credential expiries, roster screening gates, 24h/5d reportable incident timers, and 10-weekly progress review schedules 24/7.',
    icon: Workflow,
    highlights: [
      '90 / 60 / 30 / 14-Day Expiry Alerts',
      'Automated Roster Screening Gatekeeper',
      'Instant Supervisor Approvals & Task Routing',
    ],
  },
  {
    step: 'Step 3',
    number: '03',
    title: 'Stay Audit Ready',
    description: 'Evidence, governance and ongoing compliance monitoring.',
    detail:
      'Generate 2-minute express internal audits, 30-action PDF batch packs, and consent-gated External Auditor Portal views mapped to all 356 NDIS checkpoints.',
    icon: ShieldCheck,
    highlights: [
      '17 Audit Categories & 356 Checkpoints',
      '1-Click A4 PDF Board & Auditor Packs',
      'Consent-Gated External Auditor Portal',
    ],
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="w-full scroll-mt-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-7">
        <LandingSectionHeader
          badge="Simple 3-Step Implementation"
          icon={Route}
          title="How It Works"
          description="Move from fragmented spreadsheets to continuous NDIS & Aged Care audit readiness in three clear steps."
        />

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.title}
                delay={idx * 0.08}
                className="relative flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                      <span>{item.step}</span>
                      <span>•</span>
                      <span>{item.number}</span>
                    </span>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl sm:text-2xl font-extrabold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-indigo-600">
                    {item.description}
                  </p>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                    {item.detail}
                  </p>
                </div>

                <ul className="mt-5 space-y-2 border-t border-slate-200/80 pt-3.5">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                {idx < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:flex absolute -right-4 top-1/2 z-20 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-indigo-600 shadow-2xs"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}