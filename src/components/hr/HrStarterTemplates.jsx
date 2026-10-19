import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadTemplatePdf } from '@/lib/hrTemplatePdf';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { mergeHrTemplate } from '@/lib/hrTemplateMerge';
import { Download, Loader2 } from 'lucide-react';

export default function HrStarterTemplates({ onPrepare }) {
  const [busy, setBusy] = useState('');
  const { data, isLoading, error } = useQuery({ queryKey: ['hr-starter-templates'], queryFn: () => base44.entities.HrTemplate.filter({ active: true, title: { $in: ['Support Worker Employment Contract', 'Support Worker Position Description'] } }, { limit: 2 }) });
  const download = async (template) => {
    setBusy(template.id);
    try {
      const branding = await loadCompanyBranding();
      downloadTemplatePdf({ title: template.title, code: template.category === 'Contract' ? 'HR-CON-TPL' : 'HR-PD-TPL', body: mergeHrTemplate(template.content, null, branding, null) });
    } finally { setBusy(''); }
  };
  if (isLoading) return <p className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading Support Worker templates...</p>;
  if (error) return <p role="alert" className="text-sm text-danger">Support Worker templates could not be loaded.</p>;
  return (
    <section className="space-y-3" aria-label="Support Worker document templates">
      <p className="text-xs text-muted-foreground">Reusable draft templates, not issued employee agreements. Confirm employment terms and obtain legal review before use.</p>
      <div className="grid gap-3 lg:grid-cols-2">{data?.items.map((template) => (
        <Card key={template.id}><CardContent className="space-y-3 p-4">
          <h3 className="font-heading font-semibold">{template.title}</h3><p className="text-sm text-muted-foreground">{template.description}</p>
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={!!busy} onClick={() => download(template)}>{busy === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download template</Button><Button size="sm" onClick={() => onPrepare(template.category === 'Contract' ? 'contract' : 'position')}>Prepare for employee</Button></div>
        </CardContent></Card>
      ))}</div>
    </section>
  );
}