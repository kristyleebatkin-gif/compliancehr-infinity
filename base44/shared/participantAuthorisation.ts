import { auDate, auTime } from './reminders.ts';

export async function recordParticipantAuthorisation(base44, user, body, profile) {
  const type = body.consent_type;
  const title = type === 'sharing' ? 'Consent to share information' : 'Consent to act as an advocate';
  if (!['sharing', 'advocacy'].includes(type) || !['Consent received', 'Declined', 'Withdrawn'].includes(body.status)) {
    return Response.json({ error: 'A valid consent type and status are required' }, { status: 400 });
  }
  const fields = {};
  for (const key of ['granted_by', 'authorised_person', 'scope', 'reason']) {
    fields[key] = String(body[key] || '').trim();
    if (fields[key].length > (['scope', 'reason'].includes(key) ? 2000 : 200)) return Response.json({ error: 'Consent details are too long' }, { status: 400 });
  }
  if (body.status === 'Consent received' && (!fields.granted_by || !fields.authorised_person || !fields.scope)) {
    return Response.json({ error: 'Record who gave consent, the authorised person, and the scope before recording consent received' }, { status: 400 });
  }
  const now = new Date();
  const recordedBy = user.full_name || user.email;
  const date = auDate(now);
  const time = auTime(now);
  const entry = { ...fields, status: body.status, recorded_by: recordedBy, recorded_by_user_id: user.id, recorded_date: date, recorded_time: time };
  const previous = profile[`${type}_consent`]?.status || 'Not recorded';
  const details = `${date} ${time} | ${title}: ${previous} → ${body.status}. Logged by ${recordedBy}. Given by: ${fields.granted_by || 'Not recorded'}. Authorised person: ${fields.authorised_person || 'Not recorded'}. Scope: ${fields.scope || 'Not recorded'}. Reason: ${fields.reason || 'Not recorded'}.`;
  await base44.asServiceRole.entities.ParticipantProfile.update(profile.id, { [`${type}_consent`]: entry, change_log: [details, profile.change_log].filter(Boolean).join('\n') });
  await base44.asServiceRole.entities.AuditLog.create({ action: 'Participant Consent Updated', entity_type: 'ParticipantProfile', record_id: profile.id, record_title: profile.full_name, performed_by: recordedBy, performed_by_user_id: user.id, performed_by_email: user.email, performed_by_role: user.role, profile_type: 'participant', change_reason: fields.reason, details, timestamp: now.toISOString() });
  return Response.json({ ok: true, consent: entry });
}