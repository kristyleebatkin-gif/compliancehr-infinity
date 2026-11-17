// Backlog 17.20 Escalation Rule Designer - owner-approved task escalation ladder (17 Nov 2026).
// Pure rules, no database access, so they can be tested on their own.
//
//   Business day 1 overdue  -> the people assigned/responsible (daily reminder carries on until done)
//   Business day 2 overdue  -> managers (Provider Administrator / Compliance Manager: Sherelle and Jamie)
//   Business day 3 overdue  -> the owner (admin) plus the managers
//   Urgent priority         -> the owner plus the managers from business day 1
//   Nobody assigned         -> managers from business day 1, so an unowned task is never silent
//
// Business days skip Saturdays, Sundays and active Queensland/national public holidays.
// Each level is sent once per task. Moving the due date starts the ladder again.

export const DONE_STATUSES = ['Completed', 'Cancelled', 'Finalised'];
export const MANAGER_ROLES = ['Provider Administrator', 'Compliance Manager'];
export const OWNER_ROLES = ['admin'];
export const HOLIDAY_LOCATIONS = ['', 'qld', 'queensland', 'national', 'australia', 'all'];

export const LEVEL = { NONE: 0, ASSIGNEE: 1, MANAGER: 2, OWNER: 3 } as const;
export const LEVEL_LABEL = ['Not overdue', 'Overdue', 'With manager', 'With owner'];

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function holidaySet(holidays: any[] = []): Set<string> {
  const set = new Set<string>();
  for (const h of holidays) {
    if (!h || h.active === false || !h.holiday_date) continue;
    if (!HOLIDAY_LOCATIONS.includes(norm(h.location))) continue;
    set.add(String(h.holiday_date).slice(0, 10));
  }
  return set;
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function isBusinessDay(iso: string, holidays: Set<string>): boolean {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day !== 0 && day !== 6 && !holidays.has(iso);
}

// Business days after the due date, up to and including today.
export function businessDaysOverdue(dueIso: string, todayIso: string, holidays: Set<string>): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dueIso || '')) || !/^\d{4}-\d{2}-\d{2}$/.test(todayIso)) return 0;
  if (dueIso >= todayIso) return 0;
  let count = 0;
  let cursor = nextDay(dueIso);
  let guard = 0;
  while (cursor <= todayIso && guard < 4000) {
    if (isBusinessDay(cursor, holidays)) count += 1;
    cursor = nextDay(cursor);
    guard += 1;
  }
  return count;
}

export function assigneeEmails(task: any): string[] {
  const set = new Set<string>();
  if (task?.assigned_email) set.add(norm(task.assigned_email));
  for (const e of task?.responsible_emails || []) set.add(norm(e));
  return [...set].filter((e) => EMAIL_RE.test(e));
}

export function targetLevel(task: any, todayIso: string, holidays: Set<string>): number {
  if (!task || task.archived === true || DONE_STATUSES.includes(task.status)) return LEVEL.NONE;
  const days = businessDaysOverdue(task.due_date, todayIso, holidays);
  if (days <= 0) return LEVEL.NONE;
  if (task.priority === 'Urgent') return LEVEL.OWNER;
  if (days >= 3) return LEVEL.OWNER;
  if (days >= 2) return LEVEL.MANAGER;
  if (assigneeEmails(task).length === 0) return LEVEL.MANAGER;
  return LEVEL.ASSIGNEE;
}

const activeUser = (u: any) => u && u.email && EMAIL_RE.test(norm(u.email)) && !['Archived', 'Suspended'].includes(u.account_status);

export function recipientsFor(level: number, task: any, users: any[]): { email: string; why: string }[] {
  const out = new Map<string, string>();
  if (level >= LEVEL.ASSIGNEE) for (const e of assigneeEmails(task)) out.set(e, 'assigned');
  if (level >= LEVEL.MANAGER) {
    for (const u of users.filter((x) => activeUser(x) && MANAGER_ROLES.includes(x.role))) {
      if (!out.has(norm(u.email))) out.set(norm(u.email), 'manager');
    }
  }
  if (level >= LEVEL.OWNER) {
    for (const u of users.filter((x) => activeUser(x) && OWNER_ROLES.includes(x.role))) {
      if (!out.has(norm(u.email))) out.set(norm(u.email), 'owner');
    }
  }
  return [...out].map(([email, why]) => ({ email, why }));
}

// What the sweep would do for each task. A level already sent for the same due date is not sent again.
export function planEscalations(tasks: any[], users: any[], holidays: any[], todayIso: string) {
  const hol = holidaySet(holidays);
  const plan: any[] = [];
  for (const task of tasks) {
    const level = targetLevel(task, todayIso, hol);
    if (level === LEVEL.NONE) continue;
    const sentFor = String(task.escalation_due_date || '');
    const already = sentFor === String(task.due_date || '') ? Number(task.escalation_level || 0) : 0;
    if (level <= already) continue;
    plan.push({
      task_id: task.id,
      title: String(task.title || 'Task').slice(0, 160),
      due_date: task.due_date,
      priority: task.priority || 'Medium',
      business_days_overdue: businessDaysOverdue(task.due_date, todayIso, hol),
      unassigned: assigneeEmails(task).length === 0,
      from_level: already,
      to_level: level,
      stage: LEVEL_LABEL[level],
      recipients: recipientsFor(level, task, users),
    });
  }
  return plan;
}
