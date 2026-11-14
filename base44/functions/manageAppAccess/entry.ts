// User Administration (backlog P0 17.07): every change to who can use the app goes through here.
//
// Rules, all checked on the server:
//   - only approved owner / Provider Administrator / Management accounts can manage access
//   - nobody changes their own access, and the owner account cannot be changed here
//   - senior roles (Provider Administrator, Compliance Administrator, Management) can only be given,
//     changed or suspended by the owner or a Provider Administrator
//   - a first sign-in is linked to this business only if this business invited that email
//     (the owner can also link people who signed up on their own)
//   - each person's business membership is kept in step with their account
//   - every change is written to the activity log
//
// Actions (POST body; the page always sends tenant_id so the owner acts for one business):
//   list { search? }                         invite { email, role } | { kind, profile_id }
//   approve { user_id, role }                reject { user_id }
//   role { user_id, role }                   suspend { user_id, reason? }
//   reactivate { user_id, role? }            cancel_invite { id }
import { perBusiness, createScopedClientFromRequest, accountDirectoryFromRequest, SCOPE_HEADER } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, canManageAccess, canGrantRole, ASSIGNABLE_ROLES, SENIOR_ROLES } from '../../shared/roleMatrix.ts';

const INVITE_DAYS = 14;
const items = (page: any) => (Array.isArray(page) ? page : page?.items || []);
const lower = (v: unknown) => String(v ?? '').trim().toLowerCase();
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const json = (body: unknown, status = 200) => Response.json(body, { status });
const isOwnerOrPA = (role: string) => role === 'admin' || role === 'Provider Administrator';

export function isPending(u: any) {
  return !hasApprovedAccess(u) && !['Rejected', 'Suspended', 'Archived'].includes(u?.account_status) && u?.role !== 'Archived';
}

type Ctx = { client: any; directory: any; tenantId: string; now?: Date };

export async function handleAccess(ctx: Ctx, body: any): Promise<Response> {
  const now = ctx.now || new Date();
  const today = now.toISOString().slice(0, 10);
  const actor = await ctx.client.auth.me();
  if (!actor) return json({ error: 'Please sign in.' }, 401);
  if (!canManageAccess(actor)) return json({ error: 'Approved management access is required.' }, 403);
  const svc = ctx.client.asServiceRole;
  const E = svc.entities;
  const who = actor.full_name || actor.email || 'A manager';
  const action = String(body?.action || '');

  const audit = (title: string, target: any, details: Record<string, unknown>) =>
    E.AuditLog.create({
      action: title, entity_type: 'User', record_id: target?.id || '', record_title: target?.email || target?.full_name || '',
      performed_by: who, performed_by_user_id: actor.id, performed_by_email: actor.email || '', performed_by_role: actor.role,
      details: JSON.stringify(details).slice(0, 4000), timestamp: now.toISOString(),
    });

  const membershipOf = async (userId: string) => items(await E.TenantMembership.filter({ user_id: userId }))[0] || null;
  const syncMembership = async (user: any, fields: Record<string, unknown>) => {
    const existing = await membershipOf(user.id);
    if (existing) return E.TenantMembership.update(existing.id, fields);
    return E.TenantMembership.create({
      organisation_id: ctx.tenantId, user_id: user.id, user_email: user.email || '', starts_on: today,
      invited_by_user_id: actor.id, membership_role: 'Employee', status: 'Active', ...fields,
    });
  };
  const pendingInvites = async () => {
    const own = items(await E.AccountInvitation.filter({ status: 'Pending' }));
    const portal = items(await E.ProfilePortalInvitation.filter({ status: 'Pending' }));
    const byEmail = new Map<string, any>();
    for (const p of portal) byEmail.set(lower(p.email), { role: p.portal_role, invited_by_name: '', source: 'profile' });
    for (const i of own) byEmail.set(lower(i.email), { id: i.id, role: i.role, invited_by_name: i.invited_by_name, expires_at: i.expires_at, source: 'invite' });
    return { own, byEmail };
  };
  const closeInvites = async (email: string, status: string, userId = '') => {
    for (const i of items(await E.AccountInvitation.filter({ status: 'Pending' }))) {
      if (lower(i.email) === lower(email)) await E.AccountInvitation.update(i.id, { status, decided_at: now.toISOString(), decided_by_name: who, user_id: userId });
    }
    for (const p of items(await E.ProfilePortalInvitation.filter({ status: 'Pending' }))) {
      if (lower(p.email) === lower(email) && status === 'Accepted') await E.ProfilePortalInvitation.update(p.id, { status: 'Accepted' });
    }
  };
  const summary = (u: any, membership: any, extra: Record<string, unknown> = {}) => ({
    id: u.id, full_name: u.full_name, email: u.email, role: u.role, previous_role: u.previous_role || null,
    created_date: u.created_date, account_status: u.account_status || null, access_approved: hasApprovedAccess(u),
    approved_by: u.approved_by || null, approved_date: u.approved_date || null, requested_role: u.requested_role || null,
    membership: membership ? { role: membership.membership_role, status: membership.status } : null,
    senior: SENIOR_ROLES.includes(u.role) || SENIOR_ROLES.includes(u.previous_role), ...extra,
  });

  if (action === 'list') {
    const search = lower(body.search).slice(0, 254);
    const linked = items(await E.User.list());
    const members = new Map(items(await E.TenantMembership.list()).map((m: any) => [m.user_id, m]));
    const { own, byEmail } = await pendingInvites();
    const unlinked = (await ctx.directory.unlinked()).filter((u: any) => u.account_status !== 'Rejected');
    const visibleUnlinked = unlinked.filter((u: any) => byEmail.has(lower(u.email)) || actor.role === 'admin');
    const pending_users = [
      ...linked.filter(isPending).map((u: any) => summary(u, members.get(u.id), { linked: true, invitation: byEmail.get(lower(u.email)) || null })),
      ...visibleUnlinked.map((u: any) => summary(u, null, { linked: false, invitation: byEmail.get(lower(u.email)) || null })),
    ].sort((a, b) => String(a.created_date).localeCompare(String(b.created_date)));
    const users = linked
      .filter((u: any) => !isPending(u) && `${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(search))
      .map((u: any) => {
        const m = members.get(u.id);
        const expected = hasApprovedAccess(u) ? 'Active' : u.account_status === 'Suspended' ? 'Suspended' : null;
        const out_of_step = Boolean(expected && (!m || m.status !== expected || (expected === 'Active' && m.membership_role !== u.role && u.role !== 'admin')));
        return summary(u, m, { linked: true, out_of_step });
      });
    const signedIn = new Set([...linked, ...unlinked].map((u: any) => lower(u.email)));
    const invitations = own
      .filter((i: any) => !signedIn.has(lower(i.email)))
      .map((i: any) => ({ id: i.id, email: i.email, role: i.role, invited_by_name: i.invited_by_name, expires_at: i.expires_at, expired: String(i.expires_at) < now.toISOString() }));
    return json({
      users, pending_users, pending_count: pending_users.length, invitations,
      grantable_roles: ASSIGNABLE_ROLES.filter((r) => canGrantRole(actor.role, r)),
      is_owner: actor.role === 'admin',
    });
  }

  if (action === 'invite') {
    let email = String(body.email || '').trim();
    let role = String(body.role || 'Employee');
    let profile: any = null;
    if (body.profile_id) {
      if (!['staff', 'participant'].includes(body.kind) || typeof body.profile_id !== 'string') return json({ error: 'Choose a valid profile.' }, 400);
      profile = await E[body.kind === 'participant' ? 'ParticipantProfile' : 'StaffProfile'].get(body.profile_id);
      if (!profile) return json({ error: 'Profile not found.' }, 404);
      email = String(profile.email || '').trim();
      role = body.kind === 'participant' ? 'Participant' : 'Employee';
    }
    if (!VALID_EMAIL.test(email) || email.length > 254) return json({ error: profile ? 'Save a valid email address on the profile first.' : 'Enter a valid email address.' }, 400);
    if (!canGrantRole(actor.role, role)) return json({ error: `You can't invite someone as ${role}.` }, 403);
    const status = await ctx.directory.emailStatus(email);
    if (status === 'here') return json({ error: 'This person already has an account in this business.' }, 409);
    if (status === 'elsewhere') return json({ error: 'This email is already used by an account in another business. Ask them for a different email address.' }, 409);
    if (status === 'none') await svc.users.inviteUser(email, 'user');
    const expires_at = new Date(now.getTime() + INVITE_DAYS * 86400000).toISOString();
    const invite = { email, role, invited_by_id: actor.id, invited_by_name: who, expires_at, status: 'Pending' };
    const existing = items(await E.AccountInvitation.filter({ status: 'Pending' })).find((i: any) => lower(i.email) === lower(email));
    if (existing) await E.AccountInvitation.update(existing.id, invite);
    else await E.AccountInvitation.create(invite);
    if (profile) {
      const previous = items(await E.ProfilePortalInvitation.filter({ email, profile_id: profile.id, status: 'Pending' }))[0];
      const portal = { email, profile_id: profile.id, kind: body.kind, portal_role: role, invited_by_id: actor.id, expires_at, status: 'Pending' };
      if (previous) await E.ProfilePortalInvitation.update(previous.id, portal);
      else await E.ProfilePortalInvitation.create(portal);
    }
    await audit('Access: invited', { email }, { role, already_signed_up: status === 'unlinked', from_profile: Boolean(profile) });
    return json({ ok: true, already_signed_up: status === 'unlinked' });
  }

  if (action === 'cancel_invite') {
    const invite = typeof body.id === 'string' ? await E.AccountInvitation.get(body.id) : null;
    if (!invite) return json({ error: 'Invitation not found.' }, 404);
    if (invite.status !== 'Pending') return json({ error: 'This invitation is no longer waiting.' }, 409);
    await E.AccountInvitation.update(invite.id, { status: 'Cancelled', decided_at: now.toISOString(), decided_by_name: who });
    await audit('Access: invitation cancelled', { email: invite.email }, { role: invite.role });
    return json({ ok: true });
  }

  if (!['approve', 'reject', 'role', 'suspend', 'reactivate'].includes(action) || typeof body.user_id !== 'string') {
    return json({ error: 'Invalid access decision.' }, 400);
  }
  if (body.user_id === actor.id) return json({ error: 'Another manager must change your access.' }, 403);

  const target = await E.User.get(body.user_id);
  const stranger = target ? null : await ctx.directory.getUnlinked(body.user_id);
  if (!target && !stranger) return json({ error: 'User not found.' }, 404);
  const person = { ...(target || stranger) }; // a copy, so the log records the account as it was before the change
  if (person.role === 'admin') return json({ error: 'The owner account cannot be changed here.' }, 403);
  const touchesSenior = SENIOR_ROLES.includes(person.role) || SENIOR_ROLES.includes(person.previous_role);
  if (touchesSenior && !isOwnerOrPA(actor.role)) return json({ error: 'Only the owner or a Provider Administrator can change a senior account.' }, 403);
  const stamp = { approved_by: who, approved_by_user_id: actor.id, approved_date: today, approved_time: now.toISOString().slice(11, 19) };

  if (action === 'approve') {
    const role = String(body.role || '');
    if (!canGrantRole(actor.role, role)) return json({ error: ASSIGNABLE_ROLES.includes(role) ? `You can't give the ${role} role.` : 'Choose one of the listed roles.' }, ASSIGNABLE_ROLES.includes(role) ? 403 : 400);
    if (hasApprovedAccess(person)) return json({ error: 'This account is already approved.' }, 409);
    const patch = { ...stamp, role, account_status: 'Active', access_approved: true };
    if (stranger) {
      const { byEmail } = await pendingInvites();
      if (!byEmail.has(lower(stranger.email)) && actor.role !== 'admin') return json({ error: 'Invite this person from this business before approving them.' }, 403);
      await ctx.directory.link(stranger.id, patch);
    } else {
      await E.User.update(person.id, patch);
    }
    await syncMembership(person, { membership_role: role, status: 'Active' });
    await closeInvites(person.email, 'Accepted', person.id);
    await audit('Access: approved', person, { role, linked_to_business: Boolean(stranger) });
    return json({ ok: true });
  }

  if (action === 'reject') {
    if (!isPending(person)) return json({ error: 'Only accounts waiting for approval can be turned away.' }, 409);
    if (stranger) {
      await closeInvites(stranger.email, 'Declined');
      if (actor.role === 'admin') await ctx.directory.updateUnlinked(stranger.id, { account_status: 'Rejected', access_approved: false });
    } else {
      await E.User.update(person.id, { ...stamp, role: 'Archived', account_status: 'Rejected', access_approved: false });
      const m = await membershipOf(person.id);
      if (m) await E.TenantMembership.update(m.id, { status: 'Ended', ends_on: today });
      await closeInvites(person.email, 'Declined');
    }
    await audit('Access: turned away', person, {});
    return json({ ok: true });
  }

  // role, suspend and reactivate only apply to people already in this business.
  if (stranger) return json({ error: 'Approve this person first.' }, 409);

  if (action === 'role') {
    const role = String(body.role || '');
    if (!hasApprovedAccess(person)) return json({ error: 'Approve or reactivate the account before changing its role.' }, 409);
    if (!canGrantRole(actor.role, role)) return json({ error: ASSIGNABLE_ROLES.includes(role) ? `You can't give the ${role} role.` : 'Choose one of the listed roles.' }, ASSIGNABLE_ROLES.includes(role) ? 403 : 400);
    if (role === person.role) return json({ ok: true, unchanged: true });
    await E.User.update(person.id, { ...stamp, role, previous_role: person.role });
    await syncMembership(person, { membership_role: role, status: 'Active' });
    await audit('Access: role changed', person, { from: person.role, to: role });
    return json({ ok: true });
  }

  if (action === 'suspend') {
    if (!hasApprovedAccess(person)) return json({ error: 'Only active accounts can be suspended.' }, 409);
    const reason = String(body.reason || '').trim().slice(0, 500);
    await E.User.update(person.id, {
      previous_role: person.role, role: 'Archived', account_status: 'Suspended', access_approved: false,
      archived_date: today, archived_time: now.toISOString().slice(11, 19), archive_reason: reason,
    });
    await syncMembership(person, { status: 'Suspended' });
    await audit('Access: suspended', person, { role: person.role, reason });
    return json({ ok: true });
  }

  // reactivate
  if (person.account_status !== 'Suspended') return json({ error: 'Only suspended accounts can be reactivated.' }, 409);
  const role = String(body.role || person.previous_role || '');
  if (!canGrantRole(actor.role, role)) return json({ error: 'Choose a role to reactivate this account with.' }, ASSIGNABLE_ROLES.includes(role) ? 403 : 400);
  await E.User.update(person.id, { ...stamp, role, account_status: 'Active', access_approved: true, archive_reason: '' });
  await syncMembership(person, { membership_role: role, status: 'Active', ends_on: null });
  await audit('Access: reactivated', person, { role });
  return json({ ok: true });
}

export default perBusiness(async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const client = createScopedClientFromRequest(req);
    const directory = accountDirectoryFromRequest(req);
    return await handleAccess({ client, directory, tenantId: req.headers.get(SCOPE_HEADER) || '' }, body);
  } catch (error) {
    const status = (error as any)?.status === 403 ? 403 : 500;
    return Response.json({ error: (error as any)?.message || 'Unable to update account access.' }, { status });
  }
});
