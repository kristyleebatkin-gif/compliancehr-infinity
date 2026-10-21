import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { CONSENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';
import { auDate, auTime } from '../../shared/reminders.ts';

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
    const staffId = String(body.staff_id || '');
    const consent = String(body.consent || '');
    const reason = String(body.reason || '').trim();
    const consentType = String(body.consent_type || 'audit').trim();
    if (!['audit', 'sharing', 'advocacy', 'medication'].includes(consentType)) {
      return Response.json({ error: 'A valid consent type is required' }, { status: 400 });
    }
    if (consentType !== 'audit') {
      const status = String(body.status || '').trim();
      const fields = {};
      for (const key of ['granted_by', 'authorised_person', 'scope']) fields[key] = String(body[key] || '').trim();
      if (fields.granted_by.length > 200 || fields.authorised_person.length > 200 || fields.scope.length > 2000 || reason.length > 2000) {
        return Response.json({ error: 'Consent details are too long' }, { status: 400 });
      }
      if (!['Consent received', 'Declined', 'Withdrawn'].includes(status) || (status === 'Consent received' && (!fields.granted_by || !fields.authorised_person || !fields.scope))) {
        return Response.json({ error: 'Record who gave consent, the authorised person, and the scope before recording consent received' }, { status: 400 });
      }
      if (!staffId) return Response.json({ error: 'staff_id is required' }, { status: 400 });
      const service = base44.asServiceRole;
      const profile = await service.entities.StaffProfile.get(staffId);
      if (!profile) return Response.json({ error: 'Staff member not found' }, { status: 404 });
      const now = new Date();
      const recordedBy = String(user.full_name || user.email || '').trim();
      const recordedDate = auDate(now);
      const recordedTime = auTime(now);
      const title = ({ sharing: 'Consent to share information', advocacy: 'Consent to act as an advocate', medication: 'Medication consent' })[consentType];
      let received = [];
      try { received = JSON.parse(profile.consents_received || '[]'); } catch { received = []; }
      if (!Array.isArray(received)) received = [];
      received.push({ ...fields, type: consentType, status, recorded_by: recordedBy, recorded_by_user_id: user.id, recorded_date: recordedDate, recorded_time: recordedTime });
      const details = `${recordedDate} ${recordedTime} | ${title}: ${status}. Logged by ${recordedBy}. Given by: ${fields.granted_by || 'Not recorded'}. Authorised person: ${fields.authorised_person || 'Not recorded'}. Scope: ${fields.scope || 'Not recorded'}.${reason ? ` Reason: ${reason}` : ''}`;
      await service.entities.StaffProfile.update(staffId, {
        consents_received: JSON.stringify(received),
        change_log: [details, profile.change_log].filter(Boolean).join('\n'),
      });
      await service.entities.AuditLog.create({
        action: 'Staff Consent Updated', entity_type: 'StaffProfile', record_id: staffId, record_title: profile.full_name || '',
        performed_by: user.full_name || '', performed_by_user_id: user.id || '', performed_by_email: user.email || '', performed_by_role: user.role || '',
        profile_type: 'employee', change_reason: reason, details, timestamp: now.toISOString(),
      });
      return Response.json({ ok: true, consent: received[received.length - 1] });
    }
    if (!staffId || !CONSENT_VALUES.has(consent)) {
      return Response.json({ error: 'staff_id and a valid consent value are required' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const profile = await service.entities.StaffProfile.get(staffId);
    if (!profile) return Response.json({ error: 'Staff member not found' }, { status: 404 });

    const previous = profile.audit_consent || 'Audit declined';
    // Attribution is derived from the authenticated caller and the server clock,
    // never from the request body.
    const now = new Date();
    const recordedBy = String(user.full_name || user.email || '').trim();
    const recordedDate = auDate(now);
    const recordedTime = auTime(now);
    await service.entities.StaffProfile.update(staffId, {
      audit_consent: consent,
      audit_consent_recorded_by: recordedBy,
      audit_consent_recorded_date: recordedDate,
      audit_consent_recorded_time: recordedTime,
      change_log: [`${recordedDate} ${recordedTime} | Audit consent: ${previous} → ${consent}. Logged by ${recordedBy}.${reason ? ` Reason: ${reason}` : ''}`, profile.change_log].filter(Boolean).join('\n'),
    });

    await service.entities.AuditLog.create({
      action: 'Audit Consent Updated',
      entity_type: 'StaffProfile',
      record_id: staffId,
      record_title: profile.full_name || '',
      performed_by: user.full_name || '',
      performed_by_user_id: user.id || '',
      performed_by_email: user.email || '',
      performed_by_role: user.role || '',
      profile_type: 'employee',
      audit_consent: consent,
      previous_audit_consent: previous,
      recorded_by: recordedBy,
      recorded_date: recordedDate,
      recorded_time: recordedTime,
      change_reason: reason,
      details: `Staff audit consent set to "${consent}" by ${recordedBy} on ${recordedDate || 'not recorded'} at ${recordedTime || 'not recorded'}${reason ? `. Reason: ${reason}` : ''}.`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ ok: true, consent, previous });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}