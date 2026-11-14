import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  HANDOVER_ENABLED,
  HANDOVER_PENDING_MESSAGE,
  referralIntakeBlockers,
  startIntakeFromReferral,
} from '@/lib/referralIntake';

const PENDING_STATES = ['created_link_pending', 'linked_audit_pending'];

export default function ReferralToIntakeDialog({ referral, open, onClose, onCreated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [blockers, setBlockers] = useState([]);
  const [result, setResult] = useState(null);

  const reset = () => {
    setBlockers([]);
    setResult(null);
    setSaving(false);
  };

  // Never close over a request that is still running: a half-finished handover has to
  // be seen, not hidden behind a closed dialog.
  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  // Opening again starts clean, so an earlier outcome can never be read as a new one.
  useEffect(() => {
    if (open) {
      setBlockers([]);
      setResult(null);
    }
  }, [open]);

  const run = async () => {
    if (saving || !HANDOVER_ENABLED) return;
    setSaving(true);
    setBlockers([]);
    try {
      const outcome = await startIntakeFromReferral({ referral });
      setResult(outcome);
      if (!PENDING_STATES.includes(outcome.state)) {
        toast({
          title: outcome.state === 'already_linked' ? 'Already linked' : `Intake case ${outcome.caseNumber} ready`,
          description: outcome.message,
        });
      }
      onCreated?.();
    } catch (error) {
      setBlockers(error.blockers?.length ? error.blockers : [error.message || 'The handover failed.']);
    } finally {
      setSaving(false);
    }
  };

  const existingBlockers = result ? [] : referralIntakeBlockers(referral);
  const pending = result && PENDING_STATES.includes(result.state);

  const carried = referral
    ? [
        ['Person', referral.client_name],
        ['Date of birth', referral.date_of_birth],
        ['Contact', [referral.phone, referral.email].filter(Boolean).join(' · ')],
        ['Address', [referral.address, referral.postcode].filter(Boolean).join(', ')],
        ['Reason for referral', referral.reason],
        ['Support needs', referral.support_needs],
        ['Referrer', [referral.referrer_name, referral.referrer_role].filter(Boolean).join(' — ')],
      ].filter(([, value]) => value)
    : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent
        className="max-h-[92vh] overflow-y-auto sm:max-w-lg"
        onEscapeKeyDown={(event) => { if (saving) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (saving) event.preventDefault(); }}
        onInteractOutside={(event) => { if (saving) event.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>Start intake from referral {referral?.referral_id}</DialogTitle>
        </DialogHeader>

        {!HANDOVER_ENABLED && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{HANDOVER_PENDING_MESSAGE} Log referrals and their correspondence as usual; only this handover step is paused.</span>
          </div>
        )}

        {result ? (
          <div className="space-y-3 text-sm">
            <div
              className={`flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold ${
                pending
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-900'
              }`}
            >
              {pending ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
              <span>{result.message}</span>
            </div>

            {(result.possibleDuplicateOf || result.nameMatchReview || result.numberConflict) && (
              <ul className="list-disc space-y-1 rounded-lg border border-border bg-muted/40 p-3 pl-6 text-xs text-muted-foreground">
                {result.possibleDuplicateOf && (
                  <li>Possible duplicate of open case {result.possibleDuplicateOf} (same name and date of birth). Review both before proceeding; nothing was merged.</li>
                )}
                {!result.possibleDuplicateOf && result.nameMatchReview && (
                  <li>Another open case has the same name. A name match is a review flag, not proof it is the same person.</li>
                )}
                {result.numberConflict && (
                  <li>The allocated case number is also held by another record. Report this to an administrator before relying on the number.</li>
                )}
              </ul>
            )}

            {!pending && (
              <p className="text-xs text-muted-foreground">
                Continue in Intake Centre: complete eligibility, consents and documents, then approve and convert to a participant profile.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              A participant intake case will be created in Draft from the stored referral. Nothing is sent to the person and no profile is created yet.
            </p>
            <div className="rounded-xl bg-muted/50 p-3 text-xs">
              {carried.length ? carried.map(([label, value]) => (
                <div key={label} className="flex gap-2 py-0.5">
                  <span className="w-32 shrink-0 font-semibold text-foreground/70">{label}</span>
                  <span className="min-w-0 whitespace-pre-wrap">{value}</span>
                </div>
              )) : <span className="text-muted-foreground">No details recorded on this referral yet.</span>}
            </div>
            {existingBlockers.length > 0 && blockers.length === 0 && (
              <ul className="list-disc space-y-1 rounded-lg border border-border bg-muted/40 p-3 pl-6 text-xs text-muted-foreground">
                {existingBlockers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            {blockers.length > 0 && (
              <ul role="alert" className="list-disc space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 pl-6 text-xs text-destructive">
                {blockers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {result && !pending ? (
            <>
              <Button variant="outline" onClick={close} disabled={saving}>Close</Button>
              <Button asChild>
                <Link to="/intake/participant"><ArrowRight className="h-4 w-4" />Open Intake Centre</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={close} disabled={saving}>Close</Button>
              <Button
                onClick={run}
                disabled={saving || !HANDOVER_ENABLED || (!result && existingBlockers.length > 0)}
                title={HANDOVER_ENABLED ? undefined : HANDOVER_PENDING_MESSAGE}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {!HANDOVER_ENABLED ? 'Handover paused' : result ? 'Retry handover' : 'Create intake case'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}