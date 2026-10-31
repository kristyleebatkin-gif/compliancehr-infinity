import React from 'react';
import { Quote, Star, MessageSquareQuote } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const TESTIMONIALS = [
  {
    role: 'Chief Executive Officer',
    org: 'Registered NDIS SIL & Community Access Provider (85+ Staff)',
    quote:
      'Before ComplianceHR Infinity, preparing for our NDIS mid-term and renewal audits took weeks of pulling spreadsheets across HR, rostering, and clinical folders. Now our Board and Executive team have a live 98%+ readiness score every morning, and our external auditor verified our 356 checkpoints in record time.',
    metric: '100% NDIS Audit Pass · Zero Non-Conformities',
  },
  {
    role: 'Operations Manager',
    org: 'Multi-Site Disability Support & Allied Care Organisation',
    quote:
      'Having participant intake, 100-point worker screening, smart rostering, shift handover notes, and NDIS Price Guide invoicing inside one platform eliminated hours of duplicate admin every week. The automated roster gate alone ensures an unscreened or expired worker can never be accidentally rostered.',
    metric: '14+ Hours Saved Per Week Across Rostering & Claims',
  },
  {
    role: 'Compliance Manager',
    org: 'High-Intensity NDIS & Aged Care Service Provider',
    quote:
      'The statutory 24-hour and 5-day NDIS Commission reportable incident timers, 3-part participant informed consents, and automated 90/60/30-day credential expiry alerts give us complete peace of mind. Every incident, risk assessment, and feedback entry flows straight into our Continuous Improvement Register.',
    metric: '100% On-Time Statutory Reporting & Screening SLA',
  },
];

export default function LandingTestimonialsSection() {
  return (
    <section id="testimonials" className="w-full scroll-mt-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-7">
        <LandingSectionHeader
          badge="Trusted by NDIS & Aged Care Support Leaders"
          icon={MessageSquareQuote}
          title="Built for Leadership, Operations & Compliance Teams"
          description="See how executive leaders and compliance managers use ComplianceHR Infinity to protect participants and pass NDIS audits with confidence."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
          {TESTIMONIALS.map((item, idx) => (
            <Reveal
              key={item.role}
              delay={idx * 0.08}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-indigo-600" aria-label="5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-indigo-600 text-indigo-600" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-indigo-200" />
                </div>

                <p className="mt-4 text-xs sm:text-sm font-medium leading-relaxed text-slate-700">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-5 border-t border-slate-200/80 pt-4">
                <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
                  {item.metric}
                </div>
                <div className="mt-2.5 text-base font-bold text-slate-900">
                  {item.role}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {item.org}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}