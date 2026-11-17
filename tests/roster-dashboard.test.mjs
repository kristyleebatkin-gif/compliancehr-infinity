import test from 'node:test';
import assert from 'node:assert/strict';
import { readDashboardCollection } from '../src/lib/dashboardRecords.js';
import { shiftBounds, shiftNeedsClockIn, shiftNoteReview, relevantRoster, rosterMemberStatus, deriveRosterDashboard, serviceDay, rosterShiftStatus } from '../src/lib/rosterDashboard.js';
const overnight = { id: 's', date: '2026-11-17', start_time: '22:00', end_time: '06:00', employee_name: 'Worker', participant_name: 'Person', status: 'Scheduled' };
test('dashboard reads all cursor pages rather than presenting the first page as complete', async () => {
  const calls = [];
  const result = await readDashboardCollection(async options => {
    calls.push(options);
    return options.cursor ? { items: [{ id: 'c' }], has_more: false } : { items: [{ id: 'a' }, { id: 'b' }], has_more: true, next_cursor: 'next' };
  }, { pageSize: 2 });
  assert.equal(result.error, null); assert.equal(result.items.length, 3); assert.equal(calls[1].cursor, 'next');
});
test('dashboard refuses ambiguous full arrays, missing or repeated cursors, duplicate rows and read failures', async () => {
  const fixtures = [
    () => [{ id: 'a' }, { id: 'b' }],
    () => ({ items: [{ id: 'a' }], has_more: true }),
    () => ({ items: [{ id: 'a' }], next_cursor: 'same' }),
    () => ({ items: [{ id: 'a' }, { id: 'a' }], has_more: false }),
    () => ({ broken: [] }),
    () => { throw new Error('offline'); }
  ];
  for (const fetch of fixtures) {
    const result = await readDashboardCollection(fetch, { pageSize: 2 });
    assert.ok(result.error); assert.deepEqual(result.items, []);
  }
});
test('bounded dashboard reads discard partial rows at capacity and support explicit complete empty pages', async () => {
  const result = await readDashboardCollection(() => ({ items: [{ id: 'a' }], next_cursor: 'next' }), { maxPages: 1 });
  assert.ok(result.error); assert.deepEqual(result.items, []);
  assert.deepEqual(await readDashboardCollection(() => ({ items: [], has_more: false })), { items: [], error: null });
});
test('overnight shift end is tomorrow in Brisbane regardless of host timezone', () => {
  const bounds = shiftBounds(overnight);
  assert.equal(new Date(bounds.end).toISOString(), '2026-11-17T20:00:00.000Z');
  assert.equal(serviceDay(new Date('2026-11-17T15:00:00Z')), '2026-11-18');
  assert.equal(shiftNoteReview(overnight, [], new Date('2026-11-17T13:00:00Z')).state, 'not-due');
  assert.equal(shiftNoteReview(overnight, [], new Date('2026-11-17T21:00:00Z')).state, 'missing');
  assert.equal(relevantRoster([overnight, { ...overnight, id: 'old', date: '2026-11-16' }], '2026-11-18').length, 1);
});
test('cancelled, missed and unassigned shifts do not generate late-worker alarms', () => {
  for (const patch of [{ status: 'Cancelled' }, { status: 'Missed' }, { status: 'Completed' }, { employee_name: '' }]) assert.equal(shiftNeedsClockIn({ ...overnight, ...patch }, new Date('2026-11-17T13:00:00Z')), false);
  assert.equal(shiftNeedsClockIn(overnight, new Date('2026-11-17T13:00:00Z')), true);
});
test('invalid dates and clock values remain unknown', () => {
  for (const patch of [{ date: '2026-02-30' }, { start_time: '25:00' }, { end_time: '22:00' }]) assert.equal(shiftBounds({ ...overnight, ...patch }), null);
});
test('name/date candidates require review and subject text never verifies a shift', () => {
  const shift = { ...overnight, status: 'Completed' };
  const note = { entry_kind: 'Shift Note', person_name: 'Person', entry_date: shift.date, subject: 'Person' };
  assert.equal(shiftNoteReview(shift, [note]).state, 'review');
  for (const patch of [{ entry_date: '2026-11-16' }, { person_name: '' }, { lifecycle_status: 'Archived' }, { entry_kind: 'Message' }]) assert.equal(shiftNoteReview(shift, [{ ...note, ...patch }]).state, 'missing');
  assert.equal(shiftNoteReview({ ...shift, id: 'second-shift' }, [note]).state, 'review');
});
test('staff status checks all shifts and refuses duplicate worker names or invented availability', () => {
  const member = { id: 'w', full_name: 'Worker' };
  const completed = { ...overnight, status: 'Completed' };
  const active = { ...overnight, id: 'other', clock_in: '2026-11-17T12:00:00Z' };
  assert.equal(rosterMemberStatus(member, [completed, active], [member]).label, 'On shift');
  assert.equal(rosterMemberStatus(member, [], [member]).label, 'No shift recorded');
  assert.equal(rosterMemberStatus(member, [active], [member, { ...member, id: 'duplicate' }]).label, 'Check worker identity');
});
test('incident counts come from incident records and completed unassigned shifts do not need coverage', () => {
  const data = { day: '2026-11-17', shifts: [{ ...overnight, employee_name: '', status: 'Completed' }], notes: [{ incident_report: 'reference' }], incidents: [{ id: 'incident-a' }, { id: 'incident-b' }], team: [], todos: [] };
  const derived = deriveRosterDashboard(data);
  assert.equal(derived.unfilled.length, 0); assert.equal(derived.noteIncidents.length, 1); assert.equal(derived.openIncidents.length, 2);
});

test('roster rows retain cancelled, missed and completed statuses instead of claiming coverage', () => {
  for (const status of ['Cancelled', 'Missed', 'Completed']) assert.equal(rosterShiftStatus({ ...overnight, status, employee_name: '' }).label, status);
});

test('dashboard distinguishes exact service associations from edited or unlinked evidence', () => {
  const shift = { ...overnight, status: 'Completed' };
  assert.equal(shiftNoteReview(shift, [], new Date(), [{ shift_id: shift.id, state: 'linked' }]).state, 'linked');
  assert.equal(shiftNoteReview(shift, [], new Date(), [{ shift_id: shift.id, state: 'changed', label: 'Review changed note' }]).state, 'review');
  assert.equal(shiftNoteReview(shift, [], new Date(), [{ shift_id: 'another-shift', state: 'linked' }]).state, 'missing');
});
