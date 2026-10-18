import React from 'react';
import { Image } from '@/components/ui/image';
import { getCompanyBranding } from '@/lib/companyBranding';
import { FORM_NOTICES } from '@/lib/formDocumentStyles';
import { getTemplateMeta } from '@/lib/officialFormTemplates';

export default function OnlineDocumentReading({ title, code }) {
  const branding = getCompanyBranding();
  const meta = getTemplateMeta(title);
  return <div className="space-y-5">
    <header className="flex items-center gap-4 border-b border-border pb-5">
      {branding.logoUrl && <Image src={branding.logoUrl} alt={`${branding.companyName} logo`} fittingType="fit" className="h-14 w-14 shrink-0" />}
      <div className="min-w-0"><h3 className="font-heading text-lg font-semibold">{branding.companyName}</h3><p className="text-sm text-muted-foreground">{branding.slogan}</p>{code && <p className="mt-2 text-xs font-semibold text-primary">{code} · {meta?.docType || 'Form'}</p>}</div>
    </header>
    <div className="space-y-3 rounded-xl border border-primary/30 bg-accent p-5 text-sm leading-relaxed">
      {meta?.purpose && <p className="font-semibold">{meta.purpose}</p>}
      <p>Fill out this document on screen. Save a draft at any time, then reopen it here to continue. Saving a completed document also files a PDF copy.</p>
      <p className="text-muted-foreground">{FORM_NOTICES.privacy}</p>
    </div>
    {!!meta?.sections?.length && <details className="rounded-xl border border-border p-5" open>
      <summary className="cursor-pointer font-semibold">Read {title}</summary>
      <div className="mt-5 space-y-6 text-sm leading-7">{meta.sections.map((section, i) => <section key={section.heading} className="space-y-3">
        <h4 className="font-semibold text-primary">{i + 1}. {section.heading}</h4>
        {section.paragraphs?.map((text, j) => <p key={j}>{text}</p>)}
        {section.bullets && <ul className="list-disc space-y-2 pl-5">{section.bullets.map((text, j) => <li key={j}>{text}</li>)}</ul>}
      </section>)}</div>
    </details>}
  </div>;
}