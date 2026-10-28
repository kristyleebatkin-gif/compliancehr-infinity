import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const FAQS = [
  {
    topic: 'NDIS Compliance',
    question: 'How does ComplianceHR Infinity align with the NDIS Practice Standards and Quality Indicators?',
    answer:
      'ComplianceHR Infinity is purpose-built around the NDIS Practice Standards, featuring 17 compliance categories and 356 pre-mapped verification checkpoints. Every policy, participant consent, risk assessment, incident report, and staff credential links directly to its corresponding standard.',
  },
  {
    topic: 'Data Security',
    question: 'How is sensitive participant and employee information protected?',
    answer:
      'All records are protected by strict Row-Level Security (RLS), private encrypted document storage with time-limited signed URLs, immutable user audit logs, and built-in Notifiable Data Breach (NDB) governance controls aligned with the Australian Privacy Act 1988.',
  },
  {
    topic: 'User Access',
    question: 'Can we control what Support Workers, Team Leaders, Finance, Participants, and Auditors see?',
    answer:
      'Yes. Granular role-based access controls enforce strict boundaries across 15 organisational roles. Support workers only view approved profiles and assigned shifts, participants access their own portal, and external NDIS auditors only see records where explicit audit consent has been granted.',
  },
  {
    topic: 'Training Records',
    question: 'How are staff credentials, NDIS Worker Screening, and training expiries managed?',
    answer:
      'The platform tracks 100-point HR files including NDIS Worker Screening Checks, Working with Children / Blue Cards, Police Checks, First Aid, CPR, and LMS modules. Automated 90/60/30/14-day alerts notify staff and managers before expiry, and the Roster Gate blocks unscreened shifts.',
  },
  {
    topic: 'Audit Preparation',
    question: 'How quickly can we prepare for an NDIS mid-term or certification audit?',
    answer:
      'With our 2-Minute Express Audit engine and Dual Master Audit Checklists, you can verify evidence across all 17 categories, generate A4 PDF board and auditor packs in one click, and invite external auditors into the read-only, consent-gated Auditor Portal.',
  },
  {
    topic: 'Reporting',
    question: 'What executive, clinical, and financial reports are included?',
    answer:
      'You can export instant A4 PDF and CSV reports for Board Quality Intelligence, 24h/5d Reportable Incidents, ISO 31000 Risk Matrices, 10-Weekly Participant Progress Reviews, 30-Action Batch Audit Logs, and 3-Way NDIS Claim Reconciliation.',
  },
  {
    topic: 'AI Assistant',
    question: 'How does the 24/7 AI Assistant help our team day to day?',
    answer:
      'Our built-in 24/7 AI Copilot assists with drafting NDIS-compliant policies and shift notes, suggesting support line items, generating LMS training quizzes, triaging incident follow-ups, and scanning all 46 modules for overdue compliance actions.',
  },
  {
    topic: 'Implementation Process',
    question: 'How fast can our organisation onboard and migrate existing records?',
    answer:
      'You can start immediately with a 14-day free trial. Bulk CSV/Excel import tools, 100+ tailored Business Details document templates, and guided 4-step setup allow NDIS providers to go live across all 46 modules in days rather than months.',
  },
];

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="w-full scroll-mt-20 py-6">
      <Reveal className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-lg">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0072FF]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
            <HelpCircle className="h-3.5 w-3.5 text-[#5A00D6]" />
            Frequently Asked Questions
          </span>
          <h2 className="mt-3 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
            Answers to Key Questions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#0A2B6D]/75">
            Everything you need to know about NDIS &amp; Aged Care compliance and security,
            <br className="hidden sm:inline" /> from implementation to day-to-day operations.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.topic}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-[#5A00D6] bg-slate-50/60 shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#0072FF]/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-3 p-5 text-left"
                >
                  <div>
                    <span className="inline-block rounded-full bg-[#0072FF]/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                      {faq.topic}
                    </span>
                    <h3 className="mt-2 text-base font-extrabold text-[#0A2B6D]">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 text-[#5A00D6] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-200/70 px-5 pb-5 pt-3 text-left text-sm leading-relaxed text-[#0A2B6D]/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}