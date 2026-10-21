import React from 'react';
import { Field, TextInput } from '@/components/Field';

export default function TaskCompletionFields({ form, onChange }) {
  return <fieldset className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
    <legend className="px-1 text-xs font-bold">Completion & competition details</legend>
    <Field label="People responsible (comma separated)"><TextInput value={(form.responsible || []).join(', ')} onChange={(e) => onChange('responsible', e.target.value.split(',').map((v) => v.trim()))} /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Completed by"><TextInput value={form.completed_by || ''} onChange={(e) => onChange('completed_by', e.target.value)} /></Field><Field label="Time taken (minutes)"><TextInput type="number" min="0" step="1" value={form.time_taken_minutes ?? ''} onChange={(e) => onChange('time_taken_minutes', e.target.value)} /></Field></div>
  </fieldset>;
}