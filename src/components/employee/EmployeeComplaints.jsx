import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import EmployeePersonalRecords from '@/components/employee/EmployeePersonalRecords';
export default function EmployeeComplaints() {
  const client = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await base44.functions.invoke('employeePersonalRecords', { action: 'complaint', values: { subject: title, body } }); setTitle(''); setBody(''); await client.invalidateQueries({ queryKey: ['employee-personal-records'] }); }
    catch (failure) { setError(failure.response?.data?.error || failure.message); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4"><form onSubmit={save} className="space-y-3 rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-semibold">My complaints</h3><label className="block text-sm">Title<Input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="block text-sm">Complaint<Textarea required maxLength={10000} value={body} onChange={(event) => setBody(event.target.value)} /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" variant="outline" disabled={busy || !title.trim() || !body.trim()}>{busy ? 'Submitting…' : 'Submit complaint'}</Button></form><EmployeePersonalRecords view="complaints" /></section>;
}