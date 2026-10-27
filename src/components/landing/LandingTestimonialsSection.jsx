import React from 'react';
import { Quote, ShieldCheck, Star } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const TESTIMONIALS = [
  {
    role: 'Chief Executive Officer',
    org: 'Registered NDIS SIL & Community Access Provider (85+ Staff)',
    quote:
      'Before ComplianceHR Infinity, preparing for our NDIS mid-term and renewal audits took weeks of pulling spreadsheets across HR, rostering, and clinical folders. Now our Board and Executive team have a live 98%+ readiness score every morning, and our external auditor verified our 356 checkpoints in record time.',
    metric: '100% NDIS Audit Pass · Zero Non-Conformities',
    accent: '#0072FF',
  },
  {
    role: 'Operations Manager',
    org: 'Multi-Site Disability Support & Allied Care Organisation',
    quote:
      'Having participant intake, 100-point worker screening, smart rostering, shift handover notes, and NDIS Price Guide invoicing inside one platform eliminated hours of duplicate admin every week. The automated roster gate alone ensures an unscreened or expired worker can never be accidentally rostered.',
    metric: '14+ Hours Saved Per Week Across Rostering & Claims',
    accent: '#5A00D6',
  },
  {
    role: 'Compliance Manager',
    org: 'High-Intensity NDIS & Aged Care Service Provider',
    quote:
      'The statutory 24-hour and 5-day NDIS Commission reportable incident timers, 3-part participant informed consents, and automated 90/60/30-day credential expiry alerts give us complete peace of mind. Every incident, risk assessment, and feedback entry flows straight into our Continuous Improvement Register.',
    metric: '100% On-Time Statutory Reporting & Screening SLA',
    accent: '#FF2E9A',
  },
];

export default function LandingTestimonialsSection() {
  return (
    <section id="testimonials" className="w-full scroll-mt-20 py-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FF2E9A]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Trusted by NDIS &amp; Disability Support Leaders
        </span>
        <h2 className="mt-3 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
          Built for Leadership, Operations &amp; Compliance Teams
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#0A2B6D]/75">
          See how executive leaders and compliance managers use ComplianceHR Infinity to protect participants and pass NDIS audits with confidence.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
        {TESTIMONIALS.map((item, idx) => (
          <Reveal
            key={item.role}
            delay={idx * 0.08}
            className="flex flex-col justify-between rounded-3xl p-[2.5px] shadow-lg transition-all hover:-translate-y-1"
            style={{
              background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
            }}
          >
            <div className="flex h-full flex-col justify-between rounded-[21px] bg-white p-6 sm:p-8 text-left">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-400" aria-label="5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-[#5A00D6]/30" />
                </div>

                <p className="mt-5 text-sm sm:text-base font-medium leading-relaxed text-[#0A2B6D]">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <div
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
                  style={{ backgroundColor: item.accent }}
                >
                  {item.metric}
                </div>
                <div className="mt-3 font-editorial text-lg font-extrabold text-[#0A2B6D]">
                  {item.role}
                </div>
                <div className="text-xs font-semibold text-[#0A2B6D]/70">
                  {item.org}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}