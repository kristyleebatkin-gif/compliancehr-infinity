import { base44 } from '@/api/base44Client';

/**
 * Automatic receipt filing: every receipt captured in the hub or scanner is
 * recorded in the Asset Register so purchases and their evidence are always
 * traceable for audits.
 */
export async function fileReceiptToAssetRegister(receipt, recordedBy = '') {
  try {
    const amount = receipt.amount != null ? `$${Number(receipt.amount).toFixed(2)}` : '';
    const parts = [
      receipt.merchant || '',
      amount,
      receipt.category || '',
      receipt.paid_by ? `Paid by ${receipt.paid_by}` : '',
      receipt.receipt_number ? `Receipt #${receipt.receipt_number}` : '',
    ].filter(Boolean);
    await base44.entities.Register.create({
      register_type: 'Asset Register',
      entry_title: `Receipt: ${receipt.description || 'Purchase'}`,
      entry_id: String(receipt.id || ''),
      description: parts.join(' - '),
      linked_entity_type: 'Receipt',
      linked_entity_id: String(receipt.id || ''),
      status: receipt.status || 'Unreconciled',
      recorded_date: receipt.date || new Date().toISOString().slice(0, 10),
      owner: recordedBy || receipt.paid_by || '',
    });
  } catch (error) {
    console.error('Asset Register filing failed', error);
  }
}