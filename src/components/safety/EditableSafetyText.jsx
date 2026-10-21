import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useSafetyGuidance from '@/components/safety/useSafetyGuidance';

export default function EditableSafetyText({ module, guidanceKey, defaultText, label = 'Response guidance' }) {
  const { user } = useRole();
  const canEdit = ['admin', 'Provider Administrator', 'Management', 'Administration'].includes(user?.role);
  const query = useSafetyGuidance(module);
  const client = useQueryClient();
  const record = query.data?.find((item) => item.guidance_key === guidanceKey);
  const text = record?.text ?? defaultText;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const mutation = useMutation({
    mutationFn: () => record ? base44.entities.SafetyGuidance.update(record.id, { text: draft }) : base44.entities.SafetyGuidance.create({ module, guidance_key: guidanceKey, text: draft }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['safety-guidance', module] }); setEditing(false); },
  });
  if (editing) return <div className="space-y-2 rounded-lg border border-border bg-card p-2 text-foreground">
    <Textarea aria-label={label} rows={4} maxLength={8000} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={mutation.isPending} />
    {mutation.isError && <p role="alert" className="text-xs text-destructive">{mutation.error.message}</p>}
    <div className="flex gap-2"><Button type="button" size="sm" disabled={mutation.isPending || !draft.trim()} onClick={() => mutation.mutate()}>{mutation.isPending ? 'Saving…' : 'Save response'}</Button><Button type="button" size="sm" variant="outline" disabled={mutation.isPending} onClick={() => setEditing(false)}>Cancel</Button></div>
  </div>;
  return <div className="min-w-0 space-y-1"><div className="whitespace-pre-wrap break-words">{text}</div>{query.isError && <p role="alert" className="text-xs text-destructive">Saved guidance could not be loaded.</p>}{canEdit && <Button type="button" size="sm" variant="outline" className="h-6 gap-1 bg-card px-2 text-[10px] text-foreground" disabled={query.isPending || query.isError} onClick={() => { mutation.reset(); setDraft(text); setEditing(true); }}>Edit response</Button>}</div>;
}