// Central document routing: every document uploaded anywhere in the app is
// recorded on the Document Register and linked to the person it belongs to
// (participant, employee or the company safe). Upload sites call this once
// after saving the document; failures never block the upload itself.
import { base44 } from '@/api/base44Client';

const today = () => new Date().toISOString().slice(0, 10);

async function resolvePerson(library) {
  if (!library) return {};
  if (library.startsWith('participant-')) {
    const id = library.slice('participant-'.length);
    try {
      const rec = await base44.entities.ParticipantProfile.get(id);
      return { person_type: 'Participant', person_name: rec?.full_name || '', profile_id: id };
    } catch { return { person_type: 'Participant', profile_id: id }; }
  }
  if (library.startsWith('staff-')) {
    const id = library.slice('staff-'.length);
    try {
      const rec = await base44.entities.StaffProfile.get(id);
      return { person_type: 'Employee', person_name: rec?.full_name || '', profile_id: id };
    } catch { return { person_type: 'Employee', profile_id: id }; }
  }
  return { person_type: 'Company' };
}

export async function routeDocument(doc, options = {}) {
  if (!doc?.id) return;
  try {
    const fromLibrary = options.person_name ? {} : await resolvePerson(doc.library);
    const personName = options.person_name || fromLibrary.person_name || '';
    const personType = options.person_type || fromLibrary.person_type || 'Company';
    const profileId = fromLibrary.profile_id || '';
    const description = [
      doc.file_name || doc.title || '',
      personName,
      doc.uploaded_by || '',
    ].filter(Boolean).join(' - ');
    await base44.entities.Register.create({
      register_type: 'Document Register',
      entry_title: doc.document_type || doc.title || 'Document upload',
      entry_id: String(doc.id),
      description,
      linked_entity_type: options.source || 'FormsLibraryDocument',
      linked_entity_id: String(doc.id),
      status: 'Filed',
      recorded_date: doc.uploaded_date || today(),
      owner: personName || 'Company',
    });
    // Cross-link intake documents to a converted profile's register trail too.
    if (options.source === 'IntakeDocument' && profileId) return;
  } catch (e) {
    console.error('Document register routing failed', e);
  }
}

export async function routeDocumentBatch(docs, options = {}) {
  await Promise.allSettled((docs || []).map((doc) => routeDocument(doc, options)));
}