import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Panel, Row, Pill, Empty, money } from '@/components/today/todayUi';

const TONE = { Draft: 'amber', Sent: 'blue', Paid: 'green', Overdue: 'pink' };

export default function InvoicesPanel({ invoices, onRefresh }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const approveAll = async () => {
    if (!invoices.length) return;
    setSaving(true);
    try {
      await base44.entities.Invoice.bulkUpdate(invoices.map((invoice) => ({ id: invoice.id, status: 'Sent' })));
      toast({ title: 'Invoices approved', description: `${invoices.length} invoices marked as sent.` });
      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Approval not saved',
        description: error?.message || 'Open the Invoicing Centre to approve these invoices.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Invoices ready"
      subtitle={`${invoices.length} awaiting approval`}
      action={<span className="t-muted text-[11.5px] font-bold">{money(invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0))}</span>}
    >
      {invoices.length === 0 ? (
        <Empty>No invoices waiting for approval.</Empty>
      ) : (
        <div className="divide-y divide-[#0A2B6D]/6">
          {invoices.slice(0, 4).map((invoice) => (
            <Row key={invoice.id}>
              <div className="min-w-0 flex-1">
                <p className="t-title truncate text-[12.5px] font-bold">{invoice.client_name || invoice.participant_name || invoice.invoice_number}</p>
                <p className="t-muted mt-0.5 truncate text-[11px]">{invoice.invoice_number} · due {invoice.due_date || '—'}</p>
              </div>
              <span className="t-title text-[12px] font-extrabold">{money(invoice.amount)}</span>
              <Pill tone={TONE[invoice.status] || 'gray'}>{invoice.status}</Pill>
            </Row>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={approveAll} disabled={saving || !invoices.length} className="t-btn t-btn-primary flex-1 disabled:opacity-60">
          {saving ? 'Approving…' : 'Approve all'}
        </button>
        <Link to="/invoicing" className="t-btn t-btn-ghost flex-1">
          Review
        </Link>
      </div>
    </Panel>
  );
}