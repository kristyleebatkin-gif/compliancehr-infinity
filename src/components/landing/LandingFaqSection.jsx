import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

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
  // All 8 FAQ items start open so every question displays its written answer immediately, while remaining interactive
  const [openItems, setOpenItems] = useState(() => FAQS.map((_, idx) => idx));

  const toggleItem = (idx) => {
    setOpenItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const allOpen = openItems.length === FAQS.length;

  return (
    <section id="faq" className="w-full scroll-mt-20">
      <Reveal className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <LandingSectionHeader
              badge="Frequently Asked Questions"
              tone="indigo"
              icon={HelpCircle}
              title="Answers to Key Questions"
              description="Everything you need to know about NDIS & Aged Care compliance and security, from implementation to day-to-day operations."
            />
          </div>
          <button
            type="button"
            onClick={() =>
              setOpenItems(allOpen ? [] : FAQS.map((_, idx) => idx))
            }
            className="self-start sm:self-end shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
          >
            {allOpen ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
          {FAQS.map((faq, idx) => {
            const isOpen = openItems.includes(idx);
            return (
              <div
                key={faq.topic}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-indigo-200 bg-slate-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-indigo-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-3 p-5 text-left"
                >
                  <div>
                    <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {faq.topic}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 text-indigo-600 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  hidden={!isOpen}
                  className="border-t border-slate-200/80 px-5 pb-5 pt-3 text-left text-sm leading-relaxed text-slate-600"
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}