import { assertEquals, assertRejects } from 'jsr:@std/assert@1';
import { serviceEvidenceCommand, assessServiceEvidence, evidenceHash, shiftEvidenceSnapshot, noteEvidenceSnapshot } from '../../base44/shared/serviceEvidence.ts';
import { assessBillingBoard, noteKey } from '../../base44/shared/connectedJourneys.ts';
const user = { id: 'manager-a', role: 'Administration', tenant_id: 'a', account_status: 'Active', access_approved: true };
const at = new Date('2026-11-17T01:00:00Z');
function fixture() {
  const db = {
    Shift: [{ id: 'shift-a', tenant_id: 'a', participant_name: 'Person', employee_name: 'Worker', date: '2026-11-16', start_time: '09:00', end_time: '11:00', status: 'Completed', approval_status: 'Approved', billable_rate: 60 }],
    ShiftNote: [{ id: 'legacy-note', tenant_id: 'a', participant_name: 'Person', staff_name: 'Worker', date: '2026-11-16', what_happened: 'Actual support delivered.', updated_date: '2026-11-16T03:00:00Z' }],
    CommunicationEntry: [{ id: 'diary-note', tenant_id: 'a', person_name: 'Person', staff_involved: ['Worker'], entry_kind: 'Shift Note', entry_date: '2026-11-16', body: 'Actual support recorded in diary.', lifecycle_status: 'Sent', updated_date: '2026-11-16T03:00:00Z' }],
    ParticipantProfile: [{ id: 'person-a', tenant_id: 'a', full_name: 'Person' }],
    StaffProfile: [{ id: 'worker-a', tenant_id: 'a', full_name: 'Worker' }],
    TenantMembership: [{ id: 'member', user_id: user.id, tenant_id: 'a', status: 'Active' }],
    ServiceEvidenceLink: []
  };
  const calls = [];
  const entities = Object.fromEntries(Object.keys(db).map(name => [name, {
    filter: async (query, _sort, limit = 100, offset = 0) => {
      calls.push(['read', name]);
      return db[name].filter(row => Object.entries(query).every(([key, value]) => value && typeof value === 'object' && '$in' in value ? value.$in.includes(row[key]) : row[key] === value)).slice(offset, offset + limit);
    },
    create: async values => { calls.push(['write', name]); const row = { ...values, id: `link-${db[name].length + 1}` }; db[name].push(row); return row; }
  }]));
  return { db, calls, client: { businessId: 'a', entities, asServiceRole: { entities } } };
}
const link = (over = {}) => ({ action: 'link', shift_id: 'shift-a', note_entity: 'CommunicationEntry', note_id: 'diary-note', reviewed: true, reason: 'Reviewed service content and worker.', command_key: 'test-command-0001', ...over });
const command = (f, body, time = at) => serviceEvidenceCommand(f.client, user, body, time);
Deno.test('service evidence denies unapproved, non-manager and foreign identities before reads', async () => {
  for (const patch of [{ access_approved: false }, { account_status: 'Suspended' }, { role: 'Employee' }, { tenant_id: 'b' }]) {
    const f = fixture(); await assertRejects(() => serviceEvidenceCommand(f.client, { ...user, ...patch }, link(), at)); assertEquals(f.calls.length, 0);
  }
});
Deno.test('service evidence denies ended membership and foreign shifts before writes', async () => {
  for (const change of [f => { f.db.TenantMembership[0].status = 'Ended'; }, f => { f.db.Shift[0].tenant_id = 'b'; }]) {
    const f = fixture(); change(f); await assertRejects(() => command(f, link())); assertEquals(f.db.ServiceEvidenceLink.length, 0);
  }
});
Deno.test('explicit diary association records stable identities, hashes and actor and is retryable', async () => {
  const f = fixture(); const result = await command(f, link());
  assertEquals(result.current.state, 'linked');
  assertEquals(f.db.ServiceEvidenceLink[0].participant_id, 'person-a'); assertEquals(f.db.ServiceEvidenceLink[0].worker_id, 'worker-a'); assertEquals(f.db.ServiceEvidenceLink[0].actor_id, user.id);
  assertEquals((await command(f, link())).deduplicated, true); assertEquals(f.db.ServiceEvidenceLink.length, 1);
  await assertRejects(() => command(f, link({ reason: 'Changed command payload' })));
});
Deno.test('legacy ShiftNote and CommunicationEntry are both eligible only through explicit association', async () => {
  const f = fixture();
  const choices = await command(f, { action: 'options', shift_id: 'shift-a' }); assertEquals(choices.notes.length, 2);
  const result = await command(f, link({ note_entity: 'ShiftNote', note_id: 'legacy-note' })); assertEquals(result.current.state, 'linked');
});
Deno.test('note edits, archiving and shift identity changes invalidate prior associations', async () => {
  for (const change of [f => { f.db.CommunicationEntry[0].body = 'Different content'; }, f => { f.db.CommunicationEntry[0].lifecycle_status = 'Archived'; }, f => { f.db.Shift[0].employee_name = 'Other worker'; }]) {
    const f = fixture(); await command(f, link()); change(f);
    const result = await command(f, { action: 'assess', shift_ids: ['shift-a'] }); assertEquals(result.rows[0].state, 'changed');
  }
});
Deno.test('ambiguous profiles, wrong worker, missing content and unreviewed actions cannot create evidence', async () => {
  for (const change of [f => { f.db.StaffProfile.push({ ...f.db.StaffProfile[0], id: 'duplicate' }); }, f => { f.db.CommunicationEntry[0].staff_involved = ['Other worker']; }, f => { f.db.CommunicationEntry[0].body = ''; }]) {
    const f = fixture(); change(f); await assertRejects(() => command(f, link())); assertEquals(f.db.ServiceEvidenceLink.length, 0);
  }
  const f = fixture(); await assertRejects(() => command(f, link({ reviewed: false }))); assertEquals(f.db.ServiceEvidenceLink.length, 0);
});
Deno.test('one note cannot silently satisfy two shifts and concurrent conflicts fail closed', async () => {
  const f = fixture(); f.db.Shift.push({ ...f.db.Shift[0], id: 'shift-b' });
  await command(f, link()); await assertRejects(() => command(f, link({ shift_id: 'shift-b', command_key: 'test-command-0002' })));
  const original = f.db.ServiceEvidenceLink[0]; f.db.ServiceEvidenceLink.push({ ...original, id: 'conflict', shift_id: 'shift-b', shift_hash: await evidenceHash(shiftEvidenceSnapshot(f.db.Shift[1])) });
  const result = await command(f, { action: 'assess', shift_ids: ['shift-a', 'shift-b'] }); assertEquals(result.rows.map(row => row.state), ['conflict', 'conflict']);
});
Deno.test('unlink preserves append-only history and removes exact note readiness', async () => {
  const f = fixture(); await command(f, link());
  const result = await command(f, { ...link(), action: 'unlink', command_key: 'test-command-0002' }, new Date(+at + 1000));
  assertEquals(result.current.state, 'unlinked'); assertEquals(f.db.ServiceEvidenceLink.length, 2); assertEquals(f.db.ServiceEvidenceLink[0].action, 'Link');
});
Deno.test('old participant/date keys cannot establish billing evidence', () => {
  const f = fixture();
  const result = assessBillingBoard({ shifts: f.db.Shift, noteKeys: [noteKey('Person', '2026-11-16')] }); assertEquals(result[0].state, 'blocked');
  const exact = assessBillingBoard({ shifts: f.db.Shift, evidenceShiftIds: ['shift-a'] }); assertEquals(exact[0].state, 'ready');
});
Deno.test('unattributed or foreign link records cannot create a positive evidence result', async () => {
  const f = fixture(); const note = { ...f.db.CommunicationEntry[0], note_entity: 'CommunicationEntry' };
  const event = { id: 'forged', action: 'Link', shift_id: 'shift-a', tenant_id: 'a', note_entity: 'CommunicationEntry', note_id: note.id, shift_hash: await evidenceHash(shiftEvidenceSnapshot(f.db.Shift[0])), note_hash: await evidenceHash(noteEvidenceSnapshot(note)) };
  assertEquals((await assessServiceEvidence(f.db.Shift, [note], [event], 'a'))[0].state, 'invalid');
  assertEquals((await assessServiceEvidence(f.db.Shift, [note], [{ ...event, tenant_id: 'b' }], 'a'))[0].state, 'unlinked');
});
