import React, { useId, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { downloadOriginalDocument } from '@/lib/documentDownloads';
import { Loader2 } from 'lucide-react';

export default function JourneyDocuments({ documents, onChange, onBusy, readOnly = false }) {
  const id = useId();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const run = async (action) => {
    setBusy(true); onBusy(true); setError('');
    try { await action(); } catch (failure) { setError(failure.message); }
    finally { setBusy(false); onBusy(false); }
  };
  const upload = (event) => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    run(async () => {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose a document no larger than 10 MB.');
      if (documents.length >= 5) throw new Error('Use up to five documents per milestone.');
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      onChange([...documents, { file_uri, name: file.name }]);
    });
  };
  return <div className="space-y-1 text-[11px]">
    <label htmlFor={id} className="block font-medium">Supporting documents (stored privately)</label>
    {!readOnly && <input id={id} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.webp" disabled={busy} onChange={upload} className="block w-full min-w-0 text-[11px]" />}
    {busy && <p role="status" className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Processing document…</p>}
    {documents.map((document, index) => <div key={document.file_uri} className="flex flex-wrap items-center gap-1"><Button type="button" variant="link" size="sm" disabled={busy} className="h-auto max-w-full whitespace-normal break-all px-0 text-[11px]" onClick={() => run(async () => { const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: document.file_uri }); await downloadOriginalDocument(signed_url, document.name); })}>{document.name}</Button>{!readOnly && <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => onChange(documents.filter((item, itemIndex) => itemIndex !== index))} aria-label={`Remove attachment ${document.name}`}>Remove</Button>}</div>)}
    {!readOnly && documents.length > 0 && <p className="text-muted-foreground">Save the journey to keep attachment changes.</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </div>;
}