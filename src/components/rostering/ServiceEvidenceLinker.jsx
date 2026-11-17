import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ServiceEvidenceLinker({ shifts, onChanged }) {
  const [shiftId, setShiftId] = useState(''), [noteKey, setNoteKey] = useState('');
  const [options, setOptions] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [reason, setReason] = useState(''), [reviewed, setReviewed] = useState(false), [result, setResult] = useState('');
  const request = useRef(0);
  useEffect(() => {
    const version = ++request.current;
    setOptions(null); setNoteKey(''); setReason(''); setReviewed(false); setError(''); setResult('');
    if (!shiftId) return;
    setBusy(true);
    base44.functions.invoke('shiftServiceEvidence', { action: 'options', shift_id: shiftId }).then(response => {
      if (version !== request.current) return;
      if (!Array.isArray(response.data?.notes)) throw new Error(response.data?.error || 'Evidence options unavailable.');
      setOptions(response.data);
    }).catch(failure => { if (version === request.current) setError(failure.response?.data?.error || failure.message); })
      .finally(() => { if (version === request.current) setBusy(false); });
    return () => { request.current += 1; };
  }, [shiftId]);
  const selected = options?.notes.find(note => `${note.note_entity}:${note.id}` === noteKey);
  const save = async action => {
    const version = request.current; setBusy(true); setError(''); setResult('');
    try {
      const response = await base44.functions.invoke('shiftServiceEvidence', { action, shift_id: shiftId, note_id: selected?.id, note_entity: selected?.note_entity, reason, reviewed, command_key: crypto.randomUUID() });
      if (version !== request.current) return;
      if (!response.data?.ok) throw new Error(response.data?.error || 'Association not confirmed.');
      setOptions(current => ({ ...current, current: response.data.current }));
      setResult(response.data.current?.label || 'Association recorded.'); setReviewed(false);
      await onChanged?.();
    } catch (failure) { if (version === request.current) setError(failure.response?.data?.error || failure.message); }
    finally { if (version === request.current) setBusy(false); }
  };
  return <section className="space-y-3 rounded-xl border border-border bg-card p-4">
    <h3 className="text-sm font-bold">Review service note associations</h3>
    <p className="text-xs text-muted-foreground">Select the exact shift and read its note before linking. This records an association; clinical verification and billing approval remain separate.</p>
    <label className="block text-sm">Service shift<select className="mt-1 w-full rounded-md border border-input bg-background p-2" value={shiftId} onChange={event => setShiftId(event.target.value)} disabled={busy}><option value="">Select a shift</option>{shifts.map(shift => <option key={shift.id} value={shift.id}>{shift.date} · {shift.start_time}–{shift.end_time} · {shift.participant_name} · {shift.employee_name}</option>)}</select></label>
    {options && <><p className="text-xs" role="status">{options.current.label}</p><label className="block text-sm">Service note<select className="mt-1 w-full rounded-md border border-input bg-background p-2" value={noteKey} onChange={event => { setNoteKey(event.target.value); setReviewed(false); }} disabled={busy}><option value="">Select a note</option>{options.notes.map(note => <option key={`${note.note_entity}:${note.id}`} value={`${note.note_entity}:${note.id}`}>{note.title} · {note.staff} · {note.date}</option>)}</select></label>{!options.notes.length && <p className="text-xs text-muted-foreground">No eligible note found for this participant and service date. Record the actual note in Communications first.</p>}</>}
    {selected && <div className="whitespace-pre-wrap rounded-md border border-border p-3 text-sm">{selected.body}</div>}
    {options && <><label className="block text-sm">Association or correction reason<Input maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} disabled={busy} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} disabled={busy} />I reviewed the selected shift, worker and note.</label><div className="flex flex-wrap gap-2"><Button type="button" onClick={() => save('link')} disabled={busy || !selected || !reviewed || !reason.trim()}>Record exact association</Button><Button type="button" variant="outline" onClick={() => save('unlink')} disabled={busy || options.current.state === 'unlinked' || !reviewed || !reason.trim()}>Remove association</Button></div></>}
    {busy && <p className="text-sm" role="status">Loading service evidence…</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{result && <p role="status" className="text-sm">{result}</p>}
  </section>;
}
