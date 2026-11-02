import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { safeUrl } from '@/lib/safeUrl';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { downloadContractPdf, downloadPositionDescriptionPdf } from '@/lib/hrPaperworkPdf';
import { Download, FileText } from 'lucide-react';
import { statusTone } from '@/lib/statusStyles';

export default function HrEmployeeFileCard({ record, kind }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const status = record.contract_status || record.status || (record.acknowledged ? 'Acknowledged' : 'Filed');
  const uri = record.file_uri || (String(record.document_url || record.file_url || '').startsWith('private/') ? record.document_url || record.file_url : null);
  const url = safeUrl(record.document_url || record.file_url);
  const title = record.title || record.subject || record.position_title || record.letter_type || record.document_type || record.review_type || 'HR file';
  const openFile = async () => {
    setBusy(true); setError('');
    const popup = window.open('', '_blank');
    if (popup) popup.opener = null;
    try {
      const target = uri ? (await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri })).signed_url : url;
      if (popup && target) popup.location.href = target;
      else if (!popup) setError('Allow pop-ups to open this file.');
    } catch (e) { popup?.close(); setError(e.message); }
    finally { setBusy(false); }
  };
  const downloadPdf = async () => {
    setBusy(true); setError('');
    try {
      const business = await loadCompanyBranding();
      (kind === 'contract' ? downloadContractPdf : downloadPositionDescriptionPdf)(record, { business_name: business.companyName, address_line: business.addressLine, abn: business.abn }, record.employee_name);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const fields = Object.entries(record).filter(([key, value]) => value !== null && value !== '' && typeof value !== 'object' && !['id', 'created_by_id', 'created_date', 'updated_date', 'archived'].includes(key) && !/(?:_id|_url|_uri)$/.test(key));
  return <article className="min-w-0 space-y-2 rounded-xl border border-border bg-card p-3">
    <div className="flex items-start justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 shrink-0 text-primary" />{title}</h3><Badge className={statusTone(status)}>{status}</Badge></div>
    <p className="text-xs text-muted-foreground">{record.employee_name || record.staff_name || record.person_name} · {record.commencement_date || record.uploaded_date || record.date_sent || record.review_date || record.scheduled_review_date || String(record.created_date || '').slice(0, 10)}</p>
    {(uri || url) ? <Button size="sm" variant="outline" disabled={busy} onClick={openFile}><Download className="h-3 w-3" />{busy ? 'Opening…' : 'Open original file'}</Button> : ['contract', 'position'].includes(kind) && <Button size="sm" variant="outline" disabled={busy} onClick={downloadPdf}><Download className="h-3 w-3" />Download PDF</Button>}
    <details className="text-xs"><summary className="cursor-pointer font-semibold text-primary">View recorded details</summary><dl className="mt-2 space-y-2">{fields.map(([key, value]) => <div key={key}><dt className="font-semibold capitalize">{key.replaceAll('_', ' ')}</dt><dd className="whitespace-pre-wrap break-words text-muted-foreground">{String(value)}</dd></div>)}</dl></details>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </article>;
}