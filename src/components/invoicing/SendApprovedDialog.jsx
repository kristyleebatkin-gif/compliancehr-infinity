import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { invoicePdfBase64 } from '@/lib/invoicePdf';
import { logUserAction } from '@/lib/actionLog';
import { sendApprovedInvoices, sumInvoices, formatAud } from '@/lib/invoiceApproval';

// Emails every approved invoice with its PDF, one at a time.
// Each invoice is marked Sent only after its own email succeeds; failures stay Approved.
export default function SendApprovedDialog({ open, onOpenChange, invoices, business, onChanged }) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const approved = (invoices || []).filter((inv) => inv.status === 'Approved');

  useEffect(() => { if (open) setResult(null); }, [open]);

  const sendAll = async () => {
    setSending(true);
    const outcome = await sendApprovedInvoices(approved, {
      businessName: business?.business_name,
      buildAttachment: (inv) => invoicePdfBase64(inv, business),
      sendEmail: (payload) => base44.functions.invoke('sendAppEmail', payload),
      markSent: async (inv, patch) => {
        await base44.entities.Invoice.update(inv.id, patch);
        logUserAction('Submit', 'Invoice', {
          record_id: inv.id,
          record_title: inv.invoice_number,
          details: `Emailed to ${inv.client_email} with PDF attached`,
          previous_value: 'Approved',
          new_value: 'Sent',
          module: 'Invoicing',
        });
      },
    });
    setSending(false);
    setResult(outcome);
    onChanged?.();
    if (outcome.sent.length) toast({ title: `${outcome.sent.length} invoice${outcome.sent.length === 1 ? '' : 's'} sent` });
    if (outcome.failed.length) toast({ title: `${outcome.failed.length} not sent`, description: 'See the list for reasons. They stay Approved.', variant: 'destructive' });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!sending) onOpenChange(next); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send approved invoices</DialogTitle>
          <DialogDescription>Each invoice is emailed to its billing address with the PDF attached. It is only marked Sent once its email goes through.</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 text-sm">
            {result.sent.length > 0 && <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{result.sent.length} sent</p>}
            {result.failed.length > 0 && (
              <div>
                <p className="flex items-center gap-2 font-semibold text-[#B0126A]"><AlertTriangle className="h-4 w-4" />{result.failed.length} not sent</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {result.failed.map(({ invoice, reason }) => <li key={invoice.id}>{invoice.invoice_number}: {reason}</li>)}
                </ul>
              </div>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : approved.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">No approved invoices waiting to be sent.</p>
        ) : (
          <div className="space-y-3">
            <ul className="divide-y text-sm">
              {approved.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{inv.invoice_number} · {inv.participant_name || inv.client_name}</p>
                    <p className="truncate text-xs text-muted-foreground">To {inv.client_email || 'no email'}{inv.approved_by ? ` · approved by ${inv.approved_by}` : ''}</p>
                  </div>
                  <span className="shrink-0 font-bold tabular-nums">{formatAud(inv.amount)}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={sendAll} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send {approved.length} invoice{approved.length === 1 ? '' : 's'} – {formatAud(sumInvoices(approved))}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
