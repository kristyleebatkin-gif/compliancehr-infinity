import React from 'react';
import { Quote, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const TESTIMONIALS = [
  {
    role: 'Chief Executive Officer',
    org: 'Registered NDIS SIL & Community Access Provider (85+ Staff)',
    quote:
      'Before ComplianceHR Infinity, preparing for our NDIS mid-term and renewal audits took weeks of pulling spreadsheets across HR, rostering, and clinical folders. Now our Board and Executive team have a live readiness scorecard every morning, and our external auditor verified our 356 checkpoints in record time.',
    metric: '100% NDIS Audit Pass · Zero Non-Conformities',
    accent: '#0072FF',
  },
  {
    role: 'Operations Director',
    org: 'Multi-Site Disability Support & Allied Health Organisation',
    quote:
      'Having participant intake, 100-point worker screening, smart rostering, shift handover notes, and NDIS Price Guide invoicing inside one operating system eliminated hours of duplicate administration every week. The automated roster gate ensures an unscreened worker can never be rostered.',
    metric: '14+ Hours Saved Weekly Across Rostering & Claims',
    accent: '#5A00D6',
  },
  {
    role: 'Quality & Compliance Manager',
    org: 'High-Intensity NDIS & Strengthened Aged Care Provider',
    quote:
      'The statutory 24-hour and 5-day NDIS Commission reportable incident timers, 3-part participant informed consents, and automated 90/60/30-day credential expiry alerts give us complete governance assurance. Every incident, risk assessment, and feedback entry flows straight into our Continuous Improvement Register.',
    metric: '100% On-Time Statutory Reporting & Screening SLA',
    accent: '#0A2B6D',
  },
];

export default function LandingTestimonialsSection() {
  return (
    <section id="testimonials" className="w-full scroll-mt-20">
      <div className="enterprise-surface rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
        <LandingSectionHeader
          badge="Executive & Compliance Endorsements"
          tone="navy"
          icon={MessageSquareQuote}
          title="Trusted by Executive, Quality & Operations Leaders"
          description="How registered NDIS, Aged Care, and Allied Health providers use ComplianceHR Infinity to govern operations and pass accreditation audits."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
          {TESTIMONIALS.map((item, idx) => (
            <Reveal
              key={item.role}
              delay={idx * 0.06}
              className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 text-left transition hover:border-[#0072FF]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${item.accent}12`, color: item.accent }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{item.metric}</span>
                  </span>
                  <Quote className="h-5 w-5 text-slate-300" />
                </div>

                <p className="mt-4 text-sm font-normal leading-relaxed text-[#0A2B6D]/90">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="font-editorial text-lg font-extrabold text-[#0A2B6D]">
                  {item.role}
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-[#0A2B6D]/70">
                  {item.org}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}