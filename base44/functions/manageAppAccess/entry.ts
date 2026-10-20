import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { ACCESS_ROLES, canManageAccess, hasApprovedAccess } from '../../shared/appAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const actor = await base44.auth.me();
    if (!actor) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    if (!canManageAccess(actor)) return Response.json({ error: 'Approved management access is required.' }, { status: 403 });
    const body = await req.json();
    const service = base44.asServiceRole;
    if (body.action === 'list') {
      const users = await service.entities.User.list();
      return Response.json({ users: users.map((u) => ({ id: u.id, full_name: u.full_name, email: u.email, role: u.role, created_date: u.created_date, account_status: u.account_status, access_approved: hasApprovedAccess(u), approved_by: u.approved_by, requested_role: u.requested_role })) });
    }
    if (body.action === 'invite') {
      const email = String(body.email || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
      await service.users.inviteUser(email, 'user');
      return Response.json({ ok: true });
    }
    if (!['approve', 'reject', 'suspend', 'role'].includes(body.action) || typeof body.user_id !== 'string') return Response.json({ error: 'Invalid access decision.' }, { status: 400 });
    if (body.user_id === actor.id) return Response.json({ error: 'Another manager must change your access.' }, { status: 403 });
    const target = await service.entities.User.get(body.user_id);
    if (!target) return Response.json({ error: 'User not found.' }, { status: 404 });
    if (target.role === 'admin') return Response.json({ error: 'The platform administrator account cannot be changed here.' }, { status: 403 });
    const now = new Date();
    const patch = { approved_by: actor.full_name || actor.email, approved_by_user_id: actor.id, approved_date: now.toISOString().slice(0, 10), approved_time: now.toISOString().slice(11, 19) };
    if (body.action === 'approve' || body.action === 'role') {
      if (!ACCESS_ROLES.includes(body.role)) return Response.json({ error: 'Choose one of the six approved roles.' }, { status: 400 });
      if (body.action === 'role' && !hasApprovedAccess(target)) return Response.json({ error: 'Approve the account before changing its active role.' }, { status: 400 });
      Object.assign(patch, { role: body.role, account_status: 'Active', access_approved: true });
    } else {
      Object.assign(patch, { account_status: body.action === 'reject' ? 'Rejected' : 'Suspended', access_approved: false });
    }
    await service.entities.User.update(target.id, patch);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to update account access.' }, { status: 500 });
  }
}