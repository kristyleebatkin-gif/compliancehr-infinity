import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { MANAGEMENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';

const SCHEMA = {
  type: 'object',
  properties: {
    merchant: { type: 'string', description: 'Business or store name on the receipt' },
    receipt_date: { type: 'string', description: 'Receipt date as YYYY-MM-DD if readable' },
    total: { type: 'number', description: 'Total amount paid including GST' },
    gst_amount: { type: 'number', description: 'GST amount if shown, otherwise 0' },
    payment_method: { type: 'string', description: 'Card, cash, EFTPOS, bank transfer etc if shown' },
    category: { type: 'string', description: 'Expense category e.g. Office supplies, Fuel, Equipment, Training' },
    description: { type: 'string', description: 'One-line summary of what was purchased' },
    receipt_number: { type: 'string', description: 'Receipt or invoice number if shown' },
  },
  required: ['merchant', 'total'],
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const receiptId = String(body.receipt_id || '').trim();
    const requestedFileUri = String(body.file_uri || '').trim();
    if (!receiptId) return Response.json({ error: 'receipt_id is required' }, { status: 400 });

    // Resolve the receipt file through a caller-scoped Receipt read so entity RLS applies.
    const receipt = await base44.entities.Receipt.get(receiptId).catch(() => null);
    const storedFileUri = String(receipt?.file_uri || '').trim();
    if (!receipt || !storedFileUri) {
      return Response.json({ error: 'Receipt file not found' }, { status: 403 });
    }
    if (receipt.created_by_id && receipt.created_by_id !== user.id && !hasAnyRole(user, MANAGEMENT_ROLES)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (requestedFileUri && requestedFileUri !== storedFileUri) {
      return Response.json({ error: 'File URI does not match receipt record' }, { status: 403 });
    }
    if (/^https?:\/\//i.test(storedFileUri)) {
      return Response.json({ error: 'Only private receipt files may be scanned' }, { status: 400 });
    }

    const core = base44.asServiceRole.integrations.Core;
    const signed = await core.CreateFileSignedUrl({ file_uri: storedFileUri });
    const fileUrl = signed.signed_url;

    const result = await core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: SCHEMA,
    });

    if (result.status !== 'success' || !result.output) {
      return Response.json({ error: result.details || 'Could not read this receipt. Enter the details manually.' }, { status: 422 });
    }

    const output = Array.isArray(result.output) ? result.output[0] : result.output;
    return Response.json({
      merchant: output.merchant || '',
      date: output.receipt_date || '',
      amount: output.total ?? null,
      gst_amount: output.gst_amount ?? null,
      payment_method: output.payment_method || '',
      category: output.category || '',
      description: output.description || output.merchant || '',
      receipt_number: output.receipt_number || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}