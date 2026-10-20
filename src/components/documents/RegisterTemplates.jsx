import React from 'react';
import TemplateLibrarySection from '@/components/documents/TemplateLibrarySection';
import TemplateDownloadButton from '@/components/documents/TemplateDownloadButton';
import { BUSINESS_REGISTER_TEMPLATES, downloadRegisterTemplatePdf } from '@/lib/businessDocuments';

export default function RegisterTemplates() {
  return <TemplateLibrarySection id="vault-registers" title="Register Templates" description={`Download ${BUSINESS_REGISTER_TEMPLATES.length} blank business and compliance registers.`}>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{BUSINESS_REGISTER_TEMPLATES.map((name) => <TemplateDownloadButton key={name} label={name} onClick={() => downloadRegisterTemplatePdf(name)} />)}</div>
  </TemplateLibrarySection>;
}