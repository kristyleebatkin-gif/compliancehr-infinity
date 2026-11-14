import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    if (!await base44.auth.isAuthenticated()) return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
    const user = await base44.auth.me();
    if (!user || ['Rejected', 'Archived', 'Suspended'].includes(user.account_status)) return Response.json({ error: 'Access denied.' }, { status: 403 });
    const { email } = JSON.parse(await req.text());
    if (typeof email !== 'string' || !email || email.length > 200) return Response.json({ items: [] });
    const canReview = ['admin', 'Provider Administrator', 'Management', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager'].includes(user.role);
    if (!canReview && email.toLowerCase() !== String(user.email).toLowerCase()) return Response.json({ error: 'Access denied.' }, { status: 403 });
    const page = await base44.asServiceRole.entities.DocumentAcknowledgement.filter({ acknowledged_by_email: email }, { sort: '-acknowledged_at', limit: 50 });
    return Response.json({ items: page.items });
  } catch (error) { return Response.json({ error: error.message || 'Unable to load acknowledgements.' }, { status: 400 }); }
});