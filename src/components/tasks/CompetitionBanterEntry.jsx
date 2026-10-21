import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';

export default function CompetitionBanterEntry({ entry, onSaved }) {
  const { user } = useRole();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.body || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const allowed = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'].includes(user?.role) || entry.created_by_id === user?.id;
  const save = async () => { setSaving(true); setError(''); try { await base44.entities.CommunicationEntry.update(entry.id, { body: text }); await onSaved(); setEditing(false); } catch (failure) { setError(failure.message); } finally { setSaving(false); } };
  return <div className="rounded-lg border border-primary/15 bg-card/80 px-3 py-2 text-xs">
    <div className="flex items-start justify-between gap-2"><p><span className="font-semibold">{entry.sender_name || 'Anon'}:</span> {!editing && entry.body}</p>{allowed && !editing && <button type="button" aria-label="Edit team banter" onClick={() => { setText(entry.body || ''); setEditing(true); }}><Pencil className="h-3 w-3 text-primary" /></button>}</div>
    {editing && <div className="mt-2 space-y-2"><Textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Team banter" />{error && <p role="alert" className="text-destructive">{error}</p>}<div className="flex gap-2"><Button size="sm" onClick={save} disabled={saving || !text.trim()}>Save</Button><Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div></div>}
  </div>;
}