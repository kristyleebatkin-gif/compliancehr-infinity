import React from 'react';
import TemplateLibrarySection from '@/components/documents/TemplateLibrarySection';
import TemplateDownloadButton from '@/components/documents/TemplateDownloadButton';
import { POLICY_TEMPLATES, POLICY_VOLUMES, downloadPolicyTemplatePdf } from '@/lib/businessDocuments';

export default function PolicyTemplates() {
  return <TemplateLibrarySection id="vault-policies" title="Policy Templates" description={`NDIS Policy & Procedure Manual (${POLICY_TEMPLATES.length} policies).`}>
    {POLICY_VOLUMES.map((volume) => <section key={volume.id}>
      <h3 className="mb-2 text-xs font-semibold text-primary">{volume.title} <span className="font-normal text-muted-foreground">({volume.range})</span></h3>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{POLICY_TEMPLATES.filter((policy) => policy.volume === volume.id).map((policy) => <TemplateDownloadButton key={policy.code} label={`${policy.code} - ${policy.title}`} onClick={() => downloadPolicyTemplatePdf(policy)} />)}</div>
    </section>)}
  </TemplateLibrarySection>;
}