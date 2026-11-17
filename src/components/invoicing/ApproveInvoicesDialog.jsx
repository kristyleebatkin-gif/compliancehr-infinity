import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchAllRecords } from '@/lib/csvExport';
import { logUserAction } from '@/lib/actionLog';
import { useRole } from '@/lib/useRole';
import { invoiceApprovalProblems, invoiceLineCount, approvalPatch, sumInvoices, formatAud } from '@/lib/invoiceApproval';

// Review every draft invoice, tick the ones to approve, then confirm.
// Approving does NOT email anything: it marks invoices ready to send and records who approved them.
export default function ApproveInvoicesDialog({ open, onOpenChange, onApproved }) {
  const { toast } = useToast();
  const { user } = useRole();
  const [drafts, setDrafts] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setDrafts(null);
    setLoadError('');
    setConfirming(false);
    fetchAllRecords(base44.entities.Invoice, { status: 'Draft' }, 'due_date')
      .then((rows) => {
        if (cancelled) return;
        setDrafts(rows);
        setSelected(new Set(rows.filter((inv) => invoiceApprovalProblems(inv).length === 0).map((inv) => inv.id)));
      })
      .catch((error) => { if (!cancelled) setLoadError(error?.message || 'Draft invoices could not be loaded.'); });
    return () => { cancelled = true; };
  }, [open]);

  const ready = useMemo(() => (drafts || []).filter((inv) => invoiceApprovalProblems(inv).length === 0), [drafts]);
  const blocked = useMemo(() => (drafts || []).filter((inv) => invoiceApprovalProblems(inv).length > 0), [drafts]);
  const chosen = useMemo(() => ready.filter((inv) => selected.has(inv.id)), [ready, selected]);
  const total = sumInvoices(chosen);

  const toggle = (id, on) => {
    setConfirming(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  };

  const approve = async () => {
    if (!chosen.length) return;
    setSaving(true);
    const approvedBy = user?.full_name || user?.email || 'Unknown user';
    const patch = approvalPatch(approvedBy);
    let done = 0;
    const failures = [];
    for (const inv of chosen) {
      try {
        // Re-check the live record so an invoice changed by someone else is not approved by mistake.
        const fresh = await base44.entities.Invoice.get(inv.id);
        const problems = invoiceApprovalProblems(fresh);
        if (problems.length) { failures.push(`${inv.invoice_number}: ${problems.join(', ')}`); continue; }
        await base44.entities.Invoice.update(inv.id, patch);
        done += 1;
        logUserAction('Approve', 'Invoice', {
          record_id: inv.id,
          record_title: inv.invoice_number,
          details: `Approved for sending (${formatAud(inv.amount)} to ${inv.client_name || inv.participant_name || 'biller'})`,
          previous_value: 'Draft',
          new_value: 'Approved',
          module: 'Invoicing',
        });
      } catch (error) {
        failures.push(`${inv.invoice_number}: ${error?.message || 'not saved'}`);
      }
    }
    setSaving(false);
    setConfirming(false);
    if (done) toast({ title: `${done} invoice${done === 1 ? '' : 's'} approved`, description: 'Nothing has been emailed yet. Send them from the Invoicing Centre.' });
    if (failures.length) toast({ title: `${failures.length} not approved`, description: failures.slice(0, 4).join(' · '), variant: 'destructive' });
    onApproved?.();
    if (!failures.length) onOpenChange(false);
    else {
      // Reload so the list shows what is still waiting.
      fetchAllRecords(base44.entities.Invoice, { status: 'Draft' }, 'due_date').then((rows) => {
        setDrafts(rows);
        setSelected(new Set(rows.filter((r) => invoiceApprovalProblems(r).length === 0).map((r) => r.id)));
      }).catch(() => {});
    }
  };

  const row = (inv, problems) => (
    <li key={inv.id} className="flex items-start gap-3 py-2.5">
      <Checkbox
        className="mt-0.5"
        checked={!problems.length && selected.has(inv.id)}
        disabled={problems.length > 0 || saving}
        onCheckedChange={(value) => toggle(inv.id, value === true)}
        aria-label={`Approve invoice ${inv.invoice_number}`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{inv.participant_name || inv.client_name || 'No participant'} <span className="font-normal text-muted-foreground">· {inv.invoice_number || 'no number'}</span></p>
        <p className="text-xs text-muted-foreground">
          Bill to {inv.client_name || '—'}{inv.client_email ? ` (${inv.client_email})` : ''} · due {inv.due_date || '—'} · {invoiceLineCount(inv)} line{invoiceLineCount(inv) === 1 ? '' : 's'}
        </p>
        {problems.length > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#B0126A]"><AlertTriangle className="h-3.5 w-3.5" />Fix before approving: {problems.join(', ')}</p>
        )}
      </div>
      <span className="shrink-0 text-sm font-bold tabular-nums">{formatAud(inv.amount)}</span>
    </li>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) onOpenChange(next); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review &amp; approve invoices</DialogTitle>
          <DialogDescription>Approving marks invoices as checked and ready to send. Nothing is emailed until you send them from the Invoicing Centre.</DialogDescription>
        </DialogHeader>

        {loadError ? (
          <p role="alert" className="rounded-lg border border-[#FF2E9A]/40 p-3 text-sm">Draft invoices could not be loaded: {loadError}</p>
        ) : !drafts ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : drafts.length === 0 ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4" />No draft invoices waiting for approval.</p>
        ) : (
          <div className="space-y-4">
            {ready.length > 0 && (
              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Ready to approve ({ready.length})</h3>
                  <div className="flex gap-2 text-xs">
                    <button type="button" className="font-semibold underline" disabled={saving} onClick={() => { setConfirming(false); setSelected(new Set(ready.map((i) => i.id))); }}>Tick all</button>
                    <button type="button" className="font-semibold underline" disabled={saving} onClick={() => { setConfirming(false); setSelected(new Set()); }}>Untick all</button>
                  </div>
                </div>
                <ul className="divide-y">{ready.map((inv) => row(inv, []))}</ul>
              </section>
            )}
            {blocked.length > 0 && (
              <section>
                <h3 className="text-sm font-bold">Needs fixing first ({blocked.length})</h3>
                <ul className="divide-y">{blocked.map((inv) => row(inv, invoiceApprovalProblems(inv)))}</ul>
              </section>
            )}

            <div className="sticky bottom-0 space-y-2 border-t bg-background pt-3">
              {confirming ? (
                <div role="alert" className="rounded-lg border border-[#5A00D6]/40 bg-[#F5F0FF] p-3 text-sm text-[#0A2B6D]">
                  Approve <strong>{chosen.length}</strong> invoice{chosen.length === 1 ? '' : 's'} totalling <strong>{formatAud(total)}</strong>? They will not be emailed yet.
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={approve} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Yes, approve</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirming(false)} disabled={saving}>Go back</Button>
                  </div>
                </div>
              ) : (
                <Button className="w-full" disabled={!chosen.length} onClick={() => setConfirming(true)}>
                  Approve {chosen.length} invoice{chosen.length === 1 ? '' : 's'} – {formatAud(total)}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
