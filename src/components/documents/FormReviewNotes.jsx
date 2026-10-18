import React from 'react';
import { NDIS_FORM_REFERENCES } from '@/lib/ndisFormReview';

export default function FormReviewNotes() {
  return <details className="rounded-lg border border-primary/20 bg-accent p-4 text-sm text-accent-foreground">
    <summary className="cursor-pointer font-semibold">Source and NDIS alignment review · 18 October 2026</summary>
    <div className="mt-3 space-y-3 leading-relaxed">
      <p>Intake, assessment, referral and staff information/onboarding questions were rebuilt from the linked original forms. The shared layouts retain individual questions, writing lines and selection options.</p>
      <p>Commission guidance was used to address informed consent, voluntary cultural information, support continuity, review dates, safeguarding records and the current Code of Conduct. The Commission specifies outcomes, not a universally mandatory intake form or set of demographic questions.</p>
      <ul className="list-disc space-y-1 pl-5">{NDIS_FORM_REFERENCES.map((reference) => <li key={reference.url}><a className="underline underline-offset-2" href={reference.url} target="_blank" rel="noreferrer">{reference.label}</a></li>)}</ul>
      <p>These are provider templates, not Commission-approved documents or a compliance certification. Full line-by-line reconciliation of remaining specialist documents is still required; medication, mealtime, behaviour support, restrictive-practice and employment documents also need the appropriate clinical or legal review before use.</p>
    </div>
  </details>;
}