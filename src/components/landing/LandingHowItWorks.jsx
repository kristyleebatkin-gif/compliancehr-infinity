import React from 'react';
import { Database, Workflow, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const STEPS = [
  {
    step: 'Step 1',
    number: '01',
    title: 'Capture Information',
    description: 'Participants, staff and compliance data.',
    detail:
      'Onboard participants and staff with structured online intake forms, 100-point credential uploads, 3-part informed consents, and NDIS plan budgets in one place.',
    icon: Database,
    accent: '#0072FF',
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
    accent: '#5A00D6',
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
    accent: '#FF2E9A',
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
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0072FF]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
          Simple 3-Step Implementation
        </span>
        <h2 className="mt-3 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
          How It Works
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#0A2B6D]/75">
          Move from fragmented spreadsheets to continuous NDIS &amp; Aged Care audit readiness
          <br className="hidden sm:inline" /> in three clear steps.
        </p>
      </div>

      <div className="relative mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
        {STEPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Reveal
              key={item.title}
              delay={idx * 0.1}
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Top Step Pill & Icon */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                    style={{ backgroundColor: item.accent }}
                  >
                    <span>{item.step}</span>
                    <span>•</span>
                    <span>{item.number}</span>
                  </span>

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                    }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <h3 className="mt-6 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                  {item.title}
                </h3>

                <p
                  className="mt-1.5 text-base font-extrabold"
                  style={{ color: item.accent }}
                >
                  {item.description}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-[#0A2B6D]/75">
                  {item.detail}
                </p>
              </div>

              <ul className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                {item.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs font-bold text-[#0A2B6D]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0072FF]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden md:flex absolute -right-5 top-1/2 z-20 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#5A00D6] shadow-md"
                >
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}