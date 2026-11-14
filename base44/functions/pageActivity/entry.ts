import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

const ALLOWED_ROUTES = [
  '/dashboard', '/participants', '/staff', '/training', '/compliance', '/incidents',
  '/risks', '/audit-centre', '/documents', '/feedback', '/tasks', '/certificates',
  '/complaints', '/surveys', '/audit', '/quality', '/forms', '/communications',
  '/intake', '/assets', '/goals', '/users', '/portal', '/safety-insights', '/assistant',
  '/shifts', '/checklists', '/emergency-response', '/information-consents', '/manual', '/receipts', '/equipment-manuals', '/insurance-finance',
  '/programs', '/events', '/ndis-news', '/weather', '/key-contacts', '/volunteering-placements', '/whats-on',
];

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role === 'Archived') return Response.json({ error: 'Archived account' }, { status: 403 });
    const body = await req.json();
    const eventType = body.event_type === 'Sign Out' ? 'Sign Out' : 'View';
    const route = eventType === 'Sign Out' ? '/sign-out' : String(body.route || '');
    // Health-check diagnostic ping from the System Health panel.
    if (body.action === 'health-check') {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'Health Check',
        entity_type: 'System Diagnostics',
        record_title: 'Automations & backend services check',
        route: '/help',
        performed_by: user.full_name || user.email || 'Authenticated user',
        performed_by_user_id: user.id,
        performed_by_email: user.email || '',
        performed_by_role: user.role || '',
        details: 'System health check verified backend connectivity',
        timestamp: new Date().toISOString(),
      });
      return Response.json({ success: true });
    }
    if (eventType === 'View' && !ALLOWED_ROUTES.some((allowed) => route === allowed || route.startsWith(`${allowed}/`))) {
      return Response.json({ error: 'Unsupported app route' }, { status: 400 });
    }
    const record = await base44.asServiceRole.entities.AuditLog.create({
      action: eventType,
      entity_type: eventType === 'View' ? 'App Page' : 'User Session',
      record_title: route,
      route,
      performed_by: user.full_name || user.email || 'Authenticated user',
      performed_by_user_id: user.id,
      performed_by_email: user.email || '',
      performed_by_role: user.role || '',
      details: eventType === 'View' ? 'Page viewed' : 'User signed out',
      timestamp: new Date().toISOString(),
    });
    return Response.json({ success: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Page activity failed' }, { status: 500 });
  }
});