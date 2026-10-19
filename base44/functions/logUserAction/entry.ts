import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Records one staff/participant action in the admin audit trail (AuditLog).
// The caller's identity comes from their session, never from the payload.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role === 'Archived') return Response.json({ error: 'Archived account' }, { status: 403 });

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

    const record = await base44.asServiceRole.entities.AuditLog.create({
      action,
      entity_type: entityType,
      record_id: clean(body.record_id, 120),
      record_title: clean(body.record_title, 200),
      performed_by: clean(user.full_name, 200) || clean(user.email, 200) || 'Authenticated user',
      performed_by_user_id: user.id,
      performed_by_email: clean(user.email, 200),
      performed_by_role: clean(user.role, 120),
      route: clean(body.route, 200),
      details: clean(body.details, 1000),
      timestamp: new Date().toISOString(),
    });
    return Response.json({ success: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Log action failed' }, { status: 500 });
  }
}