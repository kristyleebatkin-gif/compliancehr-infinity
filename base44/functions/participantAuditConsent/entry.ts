import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const CONSENT_VALUES = new Set(['Audit consent received', 'Audit declined']);

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const participantId = String(body.participant_id || '');
    const consent = String(body.consent || '');
    const reason = String(body.reason || '').trim();
    if (!participantId || !CONSENT_VALUES.has(consent)) {
      return Response.json({ error: 'participant_id and a valid consent value are required' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const profile = await service.entities.ParticipantProfile.get(participantId);
    if (!profile) return Response.json({ error: 'Participant not found' }, { status: 404 });

    const previous = profile.audit_consent || 'Audit declined';
    await service.entities.ParticipantProfile.update(participantId, { audit_consent: consent });

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
      change_reason: reason,
      details: `Participant audit consent set to "${consent}"${reason ? `. Reason: ${reason}` : ''}.`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ ok: true, consent, previous });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}