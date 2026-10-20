import React from 'react';
import TemplateLibrarySection from '@/components/documents/TemplateLibrarySection';
import TemplateDownloadButton from '@/components/documents/TemplateDownloadButton';
import BusinessPlanUploads from '@/components/safe/BusinessPlanUploads';
import { BUSINESS_PLAN_TEMPLATES, downloadBusinessPlanPdf, downloadStrategicPlanPdf, downloadOperationalPlanPdf, downloadPlanTemplatePdf } from '@/lib/businessDocuments';

export default function BusinessPlanTemplates() {
  return <TemplateLibrarySection id="vault-business-plans" title="Business Plans" description="Download plan templates and manage completed business plans.">
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      <TemplateDownloadButton label="Business Plan" onClick={downloadBusinessPlanPdf} />
      <TemplateDownloadButton label="Strategic Plan" onClick={downloadStrategicPlanPdf} />
      <TemplateDownloadButton label="Operational Plan" onClick={downloadOperationalPlanPdf} />
      {BUSINESS_PLAN_TEMPLATES.map((name) => <TemplateDownloadButton key={name} label={name} onClick={() => downloadPlanTemplatePdf(name)} />)}
    </div>
    <BusinessPlanUploads showTemplates={false} />
  </TemplateLibrarySection>;
}