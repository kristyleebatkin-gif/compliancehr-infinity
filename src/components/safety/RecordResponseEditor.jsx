import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { recordSafetyEvent } from '@/lib/safetyEvent';

export default function RecordResponseEditor({ entity, record, field, label, canEdit, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await base44.entities[entity].update(record.id, { [field]: text }); await recordSafetyEvent(entity, record.id, { notify: false }); await onSaved(); setEditing(false); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  if (!editing) return <div className="space-y-2"><p className="whitespace-pre-wrap break-words text-sm text-foreground">{record[field] || 'Not recorded'}</p>{canEdit && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setText(record[field] || ''); setEditing(true); }}>Edit response</Button>}</div>;
  return <form onSubmit={save} className="space-y-2"><Textarea aria-label={label} rows={4} value={text} onChange={(e) => setText(e.target.value)} disabled={busy} />{error && <p role="alert" className="text-xs text-destructive">{error}</p>}<div className="flex gap-2"><Button size="sm" disabled={busy}>{busy ? 'Saving…' : 'Save response'}</Button><Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button></div></form>;
}