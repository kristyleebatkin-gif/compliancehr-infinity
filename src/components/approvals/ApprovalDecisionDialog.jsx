import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { currentStage } from '@/lib/approvalChain';

export default function ApprovalDecisionDialog({ target, busy, error, onClose, onSubmit }) {
  const [note, setNote] = useState('');
  const [signature, setSignature] = useState('');
  const approving = target?.decision === 'approve';
  const stage = target?.chain ? currentStage(target.chain) : null;

  const submit = async (event) => {
    event.preventDefault();
    const done = await onSubmit({ note, signature });
    if (done) { setNote(''); setSignature(''); }
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={(next) => { if (!next) { setNote(''); setSignature(''); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{approving ? `Approve level ${stage?.level || ''}` : `Return level ${stage?.level || ''}`}</DialogTitle>
          <DialogDescription>
            {target?.chain?.title} · {approving ? 'Signing advances the request to the next level.' : 'Returning closes the request back to the person who raised it.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="chain-note">{approving ? 'Note (optional)' : 'Why is it being returned?'}</Label>
            <Textarea id="chain-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          {approving && (
            <div className="space-y-1">
              <Label htmlFor="chain-signature">Type your full name to sign this level</Label>
              <Input id="chain-signature" value={signature} onChange={(event) => setSignature(event.target.value)} autoComplete="name" />
            </div>
          )}
          {error && <p role="alert" className="rounded-lg border border-destructive/40 p-2 text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy || (approving ? signature.trim().length < 2 : note.trim().length < 3)}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {approving ? 'Sign and advance' : 'Return request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}