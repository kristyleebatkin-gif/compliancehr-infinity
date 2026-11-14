import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { runGateAction } from './useJourneyGate';

/** Records a corrective action against an incident. Owner, target date and effectiveness criteria are mandatory server-side too. */
export default function CorrectiveActionDialog({ incident, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', owner: '', target_date: '', effectiveness_criteria: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    setSaving(true);
    setError('');
    const result = await runGateAction('create_corrective_action', { incident_id: incident.incident_id, ...form });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.message);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Corrective action for {incident?.incident_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <Label htmlFor="title">Action</Label>
            <Input id="title" value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="What will be done" />
          </div>
          <div>
            <Label htmlFor="owner">Accountable owner</Label>
            <Input id="owner" value={form.owner} onChange={(e) => set({ owner: e.target.value })} placeholder="Person responsible" />
          </div>
          <div>
            <Label htmlFor="target_date">Target date</Label>
            <Input id="target_date" type="date" value={form.target_date} onChange={(e) => set({ target_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="effectiveness_criteria">How effectiveness will be measured</Label>
            <Textarea id="effectiveness_criteria" rows={2} value={form.effectiveness_criteria} onChange={(e) => set({ effectiveness_criteria: e.target.value })} placeholder="Recorded before closure can be considered" />
          </div>
          <div>
            <Label htmlFor="description">Detail (optional)</Label>
            <Textarea id="description" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
          {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[12px] text-rose-800">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Record action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}