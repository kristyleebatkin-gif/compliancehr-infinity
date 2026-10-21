import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { canManageAccess, hasApprovedAccess } from '../../shared/appAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    if (hasApprovedAccess(user) || ['Rejected', 'Suspended', 'Archived'].includes(user.account_status)) return Response.json({ changed: false });
    const entities = base44.asServiceRole.entities;
    const page = await entities.ProfilePortalInvitation.filter({ email: user.email, status: 'Pending', expires_at: { $gt: new Date().toISOString() } }, { limit: 2, sort: '-created_date' });
    if (!page.items.length) return Response.json({ changed: false });
    if (page.items.length > 1) return Response.json({ error: 'Ask management to resolve multiple profile invitations.' }, { status: 409 });
    const invite = page.items[0];
    if (!['staff', 'participant'].includes(invite.kind) || invite.portal_role !== (invite.kind === 'participant' ? 'Participant' : 'Employee')) return Response.json({ error: 'Invalid profile invitation.' }, { status: 403 });
    const [profile, inviter] = await Promise.all([
      entities[invite.kind === 'participant' ? 'ParticipantProfile' : 'StaffProfile'].get(invite.profile_id),
      entities.User.get(invite.invited_by_id),
    ]);
    if (!profile || profile.email !== user.email || !canManageAccess(inviter)) return Response.json({ error: 'This profile invitation is no longer available.' }, { status: 403 });
    const now = new Date().toISOString();
    await entities.User.update(user.id, { role: invite.portal_role, account_status: 'Active', access_approved: true, approved_by: inviter.full_name || inviter.email, approved_by_user_id: inviter.id, approved_date: now.slice(0, 10), approved_time: now.slice(11, 19) });
    await entities.ProfilePortalInvitation.update(invite.id, { status: 'Accepted' });
    return Response.json({ changed: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to link your profile invitation.' }, { status: 500 });
  }
}