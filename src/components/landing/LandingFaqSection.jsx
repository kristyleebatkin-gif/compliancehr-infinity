import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const FAQS = [
  {
    topic: 'NDIS Compliance',
    question: 'How does ComplianceHR Infinity align with the NDIS Practice Standards and Quality Indicators?',
    answer:
      'ComplianceHR Infinity includes NDIS Practice Standards reference categories and verification checkpoints to help teams organise evidence. Providers should confirm that their records and evidence meet the current requirements for their services.',
  },
  {
    topic: 'Data Security',
    question: 'How is sensitive participant and employee information protected?',
    answer:
      'Access is controlled through role and record-level permissions. Controls vary by record type, so administrators should review the configured permissions and storage settings before adding sensitive live records.',
  },
  {
    topic: 'User Access',
    question: 'Can we control what Support Workers, Team Leaders, Finance, Participants, and Auditors see?',
    answer:
      'Access is controlled by app role and record permissions. Some participant records require explicit audit consent; other records remain restricted to roles that have an explicit read rule. Review the configured scope before inviting an external auditor.',
  },
  {
    topic: 'Training Records',
    question: 'How are staff credentials, NDIS Worker Screening, and training expiries managed?',
    answer:
      'Staff records can include screening checks, qualifications and training information. Available expiry reminders and rostering checks depend on the records and configuration in your workspace.',
  },
  {
    topic: 'Audit Preparation',
    question: 'How quickly can we prepare for an NDIS mid-term or certification audit?',
    answer:
      'The app includes audit tools and a read-only review portal. Available evidence depends on the records entered and the permissions configured for the auditor account.',
  },
  {
    topic: 'Reporting',
    question: 'What executive, clinical, and financial reports are included?',
    answer:
      'Report and export options vary by module and by the records available in your workspace. Review each report before relying on it for governance, claims or regulatory submissions.',
  },
  {
    topic: 'AI Assistant',
    question: 'How does the 24/7 AI Assistant help our team day to day?',
    answer:
      'The AI assistant can help draft and organise operational content. A qualified person should review generated material before it is used for participant care, payroll, claims or compliance decisions.',
  },
  {
    topic: 'Implementation Process',
    question: 'How fast can our organisation onboard and migrate existing records?',
    answer:
      'You can start with a 14-day free trial. Setup time depends on your data, configuration and migration needs; confirm import options and implementation support for your workspace.',
  },
];

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="w-full scroll-mt-20">
      <Reveal className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-lg space-y-7">
        <LandingSectionHeader
          badge="Frequently Asked Questions"
          tone="blue"
          icon={HelpCircle}
          title="Answers to Key Questions"
          description="Everything you need to know about NDIS & Aged Care compliance and security, from implementation to day-to-day operations."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
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
                  aria-controls={`faq-answer-${idx}`}
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
                <div id={`faq-answer-${idx}`} hidden={!isOpen} className="border-t border-slate-200/70 px-5 pb-5 pt-3 text-left text-sm leading-relaxed text-[#0A2B6D]/80">
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}