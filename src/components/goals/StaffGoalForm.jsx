import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StaffGoalOwnerField from '@/components/goals/StaffGoalOwnerField';
import StaffGoalFields from '@/components/goals/StaffGoalFields';

export default function StaffGoalForm({ record, profile, onClose }) {
  const client = useQueryClient();
  const [owner, setOwner] = useState(record ? { id: record.staff_id, full_name: record.staff_name, email: record.staff_email } : profile || null);
  const [form, setForm] = useState({ goal: record?.goal || '', category: record?.category || '', progress: record?.progress ?? 0, status: record?.status || 'In Progress', target_date: record?.target_date || '', support_needed: record?.support_needed || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault();
    if (!owner?.id || !owner.email || !form.goal.trim()) return;
    setSaving(true); setError('');
    try {
      const progress = form.status === 'Achieved' ? 100 : Math.max(0, Math.min(100, Number(form.progress) || 0));
      const payload = { ...form, goal: form.goal.trim(), progress, status: progress === 100 ? 'Achieved' : form.status, target_date: form.target_date || undefined };
      if (record) await base44.entities.StaffGoal.update(record.id, payload);
      else await base44.entities.StaffGoal.create({ ...payload, staff_id: owner.id, staff_name: owner.full_name, staff_email: owner.email });
      await client.invalidateQueries({ queryKey: ['staff-goals'] });
      onClose();
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
    <DialogContent className="max-h-[85dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>{record ? 'Edit staff goal' : 'New staff goal'}</DialogTitle></DialogHeader>
      <form className="grid gap-3" onSubmit={save}>
        {record || profile ? <p className="text-sm font-semibold">Employee: {owner?.full_name}</p> : <StaffGoalOwnerField value={owner?.id || ''} onChange={setOwner} />}
        {profile && !owner?.email && <p role="alert" className="text-xs text-destructive">Add an email to the employee profile before creating goals.</p>}
        <StaffGoalFields form={form} setForm={setForm} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving || !owner?.email || !form.goal.trim()}>{saving ? 'Saving...' : 'Save staff goal'}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}