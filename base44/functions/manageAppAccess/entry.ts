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
      const records = await service.entities.User.list();
      const isPending = (u) => !hasApprovedAccess(u) && !['Rejected', 'Suspended', 'Archived'].includes(u.account_status) && u.role !== 'Archived';
      const summary = (u) => ({ id: u.id, full_name: u.full_name, email: u.email, role: u.role, created_date: u.created_date, account_status: u.account_status, access_approved: hasApprovedAccess(u), approved_by: u.approved_by, requested_role: u.requested_role });
      const search = String(body.search || '').slice(0, 254).toLowerCase();
      const pendingUsers = records.filter(isPending).map(summary).sort((a, b) => String(a.created_date).localeCompare(String(b.created_date)));
      const users = records.filter((u) => !isPending(u) && `${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(search)).map(summary);
      return Response.json({ users, pending_users: pendingUsers, pending_count: pendingUsers.length });
    }
    if (body.action === 'invite') {
      let email = String(body.email || '').trim();
      let profile;
      if (body.profile_id) {
        if (!['staff', 'participant'].includes(body.kind) || typeof body.profile_id !== 'string') return Response.json({ error: 'Choose a valid profile.' }, { status: 400 });
        profile = await service.entities[body.kind === 'participant' ? 'ParticipantProfile' : 'StaffProfile'].get(body.profile_id);
        if (!profile) return Response.json({ error: 'Profile not found.' }, { status: 404 });
        email = String(profile.email || '').trim();
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return Response.json({ error: 'Save a valid email address on the profile first.' }, { status: 400 });
      await service.users.inviteUser(email, 'user');
      if (profile) {
        const previous = await service.entities.ProfilePortalInvitation.filter({ email, profile_id: profile.id, status: 'Pending' }, { limit: 1 });
        const invitation = { email, profile_id: profile.id, kind: body.kind, portal_role: body.kind === 'participant' ? 'Participant' : 'Employee', invited_by_id: actor.id, expires_at: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'Pending' };
        if (previous.items[0]) await service.entities.ProfilePortalInvitation.update(previous.items[0].id, invitation);
        else await service.entities.ProfilePortalInvitation.create(invitation);
      }
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