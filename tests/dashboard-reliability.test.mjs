import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardIdentityKey, todayAssistantContext } from '../src/lib/dashboardReliability.js';
const user = { id: 'a', tenant_id: 'business-a', role: 'Administration', account_status: 'Active', access_approved: true };
test('dashboard scopes change with identity, business, role or approval', () => {
  const initial = dashboardIdentityKey(user);
  for (const patch of [{ id: 'b' }, { tenant_id: 'business-b' }, { role: 'Management' }]) assert.notEqual(dashboardIdentityKey({ ...user, ...patch }), initial);
  for (const actor of [null, { ...user, tenant_id: null }, { ...user, account_status: 'Suspended' }, { ...user, access_approved: false }]) assert.equal(dashboardIdentityKey(actor), null);
});
test('assistant does not turn failed or loading data into zero totals', () => {
  assert.match(todayAssistantContext(null), /loading/);
  const text = todayAssistantContext({ errors: { invoices: 'offline' }, summary: { invoices: 0 } });
  assert.match(text, /incomplete/); assert.doesNotMatch(text, /0 draft invoices/);
});
test('assistant includes only permitted figures and identifies samples and recorded notes', () => {
  const text = todayAssistantContext({ access: { invoices: true, notes: true, todos: true }, errors: {}, summary: { emails: 999, invoices: 0, notesOutstanding: 3 }, todos: [{ id: 't' }] });
  assert.match(text, /0 draft invoices/); assert.match(text, /3 recorded shift notes/); assert.match(text, /not a full register total/); assert.doesNotMatch(text, /999/);
});
