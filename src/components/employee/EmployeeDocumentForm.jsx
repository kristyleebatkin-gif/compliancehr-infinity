import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Staff Badge', 'Other'];
export default function EmployeeDocumentForm() {
  const client = useQueryClient();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Other');
  const [expiry, setExpiry] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file }); await base44.functions.invoke('employeePersonalRecords', { action: 'document', values: { title, document_type: type, expiry_date: expiry, file_uri } }); setTitle(''); setFile(null); setExpiry(''); event.target.reset(); await client.invalidateQueries({ queryKey: ['employee-personal-records'] }); }
    catch (failure) { setError(failure.response?.data?.error || failure.message); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-semibold">Add a document to my file</h3>
    <label className="block text-sm">Title<Input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <label className="block text-sm">Document type<select value={type} onChange={(event) => setType(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3">{TYPES.map((value) => <option key={value}>{value}</option>)}</select></label>
    <label className="block text-sm">Expiry date (optional)<Input type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} /></label>
    <label className="block text-sm">File (stored privately)<Input type="file" required onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" variant="outline" disabled={busy || !file || !title.trim()}>{busy ? 'Saving…' : 'Add document'}</Button>
  </form>;
}