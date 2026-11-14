// Approval Inbox (backlog P0 01.06): one place for everything waiting on someone's sign-off.
//
// Every decision is made here on the server, never in the browser:
//   - only the roles allowed for that kind of record can decide
//   - nobody can approve their own request, or work they completed themselves
//   - approving needs a typed signature; returning needs a reason
//   - a request can be decided once; the underlying record must still be waiting
//   - each decision is written to the activity log and the requester is notified
//
// Actions (POST body):
//   { action: "inbox" }                                   -> lists what you can decide, and what you asked for
//   { action: "decide", id, decision: "approve"|"return", note?, signature? }
//   { action: "decide", task_id, ... }                    -> same, by task (used by the To-Do board)
//
//   { action: "request_access", role, reason }           -> ask for a different role (backlog 16.09)
//   { action: "withdraw", id }                            -> take back your own access request
//
// Task sign-off is the first kind of record. Tasks set to "Pending Approval" anywhere in the app
// are picked up automatically; requests whose task was signed off or reopened elsewhere are withdrawn.
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, TASK_APPROVER_ROLES } from '../../shared/roleMatrix.ts';
import { MANAGEMENT_ROLES, SENIOR_ROLES, ASSIGNABLE_ROLES, canGrantRole } from '../../shared/roleMatrix.ts';
import { syncMembership } from '../../shared/accessChanges.ts';
import { BUSINESS_TIME_ZONE } from '../../shared/businessTime.ts';

// Who may approve comes from the shared role rules, shown on the Users & Permissions page.
export { TASK_APPROVER_ROLES };

const norm = (s: unknown) => String(s ?? '').trim().toLowerCase();
const items = (page: any) => (Array.isArray(page) ? page : page?.items || []);

export function businessDate(now: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function canDecide(user: any, request: any) {
  return Array.isArray(request?.approver_roles) && request.approver_roles.includes(user?.role);
}

// Separation of duties: the person who asked, or who did the work, cannot approve it.
export function isOwnWork(user: any, request: any) {
  if (!user || !request) return false;
  if (request.requested_by_id && request.requested_by_id === user.id) return true;
  if (request.requested_by_email && norm(request.requested_by_email) === norm(user.email)) return true;
  const doer = norm(request.completed_by_name);
  return Boolean(doer) && (doer === norm(user.full_name) || doer === norm(user.email));
}

function requestFromTask(task: any, now: Date) {
  return {
    title: `Sign off: ${String(task.title || 'Task').slice(0, 180)}`,
    record_type: 'TodoTask',
    record_id: task.id,
    record_url: `/tasks?task=${encodeURIComponent(task.id)}`,
    module: task.module || 'General',
    summary: `Completed by ${task.completed_by || 'unknown'} on ${task.completed_date || '-'}`
      + (task.time_taken_minutes ? ` (${task.time_taken_minutes} min)` : '') + '.',
    requested_by_name: task.completed_by || '',
    requested_by_email: task.assigned_email || '',
    completed_by_name: task.completed_by || '',
    requested_at: now.toISOString(),
    approver_roles: TASK_APPROVER_ROLES,
    due_date: task.due_date || undefined,
    status: 'Pending',
  };
}

// Brings task sign-offs into the inbox and withdraws requests whose task moved on elsewhere.
export async function syncTaskRequests(entities: any, now: Date) {
  const [taskPage, reqPage] = await Promise.all([
    entities.TodoTask.filter({ status: 'Pending Approval', archived: { $ne: true } }, { limit: 500 }),
    entities.ApprovalRequest.filter({ record_type: 'TodoTask', status: 'Pending' }, { limit: 500 }),
  ]);
  const waiting = new Map(items(taskPage).map((t: any) => [t.id, t]));
  const open = items(reqPage);
  const covered = new Set(open.map((r: any) => r.record_id));
  let created = 0;
  let withdrawn = 0;
  for (const task of waiting.values()) {
    if (covered.has((task as any).id)) continue;
    await entities.ApprovalRequest.create(requestFromTask(task, now));
    created++;
  }
  for (const r of open) {
    if (waiting.has(r.record_id)) continue;
    await entities.ApprovalRequest.update(r.id, {
      status: 'Withdrawn', decided_at: now.toISOString(),
      decision_note: 'The task was signed off or reopened outside the Approval Inbox.',
    });
    withdrawn++;
  }
  return { created, withdrawn };
}

const view = (r: any) => ({
  id: r.id, title: r.title, module: r.module, summary: r.summary, record_type: r.record_type,
  record_id: r.record_id, record_url: r.record_url, requested_by_name: r.requested_by_name,
  requested_at: r.requested_at, due_date: r.due_date, status: r.status,
  decided_by_name: r.decided_by_name, decided_at: r.decided_at, decision_note: r.decision_note,
  requested_role: r.requested_role || null, current_role: r.current_role || null,
});

// Access requests (backlog 16.09). Senior roles, asked for or held now, are decided only by the
// owner or a Provider Administrator; everything else by any manager.
export function accessApprovers(currentRole: string, requestedRole: string) {
  return SENIOR_ROLES.includes(currentRole) || SENIOR_ROLES.includes(requestedRole)
    ? ['admin', 'Provider Administrator']
    : [...MANAGEMENT_ROLES];
}
const APPROVER_ROLES = [...new Set([...TASK_APPROVER_ROLES, ...MANAGEMENT_ROLES])];

async function requestAccess(entities: any, user: any, body: any, now: Date) {
  if (user.role === 'admin') return Response.json({ error: 'The owner account already has full access.' }, { status: 400 });
  const role = String(body.role || '');
  const reason = String(body.reason || '').trim().slice(0, 1000);
  if (!ASSIGNABLE_ROLES.includes(role)) return Response.json({ error: 'Choose one of the listed roles.' }, { status: 400 });
  if (role === user.role) return Response.json({ error: `You already have the ${role} role.` }, { status: 400 });
  if (reason.length < 10) return Response.json({ error: 'Say briefly why you need this access (at least 10 characters).' }, { status: 400 });
  const open = items(await entities.ApprovalRequest.filter({ record_type: 'AccessRequest', record_id: user.id, status: 'Pending' }, { limit: 1 }));
  if (open.length) return Response.json({ error: 'You already have an access request waiting. Withdraw it first to ask for something different.' }, { status: 409 });
  const who = user.full_name || user.email;
  const approver_roles = accessApprovers(user.role, role);
  const request = await entities.ApprovalRequest.create({
    title: `Access: ${who} asks to become ${role}`,
    record_type: 'AccessRequest', record_id: user.id, record_url: '/users', module: 'Access',
    summary: `Currently ${user.role}. Reason: ${reason}`,
    requested_role: role, current_role: user.role,
    requested_by_id: user.id, requested_by_name: who, requested_by_email: user.email || '',
    requested_at: now.toISOString(), approver_roles, status: 'Pending',
  });
  await entities.AuditLog.create({
    action: 'Access request: submitted', entity_type: 'User', record_id: user.id, record_title: user.email || who,
    performed_by: who, performed_by_user_id: user.id, performed_by_email: user.email || '', performed_by_role: user.role,
    details: JSON.stringify({ approval_request_id: request.id, from: user.role, to: role, reason }).slice(0, 4000),
    timestamp: now.toISOString(),
  });
  // Tell the people who can decide it.
  const people = items(await entities.User.list());
  for (const p of people) {
    if (p.id === user.id || !hasApprovedAccess(p) || !approver_roles.includes(p.role) || !p.email) continue;
    await entities.Notification.create({
      type: 'General', recipient: p.email, message: `${who} is asking for the ${role} role.`,
      read: false, action_url: '/approvals', linked_entity_type: 'ApprovalRequest', linked_entity_id: request.id,
    });
  }
  return Response.json({ ok: true, id: request.id });
}

async function decideAccess(entities: any, user: any, request: any, decision: string, note: string, signature: string, now: Date) {
  const who = user.full_name || user.email;
  const today = businessDate(now);
  const target = await entities.User.get(request.record_id);
  const unchanged = target && hasApprovedAccess(target) && target.role === request.current_role;
  if (!unchanged) {
    await entities.ApprovalRequest.update(request.id, { status: 'Withdrawn', decided_at: now.toISOString(), decision_note: "The person's account changed since they asked." });
    return Response.json({ error: "This person's account has changed since they asked, so the request was withdrawn." }, { status: 409 });
  }
  if (decision === 'approve' && !canGrantRole(user.role, request.requested_role)) {
    return Response.json({ error: `You can't give the ${request.requested_role} role.` }, { status: 403 });
  }
  const outcome = decision === 'approve' ? 'Approved' : 'Returned';
  if (decision === 'approve') {
    await entities.User.update(target.id, {
      role: request.requested_role, previous_role: target.role,
      approved_by: who, approved_by_user_id: user.id, approved_date: today, approved_time: now.toISOString().slice(11, 19),
    });
    await syncMembership(entities, target, { membership_role: request.requested_role, status: 'Active' }, { actorId: user.id, today });
  }
  await entities.ApprovalRequest.update(request.id, {
    status: outcome, decided_by_id: user.id, decided_by_name: who, decided_by_email: user.email || '',
    decided_at: now.toISOString(), decision_note: note, signature: decision === 'approve' ? signature : '',
  });
  await entities.AuditLog.create({
    action: decision === 'approve' ? 'Access: role changed' : 'Access request: declined',
    entity_type: 'User', record_id: target.id, record_title: target.email || target.full_name || '',
    performed_by: who, performed_by_user_id: user.id, performed_by_email: user.email || '', performed_by_role: user.role,
    details: JSON.stringify({ approval_request_id: request.id, from: request.current_role, to: request.requested_role, decision: outcome, note }).slice(0, 4000),
    timestamp: now.toISOString(),
  });
  if (request.requested_by_email) {
    await entities.Notification.create({
      type: 'General', recipient: request.requested_by_email,
      message: decision === 'approve'
        ? `Your access request was approved: you now have the ${request.requested_role} role. Sign out and back in if your menu hasn't changed.`
        : `Your request for the ${request.requested_role} role was declined. Reason: ${note}`,
      read: false, action_url: '/approvals', linked_entity_type: 'ApprovalRequest', linked_entity_id: request.id,
    });
  }
  return Response.json({ ok: true, status: outcome });
}

export async function handleApprovals(base44: any, req: Request, now = new Date()) {
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasApprovedAccess(user)) return Response.json({ error: 'Your account is not active and approved.' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const entities = base44.asServiceRole.entities;

  if (body.action === 'inbox') {
    await syncTaskRequests(entities, now);
    const pending = items(await entities.ApprovalRequest.filter({ status: 'Pending' }, { sort: 'requested_at', limit: 500 }));
    const toDecide = pending.filter((r: any) => canDecide(user, r) && !isOwnWork(user, r));
    const ownAwaiting = pending.filter((r: any) => canDecide(user, r) && isOwnWork(user, r));
    const minePage = items(await entities.ApprovalRequest.filter({}, { sort: '-requested_at', limit: 200 }));
    const mine = minePage.filter((r: any) => isOwnWork(user, r)).slice(0, 50);
    return Response.json({
      can_approve: APPROVER_ROLES.includes(user.role),
      my_role: user.role,
      can_request_access: user.role !== 'admin',
      requestable_roles: ASSIGNABLE_ROLES.filter((r) => r !== user.role),
      to_decide: toDecide.map(view),
      own_awaiting_someone_else: ownAwaiting.map(view),
      my_requests: mine.map(view),
    });
  }

  if (body.action === 'request_access') return requestAccess(entities, user, body, now);

  if (body.action === 'withdraw') {
    const request = body.id ? await entities.ApprovalRequest.get(String(body.id)) : null;
    if (!request || request.record_type !== 'AccessRequest' || request.requested_by_id !== user.id) {
      return Response.json({ error: 'Request not found.' }, { status: 404 });
    }
    if (request.status !== 'Pending') return Response.json({ error: 'This request has already been decided.' }, { status: 409 });
    await entities.ApprovalRequest.update(request.id, { status: 'Withdrawn', decided_at: now.toISOString(), decision_note: 'Withdrawn by the person who asked.' });
    return Response.json({ ok: true });
  }

  if (body.action === 'decide') {
    const decision = body.decision;
    if (!['approve', 'return'].includes(decision)) return Response.json({ error: 'Choose approve or return.' }, { status: 400 });
    const note = String(body.note || '').trim().slice(0, 2000);
    const signature = String(body.signature || '').trim().slice(0, 200);
    if (decision === 'approve' && signature.length < 2) return Response.json({ error: 'Type your full name to sign.' }, { status: 400 });
    if (decision === 'return' && note.length < 3) return Response.json({ error: 'Say why it is being returned.' }, { status: 400 });

    // The To-Do board signs off by task; find (or create) that task's open request.
    let request = body.id ? await entities.ApprovalRequest.get(String(body.id)) : null;
    if (!request && body.task_id) {
      await syncTaskRequests(entities, now);
      request = items(await entities.ApprovalRequest.filter({ record_type: 'TodoTask', record_id: String(body.task_id), status: 'Pending' }, { limit: 1 }))[0] || null;
    }
    if (!request) return Response.json({ error: 'Approval request not found.' }, { status: 404 });
    if (request.status !== 'Pending') return Response.json({ error: `This request is already ${String(request.status).toLowerCase()}.` }, { status: 409 });
    if (!canDecide(user, request)) return Response.json({ error: 'Your role cannot decide this request.' }, { status: 403 });
    if (isOwnWork(user, request) || request.record_id === user.id && request.record_type === 'AccessRequest') {
      return Response.json({ error: 'You cannot approve your own request or work you completed. Someone else must decide it.' }, { status: 403 });
    }
    if (request.record_type === 'AccessRequest') return decideAccess(entities, user, request, decision, note, signature, now);

    const task = await entities.TodoTask.get(request.record_id);
    if (!task || task.status !== 'Pending Approval') {
      await entities.ApprovalRequest.update(request.id, { status: 'Withdrawn', decided_at: now.toISOString(), decision_note: 'The task is no longer waiting for sign-off.' });
      return Response.json({ error: 'The task is no longer waiting for sign-off, so the request was withdrawn.' }, { status: 409 });
    }

    const today = businessDate(now);
    const who = user.full_name || user.email;
    if (decision === 'approve') {
      await entities.TodoTask.update(task.id, { status: 'Finalised', signed_off_by: who, signed_off_date: today, signature });
    } else {
      await entities.TodoTask.update(task.id, {
        status: 'Pending', completed_date: '', completed_by: '', time_taken_minutes: 0,
        signed_off_by: '', signed_off_date: '', signature: '',
      });
    }
    const outcome = decision === 'approve' ? 'Approved' : 'Returned';
    await entities.ApprovalRequest.update(request.id, {
      status: outcome, decided_by_id: user.id, decided_by_name: who, decided_by_email: user.email || '',
      decided_at: now.toISOString(), decision_note: note, signature: decision === 'approve' ? signature : '',
    });

    const sentence = decision === 'approve'
      ? `"${task.title}" was signed off by ${who} on ${today}.`
      : `"${task.title}" was returned by ${who} on ${today}: ${note}`;
    await entities.AuditLog.create({
      action: decision === 'approve' ? 'Approval: signed off' : 'Approval: returned',
      entity_type: 'TodoTask', record_id: task.id, record_title: task.title || '',
      performed_by: who, performed_by_user_id: user.id, performed_by_email: user.email || '', performed_by_role: user.role,
      details: JSON.stringify({ approval_request_id: request.id, decision: outcome, note, completed_by: task.completed_by || '' }).slice(0, 4000),
      timestamp: now.toISOString(),
    });
    await entities.CommunicationEntry.create({
      entry_kind: 'Employee Log', person_type: 'General', log_type: 'Task Sign-off',
      subject: `${decision === 'approve' ? 'Signed off' : 'Sign-off returned'}: ${task.title}`,
      body: sentence, module: task.module || 'General', entry_date: today,
      sender_name: who, sender_email: user.email || '', email_sent: false,
    });
    if (request.requested_by_email || request.requested_by_name) {
      await entities.Notification.create({
        type: 'General', recipient: request.requested_by_email || request.requested_by_name,
        message: decision === 'approve' ? `Signed off: ${task.title}` : `Returned for more work: ${task.title}. Reason: ${note}`,
        read: false, action_url: request.record_url || '/tasks', linked_entity_type: 'TodoTask', linked_entity_id: task.id,
      });
    }
    return Response.json({ ok: true, status: outcome });
  }

  return Response.json({ error: 'Unknown action.' }, { status: 400 });
}

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    return await handleApprovals(base44, req);
  } catch (error) {
    return Response.json({ error: (error as any)?.message || 'Approval Inbox error.' }, { status: 500 });
  }
});
