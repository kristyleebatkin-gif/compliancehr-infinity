import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Row, Pill, Empty, money } from '@/components/today/todayUi';
import ApproveInvoicesDialog from '@/components/invoicing/ApproveInvoicesDialog';

const TONE = { Draft: 'amber', Approved: 'green', Sent: 'blue', Paid: 'green', Overdue: 'pink' };

// Shows a preview of draft invoices. "Review & approve" opens every draft (not just the preview),
// with checks, a running total and a confirmation step. Approving never emails anything.
export default function InvoicesPanel({ invoices, totalDrafts, onRefresh }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const waiting = Number.isFinite(totalDrafts) ? totalDrafts : invoices.length;
  const hiddenCount = Math.max(0, waiting - Math.min(invoices.length, 4));

  return (
    <Panel
      title="Invoices ready"
      subtitle={`${waiting} awaiting approval`}
      action={<span className="t-muted text-[11.5px] font-bold">{invoices.length < waiting ? 'Newest shown' : money(invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0))}</span>}
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
          {hiddenCount > 0 && <p className="t-muted pt-2 text-[11px]">+ {hiddenCount} more in the review list</p>}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setReviewOpen(true)} disabled={!waiting} className="t-btn t-btn-primary flex-1 disabled:opacity-60">
          Review &amp; approve
        </button>
        <Link to="/invoicing" className="t-btn t-btn-ghost flex-1">
          Invoicing Centre
        </Link>
      </div>
      <ApproveInvoicesDialog open={reviewOpen} onOpenChange={setReviewOpen} onApproved={onRefresh} />
    </Panel>
  );
}
