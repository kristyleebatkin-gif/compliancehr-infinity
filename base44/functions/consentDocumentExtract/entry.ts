import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { CONSENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';
import { auDate, auTime } from '../../shared/reminders.ts';
import { recordParticipantAuthorisation } from '../../shared/participantAuthorisation.ts';

const TITLE = { sharing: 'Consent to share information', advocacy: 'Consent to act as an advocate', medication: 'Medication consent', audit: 'Audit consent' };
const PARTICIPANT_FIELDS = ['phone', 'address', 'date_of_birth', 'emergency_contact', 'emergency_contact_phone', 'ndis_number'];
const STAFF_FIELDS = ['phone', 'address', 'date_of_birth', 'emergency_contact', 'emergency_contact_phone'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const kind = body.entity_type === 'staff' ? 'staff' : 'participant';
    const profileId = String(body.profile_id || '');
    const documentId = String(body.document_id || '');
    const fileUri = String(body.file_uri || '');
    if (!profileId || !fileUri) return Response.json({ error: 'profile_id and file_uri are required' }, { status: 400 });

    const service = base44.asServiceRole;
    const Entity = kind === 'staff' ? service.entities.StaffProfile : service.entities.ParticipantProfile;
    const profile = await Entity.get(profileId);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
    if (!hasAnyRole(user, CONSENT_ROLES) && (profile.email || '') !== (user.email || '')) {
      return Response.json({ error: 'Consent access required' }, { status: 403 });
    }

    // The uploaded copy is kept in the vault document record; the profile entries below reference it.
    const documentEntity = kind === 'staff' ? 'EmployeeDocument' : 'ParticipantDocument';
    let documentTitle = '';
    if (documentId) {
      const doc = await service.entities[documentEntity].get(documentId).catch(() => null);
      documentTitle = doc?.title || doc?.document_type || '';
    }

    const { signed_url: signedUrl } = await service.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri });
    const extraction = await service.integrations.Core.InvokeLLM({
      prompt: `This is a document uploaded to the document hub of an Australian NDIS provider for ${kind === 'staff' ? 'an employee' : 'a participant'}${documentTitle ? ` (filed as "${documentTitle}")` : ''}. Read it and extract:
1. Whether it records any consent decision (audit consent to review records, consent to share information, consent to act as an advocate, or medication consent). List every consent type it covers and the decision recorded.
2. Who gave the consent (the person or representative signing), who is authorised (the person or organisation information may be shared with, who acts as advocate, or who may assist with medication), the scope authorised, and any stated reason or conditions.
3. Any personal details visible for the person: email, phone, address, date of birth, emergency contact name and phone, and NDIS number if present.
Leave fields blank when the document does not show them. Do not guess or invent values.`,
      file_urls: [signedUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          is_consent_document: { type: 'boolean' },
          consent_types: { type: 'array', items: { type: 'string', enum: ['audit', 'sharing', 'advocacy', 'medication'] } },
          consent_status: { type: 'string', enum: ['Consent received', 'Declined', 'Withdrawn'] },
          granted_by: { type: 'string' },
          authorised_person: { type: 'string' },
          scope: { type: 'string' },
          reason: { type: 'string' },
          person: { type: 'object', properties: { email: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, date_of_birth: { type: 'string' }, emergency_contact: { type: 'string' }, emergency_contact_phone: { type: 'string' }, ndis_number: { type: 'string' } } },
        },
        required: ['is_consent_document'],
      },
    });

    const now = new Date();
    const recordedBy = String(user.full_name || user.email || '').trim();
    const recordedDate = auDate(now);
    const recordedTime = auTime(now);
    const sourceNote = `source document "${documentTitle || 'uploaded file'}" kept in the ${kind === 'staff' ? 'employee' : 'participant'} document vault`;

    // Fill only currently-empty details so the accurate section completes itself.
    const filled = [];
    const fieldUpdates = {};
    for (const field of (kind === 'staff' ? STAFF_FIELDS : PARTICIPANT_FIELDS)) {
      const value = String(extraction?.person?.[field] || '').trim();
      if (value && !String(profile[field] || '').trim()) { fieldUpdates[field] = value; filled.push(field.replace(/_/g, ' ')); }
    }
    if (Object.keys(fieldUpdates).length) {
      fieldUpdates.change_log = [`${recordedDate} ${recordedTime} | Details extracted from uploaded document (${sourceNote}): filled ${filled.join(', ')}. Logged by ${recordedBy}.`, profile.change_log].filter(Boolean).join('\n');
      await Entity.update(profileId, fieldUpdates);
      await service.entities.AuditLog.create({ action: 'Details Extracted From Document', entity_type: kind === 'staff' ? 'StaffProfile' : 'ParticipantProfile', record_id: profileId, record_title: profile.full_name || '', performed_by: recordedBy, performed_by_user_id: user.id, performed_by_email: user.email, performed_by_role: user.role, profile_type: kind, details: fieldUpdates.change_log, timestamp: now.toISOString() });
    }

    const consentTypes = extraction?.is_consent_document ? (extraction.consent_types || []).filter((t) => ['audit', 'sharing', 'advocacy', 'medication'].includes(t)) : [];
    const status = ['Consent received', 'Declined', 'Withdrawn'].includes(extraction?.consent_status) ? extraction.consent_status : 'Consent received';
    let current = await Entity.get(profileId);

    for (const consentType of consentTypes) {
      const details = `${recordedDate} ${recordedTime} | ${TITLE[consentType]}: ${status}, extracted from uploaded document (${sourceNote}). Logged by ${recordedBy}. Given by: ${extraction?.granted_by || 'Not recorded'}. Authorised person: ${extraction?.authorised_person || 'Not recorded'}. Scope: ${extraction?.scope || 'Not recorded'}.${extraction?.reason ? ` Reason: ${extraction.reason}` : ''}`;
      if (kind === 'participant') {
        if (consentType === 'audit') {
          const consentValue = status === 'Consent received' ? 'Audit consent received' : 'Audit declined';
          await service.entities.ParticipantProfile.update(profileId, { audit_consent: consentValue, audit_consent_recorded_by: recordedBy, audit_consent_recorded_date: recordedDate, audit_consent_recorded_time: recordedTime, change_log: [details, current.change_log].filter(Boolean).join('\n') });
        } else {
          const response = await recordParticipantAuthorisation(base44, user, { participant_id: profileId, consent_type: consentType, status, granted_by: extraction?.granted_by || '', authorised_person: extraction?.authorised_person || '', scope: extraction?.scope || '', reason: extraction?.reason || '' }, current);
          if (!response.ok) return response;
        }
      } else {
        let received = [];
        try { received = JSON.parse(current.consents_received || '[]'); } catch { received = []; }
        if (!Array.isArray(received)) received = [];
        received.push({ type: consentType, status, granted_by: extraction?.granted_by || '', authorised_person: extraction?.authorised_person || '', scope: extraction?.scope || '', reason: extraction?.reason || '', recorded_by: recordedBy, recorded_by_user_id: user.id, recorded_date: recordedDate, recorded_time: recordedTime });
        await service.entities.StaffProfile.update(profileId, { consents_received: JSON.stringify(received), change_log: [details, current.change_log].filter(Boolean).join('\n') });
      }
      const logEntry = { action: 'Consent Extracted From Document', entity_type: kind === 'staff' ? 'StaffProfile' : 'ParticipantProfile', record_id: profileId, record_title: profile.full_name || '', performed_by: recordedBy, performed_by_user_id: user.id, performed_by_email: user.email, performed_by_role: user.role, profile_type: kind, change_reason: status, details, timestamp: now.toISOString() };
      if (consentType === 'audit') logEntry.audit_consent = status === 'Consent received' ? 'Audit consent received' : 'Audit declined';
      await service.entities.AuditLog.create(logEntry);
      current = await Entity.get(profileId);
    }

    // Note the extraction on the document copy itself.
    if (documentId) {
      const doc = await service.entities[documentEntity].get(documentId).catch(() => null);
      if (doc) {
        const summary = `Extracted into profile: ${consentTypes.length ? consentTypes.map((t) => TITLE[t]).join(', ') + ` (${status})` : 'no consent decision found'}${filled.length ? `; details filled: ${filled.join(', ')}` : ''}.`;
        await service.entities[documentEntity].update(documentId, { notes: [summary, doc.notes].filter(Boolean).join(' | ') });
      }
    }

    return Response.json({ ok: true, is_consent: consentTypes.length > 0, consent_types: consentTypes, filled_fields: filled });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}