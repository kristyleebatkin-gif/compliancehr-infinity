import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * One dialog for every governed step that needs a recorded reason: validate, approve, retire,
 * submit, approve-or-return. The note is the audit evidence, so it is never optional where the
 * decision changes what the business may rely on.
 * @param {any} props
 */
export default function DecisionDialog({
  open, onOpenChange, title, description, noteLabel = 'Reason', notePlaceholder = '', options = [],
  submitLabel = 'Save', busy, error, onSubmit,
} = {}) {
  const [note, setNote] = useState('');
  const [choice, setChoice] = useState(options[0] || '');

  useEffect(() => {
    if (!open) return;
    setNote('');
    setChoice(options[0] || '');
  }, [open, options]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title || 'Record a decision'}</DialogTitle>
          <DialogDescription>{description || 'What you record here is kept on the record and in the audit trail.'}</DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="space-y-3">
          {options.length > 0 && (
            <div>
              <Label htmlFor="twin-decision-choice">Decision</Label>
              <Select value={choice} onValueChange={setChoice}>
                <SelectTrigger id="twin-decision-choice"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="twin-decision-note">{noteLabel}</Label>
            <Textarea id="twin-decision-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder={notePlaceholder} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={() => onSubmit?.({ note, decision: choice })} disabled={busy}>{busy ? 'Saving…' : submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}