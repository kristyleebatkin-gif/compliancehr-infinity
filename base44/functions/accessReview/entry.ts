// Periodic Access Review (backlog P0 16.12): every so often, managers confirm each person's access is still right.
//
// Rules, all checked on the server:
//   - only approved owner / Provider Administrator / Management accounts run reviews; one open review at a time
//   - starting takes a snapshot of everyone with active access (the owner account is not reviewed)
//   - each person is decided once: keep, change role, or suspend; a change or suspension needs a note and
//     takes effect straight away, with the business membership kept in step
//   - nobody reviews their own access; senior accounts are reviewed only by the owner or a Provider Administrator
//   - someone who already lost access since the review started is recorded as "Left already"
//   - a review is completed only when everyone is decided; every step is in the activity log
//
// Actions (POST body): overview | start { due_in_days? } | decide { review_id, user_id, decision, role?, note? }
//                      complete { review_id } | cancel { review_id, reason }
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, canManageAccess, canGrantRole, ASSIGNABLE_ROLES, SENIOR_ROLES } from '../../shared/roleMatrix.ts';
import { syncMembership } from '../../shared/accessChanges.ts';
import { BUSINESS_TIME_ZONE } from '../../shared/businessTime.ts';

export const REVIEW_EVERY_DAYS = 90;
const items = (page: any) => (Array.isArray(page) ? page : page?.items || []);
const json = (body: unknown, status = 200) => Response.json(body, { status });
const isOwnerOrPA = (role: string) => role === 'admin' || role === 'Provider Administrator';
const businessDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export function summarise(reviewItems: any[]) {
  const count = (d: string) => reviewItems.filter((i) => i.decision === d).length;
  return `${reviewItems.length} reviewed: ${count('Kept')} kept, ${count('Changed')} changed, ${count('Suspended')} suspended, ${count('Left already')} had already left.`;
}

export async function handleReview(client: any, body: any, now = new Date()): Promise<Response> {
  const actor = await client.auth.me().catch(() => null);
  if (!actor) return json({ error: 'Please sign in.' }, 401);
  if (!canManageAccess(actor)) return json({ error: 'Approved management access is required.' }, 403);
  const E = client.asServiceRole.entities;
  const who = actor.full_name || actor.email || 'A manager';
  const today = businessDate(now);
  const audit = (action: string, target: any, details: Record<string, unknown>) =>
    E.AuditLog.create({
      action, entity_type: target?.entity_type || 'User', record_id: target?.id || '', record_title: target?.title || target?.email || '',
      performed_by: who, performed_by_user_id: actor.id, performed_by_email: actor.email || '', performed_by_role: actor.role,
      details: JSON.stringify(details).slice(0, 4000), timestamp: now.toISOString(),
    });
  const openReview = async () => items(await E.AccessReview.filter({ status: 'Open' }, { limit: 1 }))[0] || null;
  const loadOpen = async (id: unknown) => {
    const review = typeof id === 'string' ? await E.AccessReview.get(id) : null;
    if (!review) return { error: json({ error: 'Review not found.' }, 404) };
    if (review.status !== 'Open') return { error: json({ error: `This review is already ${String(review.status).toLowerCase()}.` }, 409) };
    return { review };
  };

  if (body.action === 'overview') {
    const open = await openReview();
    const past = items(await E.AccessReview.filter({ status: { $ne: 'Open' } }, { sort: '-started_at', limit: 10 }));
    const lastDone = past.find((r: any) => r.status === 'Completed');
    const nextDue = lastDone?.completed_at ? businessDate(addDays(new Date(lastDone.completed_at), REVIEW_EVERY_DAYS)) : null;
    return json({
      open, past, last_completed_at: lastDone?.completed_at || null,
      next_due: nextDue, due_now: !open && (!nextDue || nextDue <= today),
      me: actor.id, can_review_senior: isOwnerOrPA(actor.role),
      grantable_roles: ASSIGNABLE_ROLES.filter((r) => canGrantRole(actor.role, r)),
      every_days: REVIEW_EVERY_DAYS,
    });
  }

  if (body.action === 'start') {
    if (await openReview()) return json({ error: 'A review is already open. Finish or cancel it first.' }, 409);
    const people = items(await E.User.list()).filter((u: any) => hasApprovedAccess(u) && u.role !== 'admin');
    if (!people.length) return json({ error: 'There is nobody with active access to review.' }, 400);
    const days = Math.min(60, Math.max(3, Number(body.due_in_days) || 14));
    const month = new Intl.DateTimeFormat('en-AU', { timeZone: BUSINESS_TIME_ZONE, month: 'long', year: 'numeric' }).format(now);
    const review = await E.AccessReview.create({
      title: `Access review: ${month}`, status: 'Open', started_at: now.toISOString(),
      started_by_id: actor.id, started_by_name: who, due_date: businessDate(addDays(now, days)),
      items: people
        .sort((a: any, b: any) => String(a.full_name || a.email).localeCompare(String(b.full_name || b.email)))
        .map((u: any) => ({ user_id: u.id, name: u.full_name || u.email, email: u.email || '', role_at_start: u.role, senior: SENIOR_ROLES.includes(u.role), decision: 'Pending' })),
    });
    await audit('Access review: started', { entity_type: 'AccessReview', id: review.id, title: review.title }, { people: people.length, due_date: review.due_date });
    return json({ ok: true, id: review.id });
  }

  if (body.action === 'decide') {
    const { review, error } = await loadOpen(body.review_id);
    if (error) return error;
    const list = [...(review.items || [])];
    const index = list.findIndex((i: any) => i.user_id === body.user_id);
    if (index < 0) return json({ error: 'That person is not part of this review.' }, 404);
    const item = { ...list[index] };
    if (item.decision !== 'Pending') return json({ error: `${item.name} has already been reviewed (${item.decision}).` }, 409);
    if (item.user_id === actor.id) return json({ error: 'Someone else must review your own access.' }, 403);
    const decision = String(body.decision || '');
    if (!['keep', 'change', 'suspend'].includes(decision)) return json({ error: 'Choose keep, change role or suspend.' }, 400);
    const note = String(body.note || '').trim().slice(0, 500);
    const found = await E.User.get(item.user_id);
    const target = found ? { ...found } : null; // a copy, so the log records the account as it was before the change
    const seniorNow = item.senior || SENIOR_ROLES.includes(target?.role);
    if (seniorNow && !isOwnerOrPA(actor.role)) return json({ error: 'Only the owner or a Provider Administrator can review a senior account.' }, 403);
    const stamp = { decided_by_id: actor.id, decided_by_name: who, decided_at: now.toISOString() };

    if (!target || !hasApprovedAccess(target)) {
      Object.assign(item, { decision: 'Left already', note: note || 'No longer had active access when reviewed.', ...stamp });
    } else if (decision === 'keep') {
      const moved = target.role !== item.role_at_start ? `Role is now ${target.role}. ` : '';
      Object.assign(item, { decision: 'Kept', new_role: target.role, note: (moved + note).trim(), ...stamp });
      await audit('Access review: kept', target, { review_id: review.id, role: target.role, note });
    } else if (decision === 'change') {
      const role = String(body.role || '');
      if (!canGrantRole(actor.role, role)) return json({ error: ASSIGNABLE_ROLES.includes(role) ? `You can't give the ${role} role.` : 'Choose one of the listed roles.' }, ASSIGNABLE_ROLES.includes(role) ? 403 : 400);
      if (role === target.role) return json({ error: `${item.name} already has the ${role} role. Choose keep instead.` }, 400);
      if (note.length < 3) return json({ error: 'Add a short note saying why the role is changing.' }, 400);
      await E.User.update(target.id, { role, previous_role: target.role, approved_by: who, approved_by_user_id: actor.id, approved_date: today, approved_time: now.toISOString().slice(11, 19) });
      await syncMembership(E, target, { membership_role: role, status: 'Active' }, { actorId: actor.id, today });
      Object.assign(item, { decision: 'Changed', new_role: role, note, ...stamp });
      await audit('Access: role changed', target, { review_id: review.id, from: target.role, to: role, note });
    } else {
      if (note.length < 3) return json({ error: 'Add a short note saying why access is being suspended.' }, 400);
      await E.User.update(target.id, {
        previous_role: target.role, role: 'Archived', account_status: 'Suspended', access_approved: false,
        archived_date: today, archived_time: now.toISOString().slice(11, 19), archive_reason: note,
      });
      await syncMembership(E, target, { status: 'Suspended' }, { actorId: actor.id, today });
      Object.assign(item, { decision: 'Suspended', note, ...stamp });
      await audit('Access: suspended', target, { review_id: review.id, role: target.role, reason: note });
    }
    list[index] = item;
    await E.AccessReview.update(review.id, { items: list });
    return json({ ok: true, decision: item.decision, remaining: list.filter((i: any) => i.decision === 'Pending').length });
  }

  if (body.action === 'complete') {
    const { review, error } = await loadOpen(body.review_id);
    if (error) return error;
    const reviewItems = review.items || [];
    const waiting = reviewItems.filter((i: any) => i.decision === 'Pending').length;
    if (waiting) return json({ error: `${waiting} ${waiting === 1 ? 'person still needs' : 'people still need'} a decision.` }, 409);
    const summary = summarise(reviewItems);
    await E.AccessReview.update(review.id, { status: 'Completed', completed_at: now.toISOString(), completed_by_name: who, summary });
    await audit('Access review: completed', { entity_type: 'AccessReview', id: review.id, title: review.title }, { summary });
    return json({ ok: true, summary, next_due: businessDate(addDays(now, REVIEW_EVERY_DAYS)) });
  }

  if (body.action === 'cancel') {
    const { review, error } = await loadOpen(body.review_id);
    if (error) return error;
    const reason = String(body.reason || '').trim().slice(0, 500);
    if (reason.length < 3) return json({ error: 'Say why the review is being cancelled.' }, 400);
    await E.AccessReview.update(review.id, { status: 'Cancelled', cancel_reason: reason, completed_at: now.toISOString(), completed_by_name: who });
    await audit('Access review: cancelled', { entity_type: 'AccessReview', id: review.id, title: review.title }, { reason, decided_before_cancel: (review.items || []).filter((i: any) => i.decision !== 'Pending').length });
    return json({ ok: true });
  }

  return json({ error: 'Unknown action.' }, 400);
}

export default perBusiness(async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return await handleReview(createScopedClientFromRequest(req), body);
  } catch (error) {
    return Response.json({ error: (error as any)?.message || 'Access review error.' }, { status: 500 });
  }
});
