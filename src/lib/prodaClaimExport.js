import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { parseLineItems, lineAmount } from '@/lib/ndisPriceGuide';

// PRODA/PACE-ready NDIS bulk-claim export: one row per support line item, claim columns per
// the NDIA bulk claim upload format. NDIS supports are GST-free (G0).
export function prodaClaimRows(invoices) {
  const rows = [];
  invoices.forEach((inv) => {
    const lines = parseLineItems(inv.line_items);
    const list = lines.length
      ? lines
      : [{ code: '', description: inv.description || 'Supports delivered', unit: '', qty: 1, unit_price: inv.subtotal || inv.amount || 0 }];
    list.forEach((line) => {
      rows.push({
        claim_reference: inv.invoice_number || '',
        participant_name: inv.participant_name || '',
        ndis_number: inv.ndis_number || '',
        service_date: inv.issue_date || '',
        support_item_code: line.code || '',
        support_item_description: line.description || '',
        unit: line.unit || '',
        quantity: line.qty ?? 1,
        unit_price: line.unit_price ?? '',
        claimed_amount: lineAmount(line),
        gst_code: 'G0 (GST-free)',
        biller_type: inv.biller_type || '',
        payment_status: inv.paid_date ? 'Paid' : (inv.status || ''),
      });
    });
  });
  return rows;
}

const COLUMNS = [
  { key: 'claim_reference', label: 'Claim Reference' },
  { key: 'participant_name', label: 'Participant Name' },
  { key: 'ndis_number', label: 'NDIS Number' },
  { key: 'service_date', label: 'Service Date' },
  { key: 'support_item_code', label: 'Support Item Code' },
  { key: 'support_item_description', label: 'Support Item Description' },
  { key: 'unit', label: 'Unit' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'unit_price', label: 'Unit Price' },
  { key: 'claimed_amount', label: 'Claimed Amount' },
  { key: 'gst_code', label: 'GST Code' },
  { key: 'biller_type', label: 'Biller Type' },
  { key: 'payment_status', label: 'Payment Status' },
];

// Only invoices that have been issued can be claimed. Drafts and approved-but-unsent invoices
// are never included, so an unchecked invoice cannot end up in a bulk claim to the NDIA.
export const PRODA_CLAIMABLE_STATUSES = ['Sent', 'Paid', 'Overdue'];

// Exports every issued invoice (uncapped via the cursor helper) as a PRODA/PACE bulk-claim file.
// Returns the number of invoices exported; no file is downloaded when there are none.
export default async function exportProdaClaims(entity) {
  const issued = await fetchAllRecords(entity, { status: { $in: PRODA_CLAIMABLE_STATUSES } }, '-issue_date');
  const claimable = issued.filter((inv) => PRODA_CLAIMABLE_STATUSES.includes(inv.status));
  if (!claimable.length) return 0;
  downloadCsv('NDIS-PRODA-Claims.csv', COLUMNS, prodaClaimRows(claimable));
  return claimable.length;
}