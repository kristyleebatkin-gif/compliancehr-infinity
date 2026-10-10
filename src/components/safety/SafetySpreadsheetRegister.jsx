import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import SectionCard from '@/components/SectionCard';
import { Download, Loader2, UploadCloud } from 'lucide-react';

function downloadWorkbook(data) {
  const binary = atob(data.data);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: data.mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = data.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SafetySpreadsheetRegister() {
  const { can } = useRole();
  const { toast } = useToast();
  const [busy, setBusy] = useState('');
  if (!can('feedback')) return null;

  const exportWorkbook = async () => {
    setBusy('export');
    try {
      const response = await base44.functions.invoke('safetyRegisters', { action: 'export' });
      if (response.data?.error) throw new Error(response.data.error);
      downloadWorkbook(response.data);
      toast({ title: 'Safety registers downloaded', description: `${response.data.count} records across incident, investigation, risk, Take Five and document sheets.` });
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    } finally { setBusy(''); }
  };

  const downloadTemplate = async () => {
    setBusy('template');
    try {
      const response = await base44.functions.invoke('safetyRegisters', { action: 'template' });
      if (response.data?.error) throw new Error(response.data.error);
      downloadWorkbook(response.data);
      toast({ title: 'Blank safety template downloaded' });
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    } finally { setBusy(''); }
  };

  const importWorkbook = async (file) => {
    if (!file) return;
    setBusy('import');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const response = await base44.functions.invoke('safetyRegisters', { action: 'import', file_uri });
      if (response.data?.error) throw new Error(response.data.error);
      const issues = [...(response.data.errors || []), ...(response.data.email_failures || [])];
      toast({
        title: 'Safety registers uploaded',
        description: `${response.data.created} created, ${response.data.updated} updated${issues.length ? `, ${issues.length} issue(s)` : ''}.`,
        variant: issues.length ? 'destructive' : undefined,
      });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally { setBusy(''); }
  };

  return (
    <SectionCard title="Safety Register Spreadsheet" description="Download one Excel workbook with separate sheets for incidents, investigations, risks, hazards, near misses, Take Five assessments and safety documents. Upload an edited workbook to update the live registers.">
      <div className="flex flex-wrap gap-2">
        <button onClick={exportWorkbook} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{busy === 'export' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download Excel workbook</button>
        <button onClick={downloadTemplate} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{busy === 'template' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download blank template</button>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          {busy === 'import' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Upload Excel workbook
          <input type="file" accept=".xlsx,.xls" className="hidden" disabled={!!busy} onChange={(event) => importWorkbook(event.target.files?.[0])} />
        </label>
      </div>
    </SectionCard>
  );
}