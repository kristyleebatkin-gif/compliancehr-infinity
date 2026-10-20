import { base44 } from '@/api/base44Client';
import { buildInvoicePdf, invoicePdfFilename } from '@/lib/invoicePdf';
import { routeDocument } from '@/lib/documentRouting';

export default async function invoiceArchive(invoice, business = {}) {
  const current = await base44.entities.Invoice.get(invoice.id);
  const name = current.pdf_file_name || invoicePdfFilename(current);
  const today = new Date().toISOString().slice(0, 10);
  let uri = current.pdf_file_uri;
  if (!uri) {
    const file = new File([buildInvoicePdf(current, business).output('blob')], name, { type: 'application/pdf' });
    const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
    uri = uploaded.file_uri;
    await base44.entities.Invoice.update(current.id, { pdf_file_uri: uri, pdf_file_name: name, pdf_generated_date: today });
  }
  if (!current.pdf_library_document_id) {
    const user = await base44.auth.me();
    const library = current.participant_id ? `participant-${current.participant_id}` : 'company-invoices';
    const copy = await base44.entities.FormsLibraryDocument.create({
      library, document_type: 'Invoice', title: name, person_name: current.participant_name || current.client_name || '',
      file_name: name, file_uri: uri, uploaded_date: today, uploaded_by: user.full_name || user.email,
    });
    await base44.entities.Invoice.update(current.id, { pdf_library_document_id: copy.id });
    await routeDocument(copy, { person_name: current.participant_name || current.client_name || '', person_type: current.participant_id ? 'Participant' : 'Company' });
  }
  return { file_uri: uri, name };
}