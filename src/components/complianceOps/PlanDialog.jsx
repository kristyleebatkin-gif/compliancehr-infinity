import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = ['Not started', 'In progress', 'Blocked', 'Completed'];

/** @param {any} props */
export default function PlanDialog({ open, onOpenChange, plan, canVerify, busy, error, onProgress, onVerify } = {}) {
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState('In progress');
  const [note, setNote] = useState('');
  const [verifyNote, setVerifyNote] = useState('');
  const [mode, setMode] = useState('progress');

  useEffect(() => {
    if (!plan) return;
    setPercentage(Number(plan.completion_percentage) || 0);
    setStatus(plan.status === 'Not started' ? 'In progress' : plan.status === 'Closed' ? 'Completed' : plan.status);
    setNote('');
    setVerifyNote('');
    setMode('progress');
  }, [plan]);

  if (!plan) return null;
  const closed = plan.status === 'Closed';
  const log = (() => {
    try { return JSON.parse(plan.updates_json || '[]'); } catch { return []; }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan.plan_ref || 'Remediation plan'} · {plan.gap_title || plan.gap_ref}</DialogTitle>
          <DialogDescription>
            Owner {plan.assigned_to || 'unassigned'} · target {plan.target_date || 'not set'} · {plan.completion_percentage ?? 0}% complete
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {plan.actions && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Planned actions</p>
              <p className="mt-1 whitespace-pre-line text-sm text-[#0A2B6D]">{plan.actions}</p>
            </div>
          )}

          {log.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Progress log</p>
              <ul className="mt-1 space-y-1">
                {[...log].reverse().map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="text-[12px] text-[#0A2B6D]">
                    <span className="font-bold">{entry.percentage}%</span> · {entry.status} · {entry.by} · {new Date(entry.at).toLocaleString()}
                    <div className="text-[11px] text-[#0A2B6D]/70">{entry.note}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {closed ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
              Verified by {plan.verified_by || 'a manager'} on {plan.verified_on || plan.closed_on}. {plan.closure_note || ''}
            </p>
          ) : mode === 'progress' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plan-percentage">Completion (%)</Label>
                <Input
                  id="plan-percentage"
                  type="number"
                  min={0}
                  max={100}
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="plan-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="plan-note">What changed?</Label>
                <Textarea id="plan-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="plan-verify">How was completion verified?</Label>
              <Textarea id="plan-verify" value={verifyNote} onChange={(e) => setVerifyNote(e.target.value)} rows={3} />
              <p className="text-[11px] text-[#0A2B6D]/70">
                Verifying closes the plan and the gap it came from. A Provider Administrator, Management or admin must do this.
              </p>
            </div>
          )}

          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={busy}>Close</Button>
          {!closed && mode === 'progress' && canVerify && (
            <Button variant="secondary" onClick={() => setMode('verify')} disabled={busy}>Verify and close</Button>
          )}
          {!closed && mode === 'verify' ? (
            <>
              <Button variant="outline" onClick={() => setMode('progress')} disabled={busy}>Back</Button>
              <Button onClick={() => onVerify?.(plan.id, verifyNote)} disabled={busy || verifyNote.trim().length < 4}>
                {busy ? 'Saving…' : 'Verify and close'}
              </Button>
            </>
          ) : !closed ? (
            <Button
              onClick={() => onProgress?.(plan.id, {
                completion_percentage: percentage,
                status,
                note,
                evidence_ref: plan.evidence_ref || '',
              })}
              disabled={busy || !note.trim()}
            >
              {busy ? 'Saving…' : 'Save progress'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}