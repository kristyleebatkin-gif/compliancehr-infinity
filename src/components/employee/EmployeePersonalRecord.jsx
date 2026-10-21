import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DocumentAcknowledgements from '@/components/documents/DocumentAcknowledgements';
export default function EmployeePersonalRecord({ record, view, onFinalise, onStart, saving }) {
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);
  const open = async () => {
    setOpening(true); setError('');
    try {
      const file = record.file_uri || record.form_uri || record.file_url;
      const url = /^https?:\/\//.test(file) ? safeUrl(file) : (await base44.integrations.Core.CreateFileSignedUrl({ file_uri: file })).signed_url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (failure) { setError(failure.message); }
    finally { setOpening(false); }
  };
  return <article className="space-y-2 rounded-xl border border-border bg-card p-4">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-semibold">{record.subject || record.title || record.module_title || record.document_type}</h3><Badge variant="outline">{record.status || record.type || record.document_type}</Badge></div>
    <p className="text-xs text-muted-foreground">{[record.document_type, record.entry_date || record.received_date?.slice(0, 10) || record.date_received || record.issue_date, record.due_date && `Due ${record.due_date}`, record.expiry_date && `Expires ${record.expiry_date}`].filter(Boolean).join(' · ')}</p>
    {[record.message, record.description, record.notes, record.how_to_complete, record.resources_needed, record.important_info, record.outcome, record.resolution].filter(Boolean).map((text, index) => <p key={index} className="whitespace-pre-wrap text-sm">{text}</p>)}
    {record.certificate_number && <p className="text-xs text-muted-foreground">Certificate {record.certificate_number}{record.score != null ? ` · ${record.score}%` : ''}</p>}
    {(record.file_uri || record.file_url || record.form_uri) && <Button variant="outline" size="sm" disabled={opening} onClick={open}>{opening ? 'Opening…' : 'Open document'}</Button>}
    {view === 'documents' && <DocumentAcknowledgements entity="EmployeeDocument" documentId={record.id} title={record.title || record.document_type} />}
    {view === 'tasks' && ['Pending', 'Open', 'Overdue'].includes(record.status) && <Button variant="outline" size="sm" disabled={saving} onClick={() => onStart(record)}>Start task</Button>}
    {view === 'tasks' && !['Finalised', 'Completed', 'Cancelled', 'Pending Approval'].includes(record.status) && <Button variant="outline" size="sm" disabled={saving} onClick={() => onFinalise(record)}>Complete task</Button>}
    {view === 'tasks' && record.status === 'Pending Approval' && <p className="text-xs text-muted-foreground">Submitted for manager sign-off. The decision will appear in your alerts.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </article>;
}