// Backlog 17.20: owner-approved task escalation ladder (business days).
import { assertEquals } from 'jsr:@std/assert@1';
import { businessDaysOverdue, holidaySet, targetLevel, recipientsFor, planEscalations, LEVEL } from '../../base44/shared/taskEscalation.ts';

const none = new Set<string>();
const users = [
  { email: 'owner@x.au', role: 'admin', account_status: 'Active' },
  { email: 'sherelle@x.au', role: 'Provider Administrator', account_status: 'Active' },
  { email: 'jamie@x.au', role: 'Provider Administrator', account_status: 'Active' },
  { email: 'gone@x.au', role: 'Provider Administrator', account_status: 'Archived' },
  { email: 'worker@x.au', role: 'Support Worker', account_status: 'Active' },
];
const task = (over: any = {}) => ({ id: 't1', title: 'T', status: 'Open', priority: 'Medium', due_date: '2026-11-16', assigned_email: 'worker@x.au', ...over });

Deno.test('weekends do not count', () => {
  // due Fri 13 Nov; Sat/Sun skipped; Mon 16 = 1 business day overdue
  assertEquals(businessDaysOverdue('2026-11-13', '2026-11-15', none), 0);
  assertEquals(businessDaysOverdue('2026-11-13', '2026-11-16', none), 1);
  assertEquals(businessDaysOverdue('2026-11-13', '2026-11-18', none), 3);
});

Deno.test('Queensland holidays skip, other states do not', () => {
  const hol = holidaySet([
    { holiday_date: '2026-11-17', location: 'Queensland', active: true },
    { holiday_date: '2026-11-18', location: 'NSW', active: true },
    { holiday_date: '2026-11-19', location: 'QLD', active: false },
  ]);
  assertEquals([...hol], ['2026-11-17']);
  assertEquals(businessDaysOverdue('2026-11-16', '2026-11-19', hol), 2);
});

Deno.test('ladder: assignee day 1, managers day 2, owner day 3', () => {
  assertEquals(targetLevel(task(), '2026-11-16', none), LEVEL.NONE);
  assertEquals(targetLevel(task(), '2026-11-17', none), LEVEL.ASSIGNEE);
  assertEquals(targetLevel(task(), '2026-11-18', none), LEVEL.MANAGER);
  assertEquals(targetLevel(task(), '2026-11-19', none), LEVEL.OWNER);
});

Deno.test('urgent goes to owner on day 1; unassigned goes to managers on day 1', () => {
  assertEquals(targetLevel(task({ priority: 'Urgent' }), '2026-11-17', none), LEVEL.OWNER);
  assertEquals(targetLevel(task({ assigned_email: null }), '2026-11-17', none), LEVEL.MANAGER);
});

Deno.test('finished or archived tasks never escalate', () => {
  for (const status of ['Completed', 'Cancelled', 'Finalised']) assertEquals(targetLevel(task({ status }), '2026-11-30', none), LEVEL.NONE);
  assertEquals(targetLevel(task({ archived: true }), '2026-11-30', none), LEVEL.NONE);
});

Deno.test('recipients: managers are active Provider Administrators, owner is admin, no duplicates', () => {
  assertEquals(recipientsFor(LEVEL.MANAGER, task(), users).map((r) => r.email), ['worker@x.au', 'sherelle@x.au', 'jamie@x.au']);
  assertEquals(recipientsFor(LEVEL.OWNER, task({ assigned_email: 'jamie@x.au' }), users).map((r) => r.why), ['assigned', 'manager', 'owner']);
});

Deno.test('a level is sent once per due date; moving the due date restarts', () => {
  assertEquals(planEscalations([task({ escalation_level: 2, escalation_due_date: '2026-11-16' })], users, [], '2026-11-18').length, 0);
  assertEquals(planEscalations([task({ escalation_level: 2, escalation_due_date: '2026-11-16' })], users, [], '2026-11-19')[0].to_level, LEVEL.OWNER);
  assertEquals(planEscalations([task({ due_date: '2026-11-17', escalation_level: 3, escalation_due_date: '2026-11-16' })], users, [], '2026-11-18')[0].to_level, LEVEL.ASSIGNEE);
});
