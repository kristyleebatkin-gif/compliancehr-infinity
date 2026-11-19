import assert from 'node:assert/strict';
import test from 'node:test';
import { rpFlags, rpSummary } from '../lib/restrictivePractice.js';

const today = '2026-11-19';
const keys = (r) => rpFlags(r, today).map((f) => f.key);

test('fully authorised, reported use with a plan has no flags', () => {
  assert.deepEqual(keys({ authorisation_status: 'Authorised', authorisation_expiry: '2027-06-30', behaviour_support_plan_reference: 'BSP-1', reported_to_regulator: true, reduction_actions: 'Fade over 12 weeks' }), []);
});

test('missing authorisation is an unauthorised use', () => {
  assert.ok(keys({}).includes('unauthorised'));
  assert.ok(keys({ authorisation_status: 'Unauthorised', authorisation_reference: 'X' }).includes('unauthorised'));
});

test('expired and expiring authorisations are flagged', () => {
  assert.ok(keys({ authorisation_status: 'Authorised', authorisation_expiry: '2026-11-01' }).includes('expired'));
  assert.ok(keys({ authorisation_status: 'Authorised', authorisation_expiry: '2026-12-10' }).includes('expiring'));
  assert.ok(!keys({ authorisation_status: 'Authorised', authorisation_expiry: '2027-02-01' }).includes('expiring'));
});

test('aged care uses do not need an NDIS behaviour support plan', () => {
  assert.ok(!keys({ sector: 'Aged Care' }).includes('no-bsp'));
  assert.ok(keys({ sector: 'NDIS' }).includes('no-bsp'));
});

test('summary counts this month and each flag', () => {
  const s = rpSummary([{ record_date: '2026-11-03' }, { record_date: '2026-10-03', authorisation_status: 'Authorised', authorisation_expiry: '2026-11-25', reported_to_regulator: true }], today);
  assert.equal(s.total, 2);
  assert.equal(s.this_month, 1);
  assert.equal(s.unauthorised, 1);
  assert.equal(s.expiring, 1);
  assert.equal(s.unreported, 1);
});
