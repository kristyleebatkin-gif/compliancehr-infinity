// Behaviour tests for the connected journey gates (B–E).
// Synthetic records only: no app data, no network, no writes.
import {
  assessBillingBoard,
  assessDocumentRelease,
  assessIncidentFollowUp,
  assessRosterEligibility,
  buildBillingLines,
  guardDocumentEdit,
  nextVersionLabel,
  noteKey,
  partitionBillable,
} from '../../base44/shared/connectedJourneys.ts';

const assert = (cond: unknown, message: string) => {
  if (cond) return;
  throw new Error(message);
};
const eq = (actual: unknown, expected: unknown, message: string) =>
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message} — expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
  );

const codes = (gate: { blockers: { code: string }[] }) => gate.blockers.map((b) => b.code);

// ---------------------------------------------------------------------------
// Journey B — roster → attendance → note → approved billing
// ---------------------------------------------------------------------------

const shift = (over = {}) => ({
  id: 'shift_1',
  participant_name: 'Synthetic Participant',
  date: '2026-11-10',
  start_time: '09:00',
  end_time: '11:30',
  break_minutes: 30,
  billable_rate: 60,
  status: 'Completed',
  approval_status: 'Approved',
  clock_in: '09:02',
  clock_out: '11:28',
  invoiced: false,
  ...over,
});

Deno.test('B: a completed, approved, notated shift is billable', () => {
  const rows = assessBillingBoard({ shifts: [shift()], noteKeys: [noteKey('Synthetic Participant', '2026-11-10')] });
  eq(rows[0].state, 'ready', 'shift with all evidence should be ready');
  eq(rows[0].amount, 120, 'two hours at $60 should be $120');
  eq(rows[0].blockers, [], 'no blockers expected');
});

Deno.test('B: missing service note blocks billing', () => {
  const rows = assessBillingBoard({ shifts: [shift()], noteKeys: [] });
  eq(rows[0].state, 'blocked', 'shift without a note must be blocked');
  assert(codes(rows[0]).includes('note_missing'), 'note_missing blocker expected');
});

Deno.test('B: pending, rejected and unrecorded approval all block billing', () => {
  for (const approval_status of ['Pending Approval', 'Rejected', '', 'Something']) {
    const rows = assessBillingBoard({
      shifts: [shift({ approval_status })],
      noteKeys: [noteKey('Synthetic Participant', '2026-11-10')],
    });
    eq(rows[0].state, 'blocked', `approval "${approval_status}" must block`);
  }
  // "Not Required" is a real approval outcome and must pass.
  const rows = assessBillingBoard({
    shifts: [shift({ approval_status: 'Not Required' })],
    noteKeys: [noteKey('Synthetic Participant', '2026-11-10')],
  });
  eq(rows[0].state, 'ready', '"Not Required" approval should be billable');
});

Deno.test('B: an uncompleted or missed service is never billable', () => {
  for (const status of ['Scheduled', 'In Progress', 'Missed', 'Cancelled']) {
    const rows = assessBillingBoard({
      shifts: [shift({ status })],
      noteKeys: [noteKey('Synthetic Participant', '2026-11-10')],
    });
    eq(rows[0].state, 'blocked', `status "${status}" must be blocked`);
  }
});

Deno.test('B: an already invoiced shift is complete and cannot be billed again', () => {
  const rows = assessBillingBoard({
    shifts: [shift({ invoiced: true, invoice_id: 'inv_9' })],
    noteKeys: [noteKey('Synthetic Participant', '2026-11-10')],
  });
  eq(rows[0].state, 'complete', 'invoiced shift should be complete');
  assert(rows[0].blockers[0].label.includes('inv_9'), 'existing invoice should be named');
  const partition = partitionBillable(rows, ['shift_1']);
  eq(partition.billable, [], 'no shift may be selected for re-billing');
  eq(partition.skipped.length, 1, 'the shift must be reported as skipped');
});

Deno.test('B: invoice lines retain the originating service id', () => {
  const lines = buildBillingLines([shift(), shift({ id: 'shift_2', start_time: '23:00', end_time: '01:00', break_minutes: 0 })]);
  eq(lines.map((l) => l.shift_id), ['shift_1', 'shift_2'], 'service ids must be preserved');
  eq(lines[1].hours, 2, 'a shift crossing midnight should still compute hours');
});

Deno.test('B: partition only hands ready shifts to billing and reports the rest', () => {
  const rows = assessBillingBoard({
    shifts: [shift(), shift({ id: 'shift_2', approval_status: 'Pending Approval' })],
    noteKeys: [noteKey('Synthetic Participant', '2026-11-10')],
  });
  const partition = partitionBillable(rows, ['shift_1', 'shift_2', 'shift_missing']);
  eq(partition.billable, ['shift_1'], 'only the ready shift is billable');
  eq(partition.skipped.map((s) => s.shift_id), ['shift_2'], 'blocked shift must be skipped');
  eq(partition.notFound, ['shift_missing'], 'unknown ids must be reported, not billed');
});

Deno.test('B: missing clock times are surfaced as an unknown, not a false blocker', () => {
  const rows = assessBillingBoard({
    shifts: [shift({ clock_in: '', clock_out: '' })],
    noteKeys: [noteKey('Synthetic Participant', '2026-11-10')],
  });
  eq(rows[0].state, 'ready', 'completion is evidenced by status, so billing may proceed');
  assert(rows[0].unknowns.some((u) => u.includes('Attendance')), 'attendance gap must be visible');
});

// ---------------------------------------------------------------------------
// Journey C — incident → action → effectiveness before closure
// ---------------------------------------------------------------------------

const incident = (over = {}) => ({ id: 'inc_1', status: 'Action Required', owner: 'Synthetic Manager', ...over });
const action = (over = {}) => ({
  id: 'act_1',
  title: 'Add manual handling control',
  owner: 'Synthetic Manager',
  target_date: '2026-11-30',
  status: 'Closed',
  effectiveness_result: 'Effective',
  effectiveness_evidence: 'Spot audit 12 Nov',
  closure_approved_by: 'Synthetic Manager',
  ...over,
});

Deno.test('C: an incident with no corrective action cannot be closed', () => {
  const gate = assessIncidentFollowUp({ incident: incident(), actions: [], riskLinked: true });
  eq(gate.state, 'blocked', 'no linked action must block closure');
  assert(codes(gate).includes('no_action'), 'no_action blocker expected');
});

Deno.test('C: an open corrective action blocks closure', () => {
  const gate = assessIncidentFollowUp({ incident: incident(), actions: [action({ status: 'Implementing' })], riskLinked: true });
  eq(gate.state, 'blocked', 'open action must block closure');
  assert(codes(gate).includes('action_open'), 'action_open blocker expected');
});

Deno.test('C: a closed action without effectiveness review blocks closure', () => {
  const gate = assessIncidentFollowUp({
    incident: incident(),
    actions: [action({ effectiveness_result: 'Not Reviewed', effectiveness_evidence: '' })],
    riskLinked: true,
  });
  eq(gate.state, 'blocked', 'unevidenced effectiveness must block closure');
  assert(codes(gate).includes('effectiveness_missing'), 'effectiveness_missing expected');
  assert(codes(gate).includes('effectiveness_evidence_missing'), 'evidence blocker expected');
});

Deno.test('C: missing owner or target date on an action blocks closure', () => {
  const gate = assessIncidentFollowUp({
    incident: incident(),
    actions: [action({ owner: '', target_date: '' })],
    riskLinked: true,
  });
  assert(codes(gate).includes('action_owner_missing'), 'owner blocker expected');
  assert(codes(gate).includes('action_target_missing'), 'target blocker expected');
});

Deno.test('C: fully evidenced and approved actions make closure ready', () => {
  const gate = assessIncidentFollowUp({ incident: incident(), actions: [action()], riskLinked: true });
  eq(gate.state, 'ready', 'evidenced action should permit closure');
  eq(gate.blockers, [], 'no blockers expected');
});

Deno.test('C: an unlinked risk is an explicit unknown, not a silent pass', () => {
  const gate = assessIncidentFollowUp({ incident: incident(), actions: [action()], riskLinked: false });
  eq(gate.state, 'ready', 'risk link does not block closure');
  assert(gate.unknowns.some((u) => u.includes('risk')), 'missing risk link must be visible');
});

Deno.test('C: a closed incident is reported complete', () => {
  const gate = assessIncidentFollowUp({ incident: incident({ status: 'Closed' }), actions: [], riskLinked: true });
  eq(gate.state, 'complete', 'closed incident is complete');
});

// ---------------------------------------------------------------------------
// Journey D — recorded checks → shift eligibility
// ---------------------------------------------------------------------------

const staff = (over = {}) => ({ id: 'staff_1', full_name: 'Synthetic Worker', status: 'Active', induction_date: '2026-01-05', ...over });
const screening = (over = {}) => ({
  screening_type: 'NDIS Worker Screening',
  status: 'Current',
  verification_date: '2026-02-01',
  verification_reference: 'REF-1',
  expiry_date: '2029-02-01',
  ...over,
});

Deno.test('D: current recorded evidence yields ready', () => {
  const gate = assessRosterEligibility({
    staff: staff(),
    screening: [screening()],
    certificates: [{ module_title: 'First Aid', status: 'Current', expiry_date: '2027-05-01' }],
    training: [{ module_title: 'Induction', status: 'Completed' }],
    today: '2026-11-14',
  });
  eq(gate.state, 'ready', 'current evidence should be ready');
});

Deno.test('D: expired screening blocks eligibility', () => {
  const gate = assessRosterEligibility({
    staff: staff(),
    screening: [screening({ expiry_date: '2026-09-01' })],
    training: [{ module_title: 'Induction', status: 'Completed' }],
    today: '2026-11-14',
  });
  eq(gate.state, 'blocked', 'expired screening must block');
  assert(codes(gate).includes('screening_expired'), 'screening_expired blocker expected');
});

Deno.test('D: no recorded evidence is incomplete, never ready', () => {
  const gate = assessRosterEligibility({ staff: staff(), screening: [], certificates: [], training: [], today: '2026-11-14' });
  eq(gate.state, 'incomplete', 'silence must not certify eligibility');
  assert(gate.unknowns.some((u) => u.includes('screening')), 'missing screening must be stated');
});

Deno.test('D: an inactive employee is blocked regardless of evidence', () => {
  const gate = assessRosterEligibility({
    staff: staff({ status: 'Inactive' }),
    screening: [screening()],
    training: [{ module_title: 'Induction', status: 'Completed' }],
    today: '2026-11-14',
  });
  eq(gate.state, 'blocked', 'inactive employee must be blocked');
  assert(codes(gate).includes('staff_not_active'), 'staff_not_active blocker expected');
});

Deno.test('D: a not-competent assessment blocks eligibility', () => {
  const gate = assessRosterEligibility({
    staff: staff(),
    screening: [screening({ record_type: 'Competency Assessment', screening_type: 'Not Applicable', assessment_outcome: 'Not Competent', competency_area: 'Manual handling' })],
    training: [{ module_title: 'Induction', status: 'Completed' }],
    today: '2026-11-14',
  });
  eq(gate.state, 'blocked', 'not competent must block');
  assert(codes(gate).includes('not_competent'), 'not_competent blocker expected');
});

Deno.test('D: expiring evidence is reported without being called a failure', () => {
  const gate = assessRosterEligibility({
    staff: staff(),
    screening: [screening({ expiry_date: '2026-12-01' })],
    training: [{ module_title: 'Induction', status: 'Completed' }],
    today: '2026-11-14',
  });
  eq(gate.state, 'incomplete', 'expiring evidence is an unknown, not a blocker');
  assert(gate.unknowns.some((u) => u.includes('expires within')), 'expiry warning expected');
});

// ---------------------------------------------------------------------------
// Journey E — approval → acknowledgement → controlled revision
// ---------------------------------------------------------------------------

const doc = (over = {}) => ({
  id: 'doc_1',
  title: 'Synthetic Policy',
  document_id: 'POL-1',
  version: '2.0',
  status: 'Approved',
  approved_by: 'Synthetic Approver',
  approval_date: '2026-10-01',
  file_url: 'https://example.invalid/policy.pdf',
  ...over,
});

Deno.test('E: a draft cannot be acknowledged', () => {
  const gate = assessDocumentRelease({ document: doc({ status: 'Draft' }), acknowledged: false });
  eq(gate.state, 'blocked', 'draft must be blocked');
  assert(codes(gate).includes('not_approved'), 'not_approved blocker expected');
});

Deno.test('E: an approved document without approver evidence is blocked', () => {
  const gate = assessDocumentRelease({ document: doc({ approved_by: '', approval_date: '' }), acknowledged: false });
  eq(gate.state, 'blocked', 'missing approval evidence must block');
  assert(codes(gate).includes('approval_evidence_missing'), 'approval evidence blocker expected');
  assert(codes(gate).includes('approval_date_missing'), 'approval date blocker expected');
});

Deno.test('E: an evidenced approved version is ready to acknowledge', () => {
  eq(assessDocumentRelease({ document: doc(), acknowledged: false }).state, 'ready', 'approved version should be ready');
  eq(assessDocumentRelease({ document: doc(), acknowledged: true }).state, 'complete', 'already acknowledged is complete');
});

Deno.test('E: version labels advance without losing the approved version', () => {
  eq(nextVersionLabel('1.0'), '1.1', 'minor bump');
  eq(nextVersionLabel('2.3'), '2.4', 'minor bump on existing minor');
  eq(nextVersionLabel(''), '1.1', 'empty version starts at 1.1');
});

Deno.test('E: editing an approved version is refused so the approved copy stays intact', () => {
  const blocked = guardDocumentEdit({ document: doc(), changes: { file_url: 'x' } });
  assert(blocked.some((b) => b.code === 'approved_version_locked'), 'approved edit must be refused');
  const allowed = guardDocumentEdit({ document: doc(), changes: { review_date: '2027-10-01' } });
  eq(allowed, [], 'review scheduling is not a content edit');
  const draft = guardDocumentEdit({ document: doc({ status: 'Draft' }), changes: { file_url: 'x' } });
  eq(draft, [], 'drafts may be edited');
});