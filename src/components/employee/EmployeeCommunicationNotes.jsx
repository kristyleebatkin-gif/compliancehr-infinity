import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import EmployeeParticipantSelect from '@/components/employee/EmployeeParticipantSelect';
import EmployeeCommunicationList from '@/components/employee/EmployeeCommunicationList';
import EmployeeNoteDetails from '@/components/employee/EmployeeNoteDetails';
export default function EmployeeCommunicationNotes({ employeeLog = false }) {
  const client = useQueryClient();
  const [participantId, setParticipantId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [files, setFiles] = useState([]);
  const [details, setDetails] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const attachments = await Promise.all(files.map(async (file) => ({ name: file.name, uri: (await base44.integrations.Core.UploadPrivateFile({ file })).file_uri })));
      await base44.functions.invoke('employeeCommunications', { action: 'note', participant_id: participantId, values: { ...details, kind: employeeLog ? 'Employee Log' : 'Shift Note', subject, body, date, attachments } });
      setSubject(''); setBody(''); setFiles([]); setDetails({}); event.target.reset();
      await client.invalidateQueries({ queryKey: ['employee-communications'] });
    } catch (failure) { setError(failure.response?.data?.error || failure.message); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4">
    {!employeeLog && <><EmployeeParticipantSelect value={participantId} onChange={(value) => { setParticipantId(value); setDetails((current) => ({ ...current, goal_id: '' })); }} /><p className="text-xs text-muted-foreground">No participant selected: your own notes. Select any approved participant to view and add their shift notes.</p></>}
    <form onSubmit={save} className="space-y-3 rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-extrabold">{employeeLog ? 'Add to my employee log' : 'Enter Shift Notes'}</h3>
      <label className="block text-sm">Subject<Input maxLength={200} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
      <label className="block text-sm">Date<Input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <EmployeeNoteDetails value={details} onChange={setDetails} participantId={participantId} employeeLog={employeeLog} />
      <label className="block text-sm">Note<Textarea required maxLength={10000} rows={5} value={body} onChange={(event) => setBody(event.target.value)} /></label>
      <label className="block text-sm">Attachments (stored privately)<Input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 5))} /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" variant="outline" disabled={busy || !body.trim()}>{busy ? 'Saving…' : 'Save note'}</Button>
    </form>
    <EmployeeCommunicationList view={employeeLog ? 'employee-log' : 'shift-notes'} participantId={participantId} />
  </section>;
}