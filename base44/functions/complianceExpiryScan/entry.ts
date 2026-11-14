import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { MANAGEMENT_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';

// Roles allowed to trigger the org-wide compliance status scan (matches
// the manual scan UI access).
const ALLOWED_ROLES = [...MANAGEMENT_ROLES, 'Team Leader'];

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasAnyRole(user, ALLOWED_ROLES)) return Response.json({ error: 'Administrator access required' }, { status: 403 });

    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const todayStr = iso(today);
    const soonStr = iso(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));

    const classify = (expiry) => {
      if (!expiry) return null;
      if (expiry < todayStr) return 'Expired';
      if (expiry <= soonStr) return 'Expiring Soon';
      return 'Current';
    };

    const service = base44.asServiceRole;
    const scan = async (entityName) => {
      const page = await service.entities[entityName].filter(
        { expiry_date: { $exists: true, $ne: null } },
        { limit: 500 }
      );
      const updates = [];
      for (const rec of page.items) {
        if (rec.status === 'Archived' || rec.status === 'Revoked') continue;
        const next = classify(rec.expiry_date);
        if (next && rec.status !== next) updates.push({ id: rec.id, status: next });
      }
      if (updates.length) await service.entities[entityName].bulkUpdate(updates);
      return { checked: page.items.length, updated: updates.length };
    };

    const [documents, certificates] = await Promise.all([
      scan('EmployeeDocument'),
      scan('Certificate'),
    ]);

    return Response.json({ documents, certificates, as_of: todayStr });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});