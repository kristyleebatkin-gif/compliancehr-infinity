import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/** Approving a roadmap authorises people; it starts no work. The reason is kept as the decision. */
export default function RoadmapDecisionDialog({ open, onOpenChange, roadmap, outcome = 'Approved', busy, error, onSubmit } = {}) {
  const [reason, setReason] = useState('');

  useEffect(() => { if (open) setReason(''); }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{outcome === 'Approved' ? 'Approve' : 'Return'} {roadmap?.name}</DialogTitle>
          <DialogDescription>
            Version {roadmap?.version} of {roadmap?.roadmap_key}. {outcome === 'Approved'
              ? 'Approval records who authorised this plan and does not start any work itself.'
              : 'Returning sends the roadmap back to its author with your reason.'}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {roadmap?.author && <p className="text-[11px] text-[#0A2B6D]/70">Author: {roadmap.author}. You cannot approve your own roadmap unless you are an administrator, and that override is recorded.</p>}

        <div>
          <Label htmlFor="roadmap-decision-reason">Reason for this decision</Label>
          <Textarea id="roadmap-decision-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          <p className="mt-1 text-[11px] text-[#0A2B6D]/60">At least 10 characters. This is the decision record.</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || reason.trim().length < 10} onClick={() => onSubmit?.(reason.trim())}>
            {busy ? 'Saving…' : outcome === 'Approved' ? 'Approve roadmap' : 'Return roadmap'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}