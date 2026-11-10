import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const FAQS = [
  {
    topic: 'NDIS & Aged Care Standards',
    question: 'How does ComplianceHR Infinity align with the NDIS Practice Standards and Strengthened Aged Care Standards?',
    answer:
      'ComplianceHR Infinity includes 17 NDIS Practice Standards reference categories, 356 verification checkpoints, and Strengthened Aged Care Quality Standards mappings to organise operational evidence. Providers should confirm that their configured records and evidence meet the regulatory requirements for their registration groups.',
  },
  {
    topic: 'Zero-Trust Data Security',
    question: 'How is sensitive participant, clinical, and employee information protected?',
    answer:
      'Access is governed through 15 role tiers, multi-tenant isolation, and record-level permissions (RLS). Administrators can review and audit the permission matrix and security classification rules before onboarding live participant or personnel records.',
  },
  {
    topic: 'Role-Scoped Access',
    question: 'Can we control what Support Workers, Team Leaders, Finance Officers, Participants, and External Auditors see?',
    answer:
      'Yes. Access is enforced by role and record-level security rules. Participant and staff audit visibility requires explicit recorded consent before records appear in the read-only External Auditor Portal.',
  },
  {
    topic: 'Workforce Screening Gate',
    question: 'How are NDIS Worker Screening, Blue Cards, First Aid, and training expiries enforced?',
    answer:
      'Employee dossiers track screening clearances, qualifications, and LMS competencies with automated 90/60/30/14-day expiry alerts and rostering validation rules.',
  },
  {
    topic: 'Audit Readiness',
    question: 'How quickly can our compliance team prepare for an NDIS mid-term or renewal audit?',
    answer:
      'Because operational entries automatically populate the 45 master registers and attach to checkpoints, compliance managers can generate board-ready PDF audit packs or provision consent-gated External Auditor Portal access at any time.',
  },
  {
    topic: 'Executive & Financial Reporting',
    question: 'What executive, clinical governance, and financial reconciliation reports are included?',
    answer:
      'The platform provides 5-Index Executive Scorecards, statutory incident SLA logs, ISO 31000 risk heatmaps, NDIS Price Guide claim exports, and 3-way procurement reconciliation.',
  },
  {
    topic: 'AI Governance Copilot',
    question: 'How does the AI Assistant support frontline and compliance teams safely?',
    answer:
      'The AI assistant helps draft shift notes, policies, and training quizzes with human-in-the-loop review so qualified staff verify every output before clinical, payroll, or compliance sign-off.',
  },
  {
    topic: 'Onboarding & Migration',
    question: 'How fast can our organisation onboard and import existing records?',
    answer:
      'Organisations can start immediately with a 14-day free trial and use structured CSV/JSON bulk intake tools to migrate participant, staff, and document registers.',
  },
];

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="w-full scroll-mt-20">
      <Reveal className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        <LandingSectionHeader
          badge="Governance & Security FAQ"
          tone="blue"
          icon={HelpCircle}
          title="Frequently Asked Questions"
          description="Key architectural, regulatory, and security answers for executives, compliance managers, and IT administrators."
          rightTag="8 Core Governance & Security Answers"
        />

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 items-start">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.topic}
                className={`rounded-xl border transition-all ${
                  isOpen
                    ? 'border-[#0A2B6D] bg-[#F8FAFC] shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-[#0072FF]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="flex w-full items-start justify-between gap-2.5 p-3 text-left"
                >
                  <div>
                    {/* Header Question First -> Blue Topic Badge After */}
                    <h3 className="text-sm font-black text-[#0A2B6D] leading-snug">
                      {faq.question}
                    </h3>
                    <span className="mt-1 inline-block rounded bg-[#0072FF]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                      {faq.topic}
                    </span>
                  </div>
                  <ChevronDown
                    className={`mt-0.5 h-4 w-4 shrink-0 text-[#0A2B6D] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  hidden={!isOpen}
                  className="border-t border-slate-200/80 px-3 pb-3 pt-2 text-left text-sm font-medium leading-relaxed text-[#0A2B6D]"
                >
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