import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/** A single free-text reason, kept for the calls that need an explanation on the record. */
export default function ReasonDialog({ open, onOpenChange, title, description, label, submitLabel, busy, error, onSubmit } = {}) {
  const [note, setNote] = useState('');

  useEffect(() => { if (open) setNote(''); }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        <div>
          <Label htmlFor="workforce-reason">{label || 'Reason'}</Label>
          <Textarea id="workforce-reason" rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
          <p className="mt-1 text-[11px] text-[#0A2B6D]/60">This reason is written to the audit trail, with secrets and identifiers removed.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy} onClick={() => onSubmit?.(note.trim())}>{busy ? 'Saving…' : submitLabel || 'Confirm'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}