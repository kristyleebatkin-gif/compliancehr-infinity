import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { MANAGEMENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';

// Detailed activity log for one staff profile: every recorded action that
// belongs to this person — document updates (uploaded, updated, deleted,
// status changed) and compliance items marked complete (tasks, file
// checklist items, certificates, training). Read via the service role
// because AuditLog records link to a person through several fields, and
// callers are limited to management roles (plus auditors, matching the
// AuditLog read rules).
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasAnyRole(user, [...MANAGEMENT_ROLES, 'Auditor'])) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const profileId = String(body.profile_id || '').trim().slice(0, 120);
    if (!profileId) return Response.json({ error: 'profile_id is required' }, { status: 400 });
    const profileName = String(body.profile_name || '').trim().slice(0, 200);
    const profileEmail = String(body.profile_email || '').trim().slice(0, 200);

    const or = [
      { person_profile_id: profileId },
      { entity_type: 'StaffProfile', record_id: profileId },
    ];
    if (profileName) or.push({ person_profile_name: profileName });
    if (profileEmail) or.push({ person_profile_email: profileEmail });
    // Older entries link to the person only through their document records.
    try {
      const docPage = await base44.asServiceRole.entities.EmployeeDocument.filter(
        { employee_id: profileId },
        { limit: 500, fields: ['id'] },
      );
      const docIds = (docPage.items || []).map((d) => d.id).filter(Boolean);
      if (docIds.length) or.push({ entity_type: 'Employee Document', record_id: { $in: docIds } });
    } catch {
      // Document linkage is best-effort; the direct person matches still apply.
    }

    const page = await base44.asServiceRole.entities.AuditLog.filter(
      { $or: or },
      { sort: '-timestamp', limit: 300 },
    );
    return Response.json({ items: page.items || [] });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Activity log failed' }, { status: 500 });
  }
});