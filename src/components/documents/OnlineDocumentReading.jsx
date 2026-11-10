import React from 'react';
import { Image } from '@/components/ui/image';
import { getCompanyBranding } from '@/lib/companyBranding';
import { FORM_NOTICES } from '@/lib/formDocumentStyles';
import { getTemplateMeta } from '@/lib/officialFormTemplates';

export default function OnlineDocumentReading({ title, code }) {
  const branding = getCompanyBranding();
  const meta = getTemplateMeta(title);
  return (
    <div className="space-y-4">
      <header className="flex items-start gap-3 rounded-xl border border-sky-200 bg-[#F0F7FF] p-4">
        {branding.logoUrl && (
          <div className="flex aspect-[13/7] w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-200 bg-white p-0.5 sm:w-24">
            <Image src={branding.logoUrl} alt={`${branding.companyName} logo`} fittingType="fit" className="h-full w-full" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="break-words font-editorial text-base font-extrabold leading-snug text-[#0A2B6D]">{branding.companyName}</h3>
          <p className="break-words text-xs font-medium leading-snug text-[#0A2B6D]/75">{branding.slogan}</p>
          {code && (
            <span className="mt-1.5 inline-flex items-center rounded-md bg-[#0A2B6D] px-2.5 py-0.5 text-xs font-bold text-white">
              {code} · {meta?.docType || 'Controlled Form'}
            </span>
          )}
        </div>
      </header>

      <div className="space-y-2.5 rounded-xl border border-sky-200 bg-white p-4 text-sm leading-relaxed text-[#0A2B6D] shadow-2xs">
        <div><h4 className="font-bold text-[#0A2B6D]">Purpose</h4><p className="mt-1 text-[#0A2B6D]/85">{meta?.purpose || `Use this form to record information for ${title}.`}</p></div>
        <p className="text-[#0A2B6D]/85">
          Fill out this document on screen. Save a draft at any time, then reopen it here to continue. Saving a completed document also files a controlled PDF copy in the Document Vault.
        </p>
        <p className="text-xs font-medium text-[#0072FF]">{FORM_NOTICES.privacy}</p>
      </div>

      {!!meta?.sections?.length && (
        <details className="rounded-xl border border-sky-200 bg-[#F0F7FF]/60 p-4" open>
          <summary className="cursor-pointer text-sm font-extrabold text-[#0A2B6D]">
            Read Document Guidance — {title}
          </summary>
          <div className="mt-4 space-y-5 text-sm leading-relaxed text-[#0A2B6D]">
            {meta.sections.map((section, i) => (
              <section key={section.heading} className="space-y-2 rounded-lg border border-sky-100 bg-white p-3.5">
                <h4 className="font-bold text-[#0072FF]">
                  {i + 1}. {section.heading}
                </h4>
                {section.paragraphs?.map((text, j) => (
                  <p key={j} className="text-[#0A2B6D]/85">{text}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-1.5 pl-5 text-[#0A2B6D]/85">
                    {section.bullets.map((text, j) => (
                      <li key={j}>{text}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}