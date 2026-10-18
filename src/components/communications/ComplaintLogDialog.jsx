import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const RELATIONSHIPS = ['Participant', 'Family Member', 'Staff', 'Advocate', 'Other'];
const CATEGORIES = ['Service Quality', 'Staff Conduct', 'Communication', 'Safety', 'Financial', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

// Secure logging of internal (staff) and external (participant / family / advocate)
// complaints straight from the Communication Centre. Access is enforced by the
// Complaint entity's row-level security.
export default function ComplaintLogDialog({ open, onOpenChange, onLogged }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', complainant_name: '', complainant_relationship: 'Participant',
    category: 'Service Quality', priority: 'Medium', description: '', assigned_to: '', target_resolution_date: '',
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const isInternal = form.complainant_relationship === 'Staff';
      await base44.entities.Complaint.create({
        title: form.title.trim(),
        complaint_id: `CMP-${Date.now().toString().slice(-8)}`,
        date_received: new Date().toISOString().slice(0, 10),
        time_received: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5),
        complainant_name: form.complainant_name.trim(),
        complainant_relationship: form.complainant_relationship,
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
        assigned_to: form.assigned_to.trim(),
        target_resolution_date: form.target_resolution_date || undefined,
        status: 'Received',
      });
      toast({ title: 'Complaint logged', description: `Recorded as an ${isInternal ? 'internal' : 'external'} complaint on the register.` });
      setForm({ title: '', complainant_name: '', complainant_relationship: 'Participant', category: 'Service Quality', priority: 'Medium', description: '', assigned_to: '', target_resolution_date: '' });
      onOpenChange(false);
      onLogged?.();
    } catch (e) {
      toast({ title: 'Could not log complaint', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Log a Complaint</DialogTitle>
          <DialogDescription>Log internal (staff) or external (participant, family, advocate) feedback. It lands on the secure complaints register immediately.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Complaint Title *</Label>
            <Input value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Late arrival to scheduled shift" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Complainant Name</Label>
              <Input value={form.complainant_name} onChange={(e) => set('complainant_name')(e.target.value)} placeholder="Who raised it" />
            </div>
            <div className="grid gap-1.5">
              <Label>Relationship</Label>
              <Select value={form.complainant_relationship} onValueChange={set('complainant_relationship')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={set('category')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={set('priority')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set('description')(e.target.value)} rows={3} placeholder="What happened, when, and any immediate action taken" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Assigned To</Label>
              <Input value={form.assigned_to} onChange={(e) => set('assigned_to')(e.target.value)} placeholder="Responsible person" />
            </div>
            <div className="grid gap-1.5">
              <Label>Target Resolution Date</Label>
              <Input type="date" value={form.target_resolution_date} onChange={(e) => set('target_resolution_date')(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.title.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Complaint'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}