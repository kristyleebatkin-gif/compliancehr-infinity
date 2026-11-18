import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/** One reason, recorded. The reason is the audit record, so it is never optional. */
export default function StrategyReasonDialog({ open, onOpenChange, title, description, label, submitLabel = 'Save', busy, error, onSubmit } = {}) {
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
          <Label htmlFor="strategy-reason">{label || 'Reason'}</Label>
          <Textarea id="strategy-reason" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          <p className="mt-1 text-[11px] text-[#0A2B6D]/60">At least 10 characters. This is stored on the record and in the audit trail.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || note.trim().length < 10} onClick={() => onSubmit?.(note.trim())}>{busy ? 'Saving…' : submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}