import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StaffGoalFields({ form, setForm }) {
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return <>
    <div className="grid gap-1.5"><Label htmlFor="staff-goal-title">Goal *</Label><Textarea id="staff-goal-title" value={form.goal} onChange={(event) => change('goal', event.target.value)} required /></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5"><Label htmlFor="staff-goal-category">Category</Label><Input id="staff-goal-category" value={form.category} onChange={(event) => change('category', event.target.value)} /></div>
      <div className="grid gap-1.5"><Label htmlFor="staff-goal-date">Target date</Label><Input id="staff-goal-date" type="date" value={form.target_date} onChange={(event) => change('target_date', event.target.value)} /></div>
      <div className="grid gap-1.5"><Label htmlFor="staff-goal-progress">Progress (%)</Label><Input id="staff-goal-progress" type="number" min="0" max="100" required value={form.progress} onChange={(event) => change('progress', event.target.value)} /></div>
      <div className="grid gap-1.5"><Label>Status</Label><Select value={form.status} onValueChange={(value) => change('status', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['In Progress', 'Achieved', 'On Hold'].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <div className="grid gap-1.5"><Label htmlFor="staff-goal-support">Support needed</Label><Textarea id="staff-goal-support" value={form.support_needed} onChange={(event) => change('support_needed', event.target.value)} /></div>
  </>;
}