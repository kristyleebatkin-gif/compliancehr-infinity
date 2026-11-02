import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { STAFF_SEND_ROLES, hasAnyRole, hasApprovedAccess } from '../../shared/systemAuth.ts';

// Logs one staff/participant action: always in the admin audit trail (AuditLog),
// and when the action belongs to a person, also on that person's profile change
// log so their profile stays up to date with the correct attribution.
//
// Trust boundaries: any authenticated non-archived user may log their own action
// to the central AuditLog (every entry carries the real caller's id/email/role).
// Writing to a person's profile change log is restricted to trusted staff roles,
// and the target profile is resolved AND updated through the caller-scoped
// client, so profile RLS decides who may touch which profile.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Active approved account access is required.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const clean = (value, max) => {
      const str = value == null ? '' : String(value).trim();
      return str.slice(0, max);
    };
    const action = clean(body.action, 80);
    const entityType = clean(body.entity_type, 80);
    if (!action || !entityType) {
      return Response.json({ error: 'action and entity_type are required' }, { status: 400 });
    }

    const stamp = new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short', hour12: false,
    }).format(new Date());
    const performedBy = clean(user.full_name, 200) || clean(user.email, 200) || 'Authenticated user';

    // The person fields are stored on the central log too, so each staff
    // profile's activity log can query everything logged against that person.
    const person = body.person || {};

    const record = await base44.asServiceRole.entities.AuditLog.create({
      action,
      entity_type: entityType,
      record_id: clean(body.record_id, 120),
      record_title: clean(body.record_title, 200),
      performed_by: performedBy,
      performed_by_user_id: user.id,
      performed_by_email: clean(user.email, 200),
      performed_by_role: clean(user.role, 120),
      route: clean(body.route, 200),
      details: clean(body.details, 1000),
      timestamp: new Date().toISOString(),
      person_profile_id: clean(person.profile_id, 120),
      person_profile_name: clean(person.profile_name, 200),
      person_profile_email: clean(person.profile_email, 200),
    });

    // Append to the correct person's profile only, resolved by id, then email, then
    // name — through the caller-scoped client so profile RLS authorizes the target.
    let profileUpdated = false;
    const isParticipant = person.profile_type === 'participant';
    // Low-trust roles (Participant, Auditor, Volunteer, etc.) must never write into
    // anyone's profile change log — forged audit history is the exact attack this guards.
    const entity = hasAnyRole(user, STAFF_SEND_ROLES)
      ? base44.entities[isParticipant ? 'ParticipantProfile' : 'StaffProfile']
      : null;
    try {
      if (!entity) throw new Error('Role not permitted to update profile change logs');
      let target = null;
      const profileId = clean(person.profile_id, 120);
      const profileEmail = clean(person.profile_email, 200);
      const profileName = clean(person.profile_name, 200);
      if (profileId) target = await entity.get(profileId);
      if (!target && profileEmail) {
        const page = await entity.filter({ email: profileEmail }, { limit: 1 });
        target = (page.items || [])[0] || null;
      }
      if (!target && profileName) {
        const page = await entity.filter({ full_name: profileName }, { limit: 1 });
        target = (page.items || [])[0] || null;
      }
      if (target) {
        const recordTitle = clean(body.record_title, 200);
        const line = `${stamp} | ${action}${recordTitle ? `: ${recordTitle}` : ''} | by ${performedBy}${user.role ? ` (${user.role})` : ''}`;
        const change_log = [target.change_log, line].filter(Boolean).join('\n').slice(-4000);
        await entity.update(target.id, { change_log });
        profileUpdated = true;
      }
    } catch (e) {
      console.error('Profile activity append failed:', e);
    }

    return Response.json({ success: true, id: record.id, profile_updated: profileUpdated });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Log action failed' }, { status: 500 });
  }
}