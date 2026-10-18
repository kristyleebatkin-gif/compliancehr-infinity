import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Timer } from 'lucide-react';
import { format } from 'date-fns';

// Aged receivables: outstanding invoices bucketed by days overdue,
// with one-click payment reminder emails.
const BUCKETS = [
  { key: 'current', label: 'Due soon', tone: 'bg-teal/10 text-teal' },
  { key: 'd30', label: '1–30 days overdue', tone: 'bg-warning/10 text-warning' },
  { key: 'd60', label: '31–60 days overdue', tone: 'bg-warning/10 text-warning' },
  { key: 'd90', label: '61–90 days overdue', tone: 'bg-danger/10 text-danger' },
  { key: 'd90plus', label: '90+ days overdue', tone: 'bg-danger/10 text-danger' },
];

const daysOverdue = (inv, today) => {
  if (!inv.due_date) return 0;
  const diff = Math.floor((today.getTime() - new Date(`${inv.due_date}T00:00:00`).getTime()) / 86400000);
  return diff;
};

export default function AgedReceivables({ invoices, onChanged }) {
  const { toast } = useToast();
  const [reminding, setReminding] = useState(null);
  const today = new Date();

  const outstanding = invoices.filter((inv) => inv.status !== 'Paid' && inv.status !== 'Draft');
  const bucketed = BUCKETS.map((bucket) => {
    const items = outstanding.filter((inv) => {
      const days = daysOverdue(inv, today);
      if (bucket.key === 'current') return days <= 0;
      if (bucket.key === 'd30') return days >= 1 && days <= 30;
      if (bucket.key === 'd60') return days >= 31 && days <= 60;
      if (bucket.key === 'd90') return days >= 61 && days <= 90;
      return days > 90;
    });
    return { ...bucket, items, total: items.reduce((sum, inv) => sum + (inv.amount || 0), 0) };
  });

  const overdueList = outstanding
    .filter((inv) => daysOverdue(inv, today) > 0)
    .sort((a, b) => daysOverdue(b, today) - daysOverdue(a, today));

  const remind = async (inv) => {
    if (!inv.client_email) {
      toast({ title: 'No email on this invoice', description: 'Add a Billed To email, then send the reminder.', variant: 'destructive' });
      return;
    }
    setReminding(inv.id);
    try {
      const res = await base44.functions.invoke('sendAppEmail', {
        to: inv.client_email,
        subject: `Payment reminder — Invoice ${inv.invoice_number}`,
        body: `Hi ${inv.client_name || 'there'},\n\nA friendly reminder that invoice ${inv.invoice_number} for ${(inv.amount || 0).toFixed(2)} was due on ${inv.due_date || 'an earlier date'} (${daysOverdue(inv, today)} days overdue).\n\nIf payment has already been made, please disregard this message. Otherwise, could you please arrange payment at your earliest convenience?\n\nKind regards,\nAccounts`,
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: 'Reminder sent', description: `Emailed to ${inv.client_email}.` });
    } catch (error) {
      toast({ title: 'Reminder failed', description: error.message, variant: 'destructive' });
    } finally {
      setReminding(null);
    }
  };

  if (outstanding.length === 0) {
    return (
      <Card className="gradient-brand-soft">
        <CardContent className="p-4 text-sm text-foreground/50">No outstanding invoices — aged receivables are all clear.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white"><Timer className="h-4 w-4" /></div>
          <div>
            <div className="font-bold font-display">Aged receivables</div>
            <div className="text-[11px] text-foreground/45">Outstanding money by how overdue it is</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {bucketed.map((bucket) => (
            <div key={bucket.key} className={`rounded-xl border border-border/60 p-3 ${bucket.tone}`}>
              <div className="text-lg font-bold leading-none text-foreground">${bucket.total.toLocaleString('en-AU', { maximumFractionDigits: 0 })}</div>
              <div className="mt-1 text-[11px] font-medium text-foreground/55">{bucket.items.length} invoice{bucket.items.length === 1 ? '' : 's'}</div>
              <div className="mt-1 text-[11px] font-semibold">{bucket.label}</div>
            </div>
          ))}
        </div>

        {overdueList.length > 0 && (
          <div className="mt-4 space-y-2">
            {overdueList.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {inv.invoice_number}{inv.client_name ? ` · ${inv.client_name}` : ''}
                  </div>
                  <div className="text-[11px] text-foreground/45">
                    Due {inv.due_date ? format(new Date(`${inv.due_date}T00:00:00`), 'd MMM yyyy') : '—'} · ${((inv.amount || 0)).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <Badge className={daysOverdue(inv, today) > 60 ? 'bg-danger/15 text-danger border-transparent' : 'bg-warning/15 text-warning border-transparent'}>
                  {daysOverdue(inv, today)} days overdue
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => remind(inv)}
                  disabled={reminding === inv.id}
                  className="shrink-0"
                >
                  {reminding === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Remind
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}