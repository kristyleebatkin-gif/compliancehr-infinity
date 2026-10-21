import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import StaffGoalFields from '@/components/goals/StaffGoalFields';

const empty = { goal: '', category: '', progress: 0, status: 'In Progress', target_date: '', support_needed: '' };
export default function EmployeeGoalForm({ participantId, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await base44.functions.invoke('employeeGoals', { action: 'create', participant_id: participantId, values: form });
      setForm(empty); await onSaved();
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return <form onSubmit={save} className="space-y-3 rounded-xl border border-border bg-card p-4">
    <h3 className="text-sm font-semibold">Add participant goal</h3><StaffGoalFields form={form} setForm={setForm} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button variant="outline" type="submit" disabled={saving || !participantId || !form.goal.trim()}>{saving ? 'Saving…' : 'Save goal'}</Button>
  </form>;
}