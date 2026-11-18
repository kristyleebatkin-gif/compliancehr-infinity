import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/** A human reviewer settles a proposal. The reason is the audit record; an override needs its own. */
export default function DecisionReviewDialog({ open, onOpenChange, decision, meta = {}, busy, error, onSubmit } = {}) {
  const [form, setForm] = useState({ outcome: 'Approved', reason: '', override_reason: '', conditions: '' });

  useEffect(() => {
    if (open) setForm({ outcome: 'Approved', reason: '', override_reason: '', conditions: '' });
  }, [open]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const minLength = meta.minReasonLength || 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review AI decision</DialogTitle>
          <DialogDescription>
            Approving authorises a person to act; it never makes the AI act, and this OS performs nothing either. You cannot review a proposal you recorded yourself.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        {decision && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-[#0A2B6D]">
            <p className="text-sm font-bold">{decision.action_title}</p>
            <p className="mt-0.5">{decision.decision_ref} · {decision.agent_name} · {decision.execution_state}</p>
            <p className="mt-1 font-bold">{decision.policy_verdict}: {decision.policy_reason}</p>
            <p className="mt-1">{decision.output_summary || decision.action_summary}</p>
            {decision.redacted_count > 0 && <p className="mt-1">{decision.redacted_count} value(s) were redacted before this record was written.</p>}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ai-review-outcome">Outcome</Label>
            <Select value={form.outcome} onValueChange={(outcome) => set({ outcome })}>
              <SelectTrigger id="ai-review-outcome"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.reviewOutcomes || ['Approved', 'Rejected', 'Overridden']).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-review-conditions">Conditions of approval</Label>
            <Input id="ai-review-conditions" value={form.conditions} onChange={(e) => set({ conditions: e.target.value })} placeholder="Optional" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-review-reason">Review reason</Label>
            <Textarea id="ai-review-reason" rows={3} value={form.reason} onChange={(e) => set({ reason: e.target.value })} />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">At least {minLength} characters. Stored with secrets and identifiers removed.</p>
          </div>
          {form.outcome === 'Overridden' && (
            <div className="sm:col-span-2">
              <Label htmlFor="ai-review-override">Override reason</Label>
              <Textarea id="ai-review-override" rows={3} value={form.override_reason} onChange={(e) => set({ override_reason: e.target.value })} placeholder="What you decided instead, and why." />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button
            disabled={busy || form.reason.trim().length < minLength || (form.outcome === 'Overridden' && form.override_reason.trim().length < minLength)}
            onClick={() => onSubmit?.(form)}
          >
            {busy ? 'Recording…' : 'Record review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}