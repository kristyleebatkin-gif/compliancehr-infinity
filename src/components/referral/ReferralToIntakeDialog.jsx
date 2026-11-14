import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { referralIntakeBlockers, startIntakeFromReferral } from '@/lib/referralIntake';

export default function ReferralToIntakeDialog({ referral, open, onClose, onCreated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [blockers, setBlockers] = useState([]);
  const [created, setCreated] = useState(null);

  const close = () => {
    setBlockers([]);
    setCreated(null);
    setSaving(false);
    onClose();
  };

  const start = async () => {
    setSaving(true);
    setBlockers([]);
    try {
      const intakeCase = await startIntakeFromReferral({ referral });
      setCreated(intakeCase);
      toast({ title: `Intake case ${intakeCase.case_number} opened`, description: 'The referral is now linked to this intake case.' });
      onCreated?.();
    } catch (error) {
      setBlockers(error.blockers?.length ? error.blockers : [error.message || 'Intake case could not be created.']);
    } finally {
      setSaving(false);
    }
  };

  const existingBlockers = created ? [] : referralIntakeBlockers(referral);

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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start intake from referral {referral?.referral_id}</DialogTitle>
        </DialogHeader>

        {created ? (
          <div className="space-y-3 text-sm">
            <p className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 font-semibold text-emerald-900">
              Intake case {created.case_number} created and linked to this referral.
            </p>
            <p className="text-xs text-muted-foreground">
              Continue in Intake Centre: complete eligibility, consents and documents, then approve and convert to a participant profile.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              A participant intake case will be created in Draft, carrying the details below. Nothing is sent to the person and no profile is created yet.
            </p>
            <div className="rounded-xl bg-muted/50 p-3 text-xs">
              {carried.length ? carried.map(([label, value]) => (
                <div key={label} className="flex gap-2 py-0.5">
                  <span className="w-32 shrink-0 font-semibold text-foreground/70">{label}</span>
                  <span className="min-w-0 whitespace-pre-wrap">{value}</span>
                </div>
              )) : <span className="text-muted-foreground">No details recorded on this referral yet.</span>}
            </div>
            {referral?.consent !== 'Consent given' && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Client consent is not recorded on this referral. Update the referral to “Consent given” before opening intake.
              </p>
            )}
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
          {created ? (
            <>
              <Button variant="outline" onClick={close}>Close</Button>
              <Button asChild>
                <Link to="/intake/participant"><ArrowRight className="h-4 w-4" />Open Intake Centre</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button onClick={start} disabled={saving || existingBlockers.length > 0}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Create intake case
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}