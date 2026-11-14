import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { collectComplianceScore, canViewComplianceScore } from '../../shared/complianceScoreCalc.ts';

// Continuous compliance score: evidence is collected live from every connected
// register using server-side counts, never manual tick-and-flick.
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canViewComplianceScore(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const result = await collectComplianceScore(base44.asServiceRole);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});