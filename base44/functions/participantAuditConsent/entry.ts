import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { CONSENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';
import { auDate, auTime } from '../../shared/reminders.ts';
import { recordParticipantAuthorisation } from '../../shared/participantAuthorisation.ts';

const CONSENT_VALUES = new Set(['Audit consent received', 'Audit declined']);

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasAnyRole(user, CONSENT_ROLES)) {
      return Response.json({ error: 'Administrator access required' }, { status: 403 });
    }

    const body = await req.json();
    const participantId = String(body.participant_id || '');
    const consent = String(body.consent || '');
    const reason = String(body.reason || '').trim();
    if (!participantId || (body.consent_type && !['audit', 'sharing', 'advocacy'].includes(body.consent_type)) || ((!body.consent_type || body.consent_type === 'audit') && !CONSENT_VALUES.has(consent))) {
      return Response.json({ error: 'participant_id and a valid consent value are required' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const profile = await service.entities.ParticipantProfile.get(participantId);
    if (!profile) return Response.json({ error: 'Participant not found' }, { status: 404 });
    if (['sharing', 'advocacy'].includes(body.consent_type)) return await recordParticipantAuthorisation(base44, user, body, profile);

    const previous = profile.audit_consent || 'Audit declined';
    // Attribution is derived from the authenticated caller and the server clock,
    // never from the request body.
    const now = new Date();
    const recordedBy = String(user.full_name || user.email || '').trim();
    const recordedDate = auDate(now);
    const recordedTime = auTime(now);
    await service.entities.ParticipantProfile.update(participantId, {
      audit_consent: consent,
      audit_consent_recorded_by: recordedBy,
      audit_consent_recorded_date: recordedDate,
      audit_consent_recorded_time: recordedTime,
      change_log: [`${recordedDate} ${recordedTime} | Audit consent: ${previous} → ${consent}. Logged by ${recordedBy}.${reason ? ` Reason: ${reason}` : ''}`, profile.change_log].filter(Boolean).join('\n'),
    });

    await service.entities.AuditLog.create({
      action: 'Audit Consent Updated',
      entity_type: 'ParticipantProfile',
      record_id: participantId,
      record_title: profile.full_name || '',
      performed_by: user.full_name || '',
      performed_by_user_id: user.id || '',
      performed_by_email: user.email || '',
      performed_by_role: user.role || '',
      profile_type: 'participant',
      audit_consent: consent,
      previous_audit_consent: previous,
      recorded_by: recordedBy,
      recorded_date: recordedDate,
      recorded_time: recordedTime,
      change_reason: reason,
      details: `Participant audit consent set to "${consent}" by ${recordedBy} on ${recordedDate || 'not recorded'} at ${recordedTime || 'not recorded'}${reason ? `. Reason: ${reason}` : ''}.`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ ok: true, consent, previous });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}