import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';
import { rangesOverlap } from '@/lib/rostering';

// Suggests active staff for an unassigned shift, excluding staff marked
// unavailable that day (or overlapping hours) and staff with a clashing shift.
export default function FillShiftDialog({ open, onOpenChange, shift, shifts, staff, availability, onFilled }) {
  const [saving, setSaving] = useState(null);

  useEffect(() => { if (!open) setSaving(null); }, [open]);

  const suggestions = (staff || []).map((name) => {
    const unavailable = (availability || []).some((a) =>
      a.staff_name === name && a.type === 'Unavailable' && a.date === shift.date &&
      (a.all_day || rangesOverlap(a.start_time || '00:00', a.end_time || '23:59', shift.start_time || '00:00', shift.end_time || '23:59')));
    const clashing = (shifts || []).some((s) =>
      s.id !== shift.id && s.date === shift.date && s.employee_name === name &&
      rangesOverlap(s.start_time || '00:00', s.end_time || '23:59', shift.start_time || '00:00', shift.end_time || '23:59'));
    return { name, unavailable, clashing };
  }).sort((a, b) => (a.unavailable || a.clashing) - (b.unavailable || b.clashing));

  const assign = async (name) => {
    setSaving(name);
    try {
      await base44.entities.Shift.update(shift.id, { employee_name: name });
      await onFilled();
      onOpenChange(false);
    } finally {
      setSaving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fill shift</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {shift.date}{shift.start_time ? ` · ${shift.start_time}${shift.end_time ? `–${shift.end_time}` : ''}` : ''}
            {shift.participant_name ? ` · ${shift.participant_name}` : ''}
          </p>
        </DialogHeader>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {suggestions.map(({ name, unavailable, clashing }) => (
            <div key={name} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{name}</p>
                {unavailable && <Badge className="bg-danger/10 text-danger">Unavailable</Badge>}
                {clashing && <Badge className="bg-warning/10 text-warning">Already rostered</Badge>}
              </div>
              <Button size="sm" variant="outline" disabled={Boolean(saving) || unavailable || clashing} onClick={() => assign(name)}>
                {saving === name ? 'Assigning…' : 'Assign'}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}