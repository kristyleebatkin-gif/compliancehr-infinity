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
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        <LandingSectionHeader
          badge="Executive & Compliance Endorsements"
          tone="navy"
          icon={MessageSquareQuote}
          title="Trusted by Executive, Quality & Operations Leaders"
          description="How registered NDIS, Aged Care, and Allied Health providers use ComplianceHR Infinity to govern operations and pass accreditation audits."
          rightTag="Verified Provider Outcomes"
        />

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3 items-stretch">
          {TESTIMONIALS.map((item, idx) => (
            <Reveal
              key={item.role}
              delay={idx * 0.03}
              className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#0072FF]"
            >
              <div>
                {/* Header First -> Sentence -> Blue/Purple Badge After */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-editorial text-sm sm:text-base font-black text-[#0A2B6D]">
                    {item.role}
                  </h3>
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                    style={{
                      backgroundColor: item.accent,
                      boxShadow: '0 0 8px 1px rgba(255,255,255,0.85)',
                    }}
                  >
                    <Quote className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#0A2B6D]/75">
                  {item.org}
                </p>

                <p className="mt-2 text-xs font-medium leading-snug text-[#0A2B6D]/90">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-2.5 border-t border-slate-100 pt-2">
                <span
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10.5px] font-extrabold"
                  style={{ backgroundColor: `${item.accent}14`, color: item.accent }}
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>{item.metric}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}