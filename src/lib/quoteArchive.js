import { base44 } from '@/api/base44Client';
import { buildQuotePdf, quotePdfFilename } from '@/lib/quotePdf';
import { routeDocument } from '@/lib/documentRouting';

// Automated quote filing: generates the branded quote PDF, uploads it to the
// app's private storage, saves the copy on the quote record, and files a copy
// into the participant's client file when the quote is linked to one.
export async function archiveQuoteCopy(quote, business = {}) {
  const name = quotePdfFilename(quote);
  const blob = buildQuotePdf(quote, business).output('blob');
  const file = new File([blob], name, { type: 'application/pdf' });
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
  const today = new Date().toISOString().slice(0, 10);

  await base44.entities.Quote.update(quote.id, {
    pdf_file_uri: file_uri,
    pdf_file_name: name,
    pdf_generated_date: today,
  });

  const participantName = String(quote.participant_name || '').trim();
  if (participantName) {
    const matches = await base44.entities.ParticipantProfile.filter({ full_name: participantName }, { limit: 1 });
    const participant = matches.items?.[0];
    if (participant) {
      const user = await base44.auth.me().catch(() => null);
      const copyRecord = await base44.entities.FormsLibraryDocument.create({
        library: `participant-${participant.id}`,
        document_type: 'Quote',
        title: name,
        file_name: name,
        file_uri,
        uploaded_date: today,
        uploaded_by: user?.full_name || user?.email || '',
      });
      routeDocument(copyRecord, { person_name: participantName, person_type: 'Participant' });
    }
  }

  return { file_uri, name };
}