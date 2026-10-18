import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUSES = ['Received', 'Acknowledged', 'Under Investigation', 'Resolved', 'Closed'];

// Progress or resolve a complaint: move it through the status track and record
// the resolution notes. Updates are limited to management roles by row-level security.
export default function ComplaintResolveDialog({ complaint, open, onOpenChange, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(complaint?.status || 'Received');
  const [resolution, setResolution] = useState(complaint?.resolution || '');

  const save = async () => {
    if (!complaint) return;
    setSaving(true);
    try {
      const patch = { status };
      if (['Resolved', 'Closed'].includes(status) && resolution.trim()) patch.resolution = resolution.trim();
      await base44.entities.Complaint.update(complaint.id, patch);
      toast({ title: status === 'Resolved' ? 'Complaint resolved' : 'Complaint updated', description: `${complaint.complaint_id || complaint.title} is now ${status}.` });
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      toast({ title: 'Could not update complaint', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Update Complaint</DialogTitle>
          <DialogDescription>{complaint?.complaint_id ? `${complaint.complaint_id} · ` : ''}{complaint?.title}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Resolution / Notes</Label>
            <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} placeholder="How it was investigated and settled" />
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Update'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}