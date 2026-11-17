import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INVOICE_STATUSES, MANUAL_INVOICE_STATUSES, isUnsentInvoice, invoiceApprovalProblems,
  approvalPatch, sumInvoices, sendApprovedInvoices,
} from '../src/lib/invoiceApproval.js';

const good = { id: '1', invoice_number: 'INV-1', status: 'Draft', client_email: 'pm@example.com', amount: 120.5, line_items: JSON.stringify([{ code: '01_011_0107_1_1' }]) };

test('status flow includes Approved between Draft and Sent', () => {
  assert.deepEqual(INVOICE_STATUSES, ['Draft', 'Approved', 'Sent', 'Paid', 'Overdue']);
});

test('Approved and Sent cannot be picked by hand', () => {
  assert.ok(!MANUAL_INVOICE_STATUSES.includes('Sent'));
  assert.ok(!MANUAL_INVOICE_STATUSES.includes('Approved'));
});

test('drafts and approved invoices count as unsent', () => {
  assert.equal(isUnsentInvoice({ status: 'Draft' }), true);
  assert.equal(isUnsentInvoice({ status: 'Approved' }), true);
  assert.equal(isUnsentInvoice({ status: 'Sent' }), false);
  assert.equal(isUnsentInvoice({ status: 'Overdue' }), false);
});

test('a complete draft has no approval problems', () => {
  assert.deepEqual(invoiceApprovalProblems(good), []);
});

test('missing email, zero total and no lines block approval', () => {
  assert.ok(invoiceApprovalProblems({ ...good, client_email: '' }).includes('No billing email'));
  assert.ok(invoiceApprovalProblems({ ...good, client_email: 'not-an-email' }).includes('Billing email looks wrong'));
  assert.ok(invoiceApprovalProblems({ ...good, amount: 0 }).includes('Total is $0 or missing'));
  assert.ok(invoiceApprovalProblems({ ...good, amount: undefined }).includes('Total is $0 or missing'));
  assert.ok(invoiceApprovalProblems({ ...good, line_items: '[]' }).includes('No line items'));
  assert.ok(invoiceApprovalProblems({ ...good, line_items: 'not json' }).includes('No line items'));
});

test('only drafts can be approved', () => {
  assert.ok(invoiceApprovalProblems({ ...good, status: 'Sent' }).length > 0);
  assert.ok(invoiceApprovalProblems(null).length > 0);
});

test('approval records who and when, and does not mark sent', () => {
  const patch = approvalPatch('Sherelle Dalton', new Date('2026-11-17T10:00:00Z'));
  assert.deepEqual(patch, { status: 'Approved', approved_by: 'Sherelle Dalton', approved_at: '2026-11-17T10:00:00.000Z' });
  assert.equal(patch.sent_at, undefined);
});

test('totals add up to the cent', () => {
  assert.equal(sumInvoices([{ amount: 0.1 }, { amount: 0.2 }, { amount: '10' }]), 10.3);
});

test('each invoice is marked Sent only after its own email succeeds', async () => {
  const approved = [
    { ...good, id: 'a', invoice_number: 'A', status: 'Approved' },
    { ...good, id: 'b', invoice_number: 'B', status: 'Approved', client_email: 'fail@example.com' },
    { ...good, id: 'c', invoice_number: 'C', status: 'Approved', client_email: '' },
    { ...good, id: 'd', invoice_number: 'D', status: 'Draft' },
  ];
  const marked = [];
  const emailed = [];
  const result = await sendApprovedInvoices(approved, {
    businessName: 'Choices North Queensland',
    now: () => new Date('2026-11-17T10:00:00Z'),
    sendEmail: async (payload) => {
      emailed.push(payload.to);
      if (payload.to === 'fail@example.com') return { data: { error: 'Mailbox unavailable' } };
      return { data: { ok: true } };
    },
    markSent: async (inv, patch) => { marked.push([inv.id, patch]); },
  });
  assert.deepEqual(result.sent.map((i) => i.id), ['a']);
  assert.deepEqual(marked, [['a', { status: 'Sent', sent_at: '2026-11-17T10:00:00.000Z' }]]);
  assert.deepEqual(emailed, ['pm@example.com', 'fail@example.com']);
  const reasons = Object.fromEntries(result.failed.map((f) => [f.invoice.id, f.reason]));
  assert.equal(reasons.b, 'Mailbox unavailable');
  assert.equal(reasons.c, 'No valid billing email');
  assert.match(reasons.d, /Not approved/);
});

test('an email that went out but failed to save is reported, not silently retried', async () => {
  const result = await sendApprovedInvoices([{ ...good, status: 'Approved' }], {
    sendEmail: async () => ({ data: {} }),
    markSent: async () => { throw new Error('network'); },
  });
  assert.equal(result.sent.length, 0);
  assert.equal(result.failed[0].emailed, true);
  assert.match(result.failed[0].reason, /Email sent but status not saved/);
});
