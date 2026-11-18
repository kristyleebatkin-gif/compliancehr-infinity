import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = ['Open', 'Remediation planned', 'In progress', 'Closed', 'Risk accepted'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

/** @param {any} props */
export default function GapDialog({ open, onOpenChange, gap, busy, error, canVerify, onSave, onCreatePlan } = {}) {
  const [status, setStatus] = useState('Open');
  const [severity, setSeverity] = useState('Medium');
  const [recommendation, setRecommendation] = useState('');
  const [closureNote, setClosureNote] = useState('');
  const [planMode, setPlanMode] = useState(false);
  const [owner, setOwner] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [actions, setActions] = useState('');

  useEffect(() => {
    if (!gap) return;
    setStatus(gap.status || 'Open');
    setSeverity(gap.severity || 'Medium');
    setRecommendation(gap.recommendation || '');
    setClosureNote('');
    setPlanMode(false);
    setOwner('');
    setTargetDate('');
    setActions(gap.recommendation || '');
  }, [gap]);

  if (!gap) return null;
  const closed = ['Closed', 'Risk accepted'].includes(gap.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{gap.control_statement || gap.gap_type}</DialogTitle>
          <DialogDescription>
            {gap.standard_code ? `${gap.standard_code} · ` : ''}{gap.framework} · {gap.gap_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">What the records show</p>
            <p className="mt-1 text-sm text-[#0A2B6D]">{gap.observation || 'No observation recorded.'}</p>
            {gap.assessment_ref && <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Raised by assessment {gap.assessment_ref}</p>}
          </div>

          {!planMode ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="gap-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="gap-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gap-severity">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="gap-severity"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="gap-recommendation">Recommendation</Label>
                <Textarea id="gap-recommendation" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows={3} />
              </div>
              {status === 'Closed' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="gap-closure">How was this gap closed?</Label>
                  <Textarea id="gap-closure" value={closureNote} onChange={(e) => setClosureNote(e.target.value)} rows={2} />
                </div>
              )}
              {['Closed', 'Risk accepted'].includes(status) && !canVerify && (
                <p className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                  Closing a gap or accepting its risk needs a Provider Administrator, Management or admin.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plan-owner">Accountable owner</Label>
                <Input id="plan-owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-target">Target date</Label>
                <Input id="plan-target" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="plan-actions">Planned actions</Label>
                <Textarea id="plan-actions" value={actions} onChange={(e) => setActions(e.target.value)} rows={3} />
              </div>
            </div>
          )}

          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={busy}>Close</Button>
          {!closed && !planMode && (
            <Button variant="secondary" onClick={() => setPlanMode(true)} disabled={busy}>Raise remediation plan</Button>
          )}
          {planMode ? (
            <>
              <Button variant="outline" onClick={() => setPlanMode(false)} disabled={busy}>Back</Button>
              <Button
                onClick={() => onCreatePlan?.(gap.id, { assigned_to: owner, target_date: targetDate, actions, recommendation })}
                disabled={busy || owner.trim().length < 2 || !targetDate}
              >
                {busy ? 'Saving…' : 'Create plan'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onSave?.(gap.id, {
                status,
                severity,
                recommendation,
                closure_note: status === 'Closed' ? closureNote : undefined,
              })}
              disabled={busy}
            >
              {busy ? 'Saving…' : 'Save gap'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}