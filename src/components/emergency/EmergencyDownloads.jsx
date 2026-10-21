import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { downloadChecklistPdf } from '@/lib/checklistsPdf';
import { EMERGENCY_TEMPLATES, EMERGENCY_DOC_GROUPS } from '@/lib/emergencyTemplates';
import { useToast } from '@/components/ui/use-toast';

const aliases = { 'Fire Safety Equipment Check Record': 'Fire Safety Equipment Check', 'MSDS / Safety Data Sheet': 'MSDS Register' };
const types = [...new Set([...EMERGENCY_DOC_GROUPS.flatMap((group) => group.types), ...Object.keys(EMERGENCY_TEMPLATES).filter((type) => !Object.values(aliases).includes(type))])];
export default function EmergencyDownloads() {
  const [busy, setBusy] = useState('');
  const { toast } = useToast();
  const download = async (type) => {
    const template = EMERGENCY_TEMPLATES[aliases[type] || type] || { code: 'EMG-000', subtitle: 'Emergency response document', fields: [{ label: 'Notes' }] };
    await downloadChecklistPdf({ title: type, ...template, signoffFields: ['Prepared / completed by', 'Date', 'Approved by'] });
  };
  const run = async (type) => {
    setBusy(type);
    try {
      if (type === 'all') { for (const name of types) await download(name); }
      else await download(type);
    } catch (error) { toast({ title: 'Download failed', description: error.message, variant: 'destructive' }); }
    finally { setBusy(''); }
  };
  return <section aria-label="Emergency downloads" className="rounded-xl border border-border bg-card p-3">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Emergency downloads</h2><Button variant="outline" size="sm" disabled={Boolean(busy)} onClick={() => run('all')}>{busy === 'all' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}Download all templates</Button></div>
    <div className="flex flex-wrap gap-1.5">{types.map((type) => <Button key={type} variant="outline" size="sm" className="h-auto min-h-7 whitespace-normal px-2 py-1 text-left text-[11px]" disabled={Boolean(busy)} onClick={() => run(type)}>{busy === type ? <Loader2 className="h-3 w-3 shrink-0 animate-spin" /> : <Download className="h-3 w-3 shrink-0" />}{type}</Button>)}</div>
  </section>;
}