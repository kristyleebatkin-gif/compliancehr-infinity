// Invoice approval rules: Draft -> Approved -> Sent -> Paid (Overdue once a sent invoice passes its due date).
// "Approved" means checked and ready to go out. Only a successful email marks an invoice "Sent".
// Pure helpers (no SDK imports) so they can be unit tested.

export const INVOICE_STATUSES = ['Draft', 'Approved', 'Sent', 'Paid', 'Overdue'];

// Statuses a person can pick by hand from the status menu. "Approved" comes only from the
// review-and-approve screen and "Sent" only from a successful email.
export const MANUAL_INVOICE_STATUSES = ['Draft', 'Paid', 'Overdue'];

// Not yet issued to the biller: these must not be chased for payment or matched to bank lines.
export function isUnsentInvoice(invoice) {
  return invoice?.status === 'Draft' || invoice?.status === 'Approved';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function invoiceLineCount(invoice) {
  try {
    const lines = JSON.parse(invoice?.line_items || '[]');
    return Array.isArray(lines) ? lines.length : 0;
  } catch {
    return 0;
  }
}

// Reasons an invoice cannot be approved yet. An empty list means it can be approved.
export function invoiceApprovalProblems(invoice) {
  const problems = [];
  if (!invoice) return ['Invoice record is missing'];
  if (invoice.status !== 'Draft') problems.push(`Already ${String(invoice.status || 'processed').toLowerCase()}`);
  if (!String(invoice.invoice_number || '').trim()) problems.push('No invoice number');
  const email = String(invoice.client_email || '').trim();
  if (!email) problems.push('No billing email');
  else if (!EMAIL_PATTERN.test(email)) problems.push('Billing email looks wrong');
  const amount = Number(invoice.amount);
  if (!Number.isFinite(amount) || amount <= 0) problems.push('Total is $0 or missing');
  if (invoiceLineCount(invoice) === 0) problems.push('No line items');
  return problems;
}

export function approvalPatch(approvedBy, now = new Date()) {
  return { status: 'Approved', approved_by: approvedBy || 'Unknown user', approved_at: now.toISOString() };
}

export function sumInvoices(invoices) {
  return Math.round((invoices || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0) * 100) / 100;
}

export function formatAud(value) {
  return Number(value || 0).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
}

export function defaultInvoiceEmail(invoice, businessName) {
  const name = businessName || 'our business';
  return {
    to: String(invoice.client_email || '').trim(),
    subject: `Invoice ${invoice.invoice_number} from ${name}`,
    body: `Hi,\n\nPlease find attached invoice ${invoice.invoice_number} for NDIS supports delivered to ${invoice.participant_name || invoice.client_name || 'the participant'}.\n\nTotal due: $${Number(invoice.amount || 0).toFixed(2)}\nDue: ${invoice.due_date || ''}\n\nPayment details are included on the invoice.\n\nKind regards,\n${businessName || ''}`,
  };
}

// Sends approved invoices one at a time. Each invoice is marked Sent only after its own email
// succeeds; anything that fails stays Approved and is reported with the reason.
// deps: { sendEmail(payload) -> Promise, markSent(invoice, patch) -> Promise, buildAttachment(invoice) -> string|undefined, businessName, now }
export async function sendApprovedInvoices(invoices, deps) {
  const sent = [];
  const failed = [];
  for (const invoice of invoices || []) {
    if (invoice.status !== 'Approved') {
      failed.push({ invoice, reason: `Not approved (status ${invoice.status || 'unknown'})` });
      continue;
    }
    const email = defaultInvoiceEmail(invoice, deps.businessName);
    if (!email.to || !EMAIL_PATTERN.test(email.to)) {
      failed.push({ invoice, reason: 'No valid billing email' });
      continue;
    }
    try {
      const payload = { to: email.to, subject: email.subject, body: email.body };
      const content = deps.buildAttachment ? deps.buildAttachment(invoice) : undefined;
      if (content) payload.attachments = [{ filename: `Invoice-${invoice.invoice_number}.pdf`, content }];
      const res = await deps.sendEmail(payload);
      if (res?.data?.error) throw new Error(res.data.error);
      const patch = { status: 'Sent', sent_at: (deps.now ? deps.now() : new Date()).toISOString() };
      try {
        await deps.markSent(invoice, patch);
        sent.push(invoice);
      } catch (error) {
        // The email went out but the record did not update: report it so nobody re-sends blindly.
        failed.push({ invoice, reason: `Email sent but status not saved: ${error?.message || 'unknown error'}`, emailed: true });
      }
    } catch (error) {
      failed.push({ invoice, reason: error?.message || 'Email could not be sent' });
    }
  }
  return { sent, failed };
}
