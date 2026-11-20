import React from 'react';
import { HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'What does ComplianceHR Infinity help organisations do?',
    answer: 'It brings people, service delivery, governance and business operations into an organised workspace. A walkthrough can show the current screens and workflows that match your organisation’s needs.',
  },
  {
    question: 'Does the platform make an organisation compliant?',
    answer: 'No software can certify an organisation as compliant. The platform can help organise obligations, actions and supporting records. Your organisation remains responsible for interpreting and meeting applicable requirements.',
  },
  {
    question: 'Which standards and quality indicators are included?',
    answer: 'Applicable mappings should be confirmed against the current official source, identifier, jurisdiction and effective date. During a walkthrough, ask to see the source and evidence behind each mapping; draft or unverified mappings should be labelled clearly.',
  },
  {
    question: 'Are all modules and integrations live?',
    answer: 'Availability depends on the module, configuration and connected provider. The walkthrough should distinguish a working feature from a setup-required connection, sample data, or planned capability.',
  },
  {
    question: 'How are privacy, security and data handling confirmed?',
    answer: 'Before using live sensitive information, confirm the organisation’s access roles, tenant boundaries, hosting, retention, backup, export and incident procedures from the current product configuration and written security information.',
  },
  {
    question: 'How much does it cost and what is included?',
    answer: 'Request an itemised written quote. It should show the price in AUD, GST, billing term, user or organisation limits, onboarding, support, integrations, usage limits and optional charges before acceptance.',
  },
  {
    question: 'Can I try the platform before deciding?',
    answer: 'Book a tailored walkthrough first. Any trial availability, data used, length, conditions and costs should be confirmed before signup.',
  },
];

export default function LandingFaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_14px_42px_rgba(10,43,109,0.06)] backdrop-blur sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-[#5A00D6]"><HelpCircle aria-hidden="true" className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Frequently asked questions</p></div>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0A2B6D] sm:text-3xl">Clear answers before you choose.</h2>
        <div className="mt-6 divide-y divide-slate-200">
          {FAQS.map(({question,answer}) => (
            <details key={question} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#0A2B6D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                {question}<span aria-hidden="true" className="text-xl text-[#5A00D6] transition group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-3xl pb-2 pr-8 text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
