// Behavioural tests for the referral -> intake handover server logic.
//   deno test --no-config --no-lock -A tests/deno/referralHandover.test.ts
// Synthetic in-memory repositories only: no live Base44 record is read or written.
//
// The public entry point is released OFF. Its refusal is tested against a proxy that
// fails on any access, so "refuses before data access" is proven, not asserted. All
// behaviour tests drive performHandover, the logic the release gate guards.

import { assert, assertEquals, assertRejects } from 'jsr:@std/assert@1';
import {
  HANDOVER_ENABLED,
  HANDOVER_RELEASE,
  HandoverError,
  handoverReferralToIntake,
  nextCaseNumber,
  performHandover,
} from '../../base44/shared/referralHandover.ts';

type Rec = Record<string, any>;
const NOW = new Date('2026-11-14T02:30:00Z'); // 12:30 on 14 Nov in Brisbane

const USER: Rec = {
  id: 'u-intake',
  email: 'intake@example.test',
  full_name: 'Intake Officer',
  role: 'Intake Officer',
  account_status: 'Active',
  access_approved: true,
  tenant_id: 't1',
};

const REFERRAL: Rec = {
  id: 'ref1',
  tenant_id: 't1',
  referral_id: 'REF-0007',
  client_name: 'Alex Example',
  date_of_birth: '1990-04-02',
  phone: '0400 000 000',
  email: 'alex@example.test',
  address: '1 Test Street',
  postcode: '4870',
  reason: 'Needs support',
  support_needs: 'Daily living',
  consent: 'Consent given',
  status: 'Accepted',
  referrer_name: 'Jane Referrer',
  referrer_role: 'Support Coordinator',
};

function matches(row: Rec, query: Rec) {
  return Object.entries(query).every(([key, expected]) => {
    const actual = row[key];
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$in' in (expected as Rec)) return (expected as Rec).$in.includes(actual);
      return false;
    }
    return actual === expected;
  });
}

// Mirrors the SDK contract this module relies on, taken from
// @base44/sdk/dist/modules/entities.js: filter(query, sort, limit, skip) -> plain array.
// The failure modes below (a page cap, a repeated page, a non-array body) are the ones
// a real server can produce, and each must be refused rather than read as "no more data".
function fakeDb(options: Rec = {}) {
  const tables: Rec = { Referral: [], IntakeCase: [], ReferralIntakeLink: [], StatusLog: [] };
  const writes: Rec[] = [];
  const reads: string[] = [];
  let seq = 0;

  const entity = (name: string) => ({
    get: async (id: string) => {
      reads.push(`${name}.get`);
      const row = tables[name].find((r: Rec) => r.id === id);
      if (!row) {
        const error: any = new Error('not found');
        error.status = 404;
        throw error;
      }
      return { ...row };
    },
    filter: async (query: Rec = {}, _sort?: string, limit?: number, skip?: number) => {
      reads.push(`${name}.filter`);
      if (options.malformed && name === 'IntakeCase') return { items: [] };
      const rows = tables[name].filter((r: Rec) => matches(r, query));
      const asked = Number(limit) || 50;
      const size = options.pageCap ? Math.min(asked, options.pageCap) : asked;
      if (options.repeatPage && rows.length > size) return rows.slice(0, size).map((r: Rec) => ({ ...r }));
      const start = Number(skip) || 0;
      return rows.slice(start, start + size).map((r: Rec) => ({ ...r }));
    },
    create: async (payload: Rec) => {
      if (name === 'IntakeCase' && options.failCaseCreate) throw new Error('case write refused');
      if (name === 'StatusLog' && options.failStatusLog) throw new Error('audit write refused');
      // The scoped proxy stamps the business on every write; simulated here.
      const row = { id: `${name}-${++seq}`, tenant_id: options.tenantId || 't1', ...payload };
      writes.push({ entity: name, payload: { ...payload } });
      tables[name].push(row);
      return { ...row };
    },
    update: async (id: string, patch: Rec) => {
      if (name === 'Referral' && options.failReferralUpdate) throw new Error('referral update refused');
      const row = tables[name].find((r: Rec) => r.id === id);
      if (!row) {
        const error: any = new Error('not found');
        error.status = 404;
        throw error;
      }
      Object.assign(row, patch);
      return { ...row };
    },
  });

  return {
    options,
    tables,
    writes,
    reads,
    entities: { Referral: entity('Referral'), IntakeCase: entity('IntakeCase'), ReferralIntakeLink: entity('ReferralIntakeLink'), StatusLog: entity('StatusLog') },
    seedCase(payload: Rec) {
      const row = { id: `seed-${++seq}`, tenant_id: 't1', intake_type: 'Participant', status: 'Draft', ...payload };
      tables.IntakeCase.push(row);
      return row;
    },
    seedReferral(payload: Rec) {
      const row = { ...REFERRAL, ...payload };
      tables.Referral.push(row);
      return row;
    },
    seedLink(payload: Rec) {
      const row = { id: `link-${++seq}`, tenant_id: 't1', state: 'creating', ...payload };
      tables.ReferralIntakeLink.push(row);
      return row;
    },
  };
}

const run = (db: ReturnType<typeof fakeDb>, user: Rec = USER, referralId = 'ref1') =>
  performHandover({ entities: db.entities, user, referralId, now: NOW });

Deno.test('the released feature is switched off with an explicit, named state', () => {
  assertEquals(HANDOVER_ENABLED, false);
  assertEquals(HANDOVER_RELEASE, 'disabled_pending_concurrency_verification');
});

Deno.test('the public entry point refuses before it touches any record', async () => {
  let accesses = 0;
  const entities = new Proxy({}, {
    get() {
      accesses += 1;
      throw new Error('data was accessed before the release gate');
    },
  });
  const error: any = await assertRejects(
    () => handoverReferralToIntake({ entities, user: USER, referralId: 'ref1', now: NOW }),
    HandoverError,
  );
  assertEquals(error.status, 503);
  assertEquals(error.code, 'HANDOVER_PENDING_VERIFICATION');
  assertEquals(accesses, 0);
});

Deno.test('case numbers are allocated above every reserved number', () => {
  assertEquals(nextCaseNumber(['PIC-0001', 'PIC-0009', 'other']), 'PIC-0010');
  assertEquals(nextCaseNumber([]), 'PIC-0001');
});

Deno.test('an unapproved account is refused before any write', async () => {
  const db = fakeDb();
  db.seedReferral({});
  for (const user of [
    { ...USER, access_approved: false },
    { ...USER, account_status: 'Suspended' },
    { ...USER, access_approved: undefined },
  ]) {
    const error: any = await assertRejects(() => run(db, user), HandoverError);
    assertEquals(error.status, 403);
    assertEquals(error.code, 'ACCOUNT_NOT_APPROVED');
  }
  assertEquals(db.writes.length, 0);
});

Deno.test('a role without intake rights is refused before any write', async () => {
  const db = fakeDb();
  db.seedReferral({});
  const error: any = await assertRejects(() => run(db, { ...USER, role: 'Support Worker' }), HandoverError);
  assertEquals(error.status, 403);
  assertEquals(error.code, 'ROLE_NOT_PERMITTED');
  assertEquals(db.writes.length, 0);
});

Deno.test("another business's referral is refused", async () => {
  const db = fakeDb();
  db.seedReferral({ tenant_id: 't9' });
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.status, 403);
  assertEquals(error.code, 'CROSS_BUSINESS');
  assertEquals(db.writes.length, 0);
});

Deno.test('a referral with no business tag is refused, not guessed at', async () => {
  const db = fakeDb();
  db.seedReferral({ tenant_id: undefined });
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.status, 409);
  assertEquals(error.code, 'RECORD_UNTAGGED');
  assertEquals(db.writes.length, 0);
});

Deno.test('a missing referral is a 404, not an empty success', async () => {
  const db = fakeDb();
  const error: any = await assertRejects(() => run(db, USER, 'nope'), HandoverError);
  assertEquals(error.status, 404);
  assertEquals(error.code, 'REFERRAL_NOT_FOUND');
});

Deno.test('no consent means no intake case', async () => {
  const db = fakeDb();
  db.seedReferral({ consent: 'Consent not given' });
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.status, 409);
  assertEquals(error.code, 'CONSENT_MISSING');
  assert(error.details.blockers[0].includes('consent'));
  assertEquals(db.tables.IntakeCase.length, 0);
});

Deno.test('consent is re-checked on recovery, so a retry cannot finish what is now refused', async () => {
  const db = fakeDb();
  const created = db.seedCase({ case_number: 'PIC-0004' });
  const referral = db.seedReferral({ consent: 'Consent not given', status: 'In Progress' });
  db.seedLink({ referral_id: referral.id, case_number: 'PIC-0004', intake_case_id: created.id, state: 'link_pending' });

  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.status, 409);
  assertEquals(error.code, 'CONSENT_MISSING');
  assertEquals(db.writes.length, 0);
  assert(referral.intake_case_id === undefined, 'a refused retry must not link the referral');
});

Deno.test("another business's ledger row cannot drive this business's handover", async () => {
  const db = fakeDb();
  const foreign = db.seedCase({ case_number: 'PIC-0099', tenant_id: 't9' });
  const referral = db.seedReferral({});
  db.seedLink({ referral_id: referral.id, tenant_id: 't9', case_number: 'PIC-0099', intake_case_id: foreign.id, state: 'link_pending' });

  const outcome = await run(db);
  assertEquals(outcome.state, 'linked');
  assert(outcome.caseId !== foreign.id, 'the foreign case must never be linked');
  const own = db.tables.IntakeCase.find((c: Rec) => c.id === outcome.caseId);
  assertEquals(own.tenant_id, 't1');
});

Deno.test('a referral outside the linkable statuses is refused', async () => {
  const db = fakeDb();
  db.seedReferral({ status: 'Draft' });
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.status, 409);
  assertEquals(error.code, 'REFERRAL_NOT_ELIGIBLE');
  assertEquals(db.tables.IntakeCase.length, 0);
});

Deno.test('an already-linked referral creates nothing', async () => {
  const db = fakeDb();
  const linked = db.seedCase({ case_number: 'PIC-0002' });
  db.seedReferral({ intake_case_id: linked.id, intake_case_number: 'PIC-0002', status: 'In Progress' });
  const outcome = await run(db);
  assertEquals(outcome.state, 'already_linked');
  assertEquals(outcome.caseNumber, 'PIC-0002');
  assertEquals(db.writes.length, 0);
});

Deno.test('a name match without a date of birth is a review flag, never a merge', async () => {
  const db = fakeDb();
  db.seedCase({ case_number: 'PIC-0001', applicant_name: 'Alex Example', date_of_birth: '' });
  db.seedReferral({});
  const outcome = await run(db);
  assertEquals(outcome.state, 'linked');
  assertEquals(outcome.nameMatchReview, true);
  assertEquals(outcome.possibleDuplicateOf, '');
  assertEquals(outcome.caseNumber, 'PIC-0002');
});

Deno.test('a same name and date of birth is flagged with the other case number', async () => {
  const db = fakeDb();
  db.seedCase({ case_number: 'PIC-0001', applicant_name: 'Alex Example', date_of_birth: '1990-04-02' });
  db.seedReferral({});
  const outcome = await run(db);
  assertEquals(outcome.possibleDuplicateOf, 'PIC-0001');
  assert(outcome.message.includes('PIC-0002'));
});

Deno.test('the new case carries server-derived provenance, tenant and identity', async () => {
  const db = fakeDb();
  db.seedReferral({ referrer_name: 'Jane Referrer', referrer_role: 'Support Coordinator' });
  await run(db);
  const created = db.tables.IntakeCase[0];
  assertEquals(created.tenant_id, 't1');
  assertEquals(created.referral_source, 'Referral REF-0007 — Jane Referrer — Support Coordinator');
  assertEquals(created.referral_date, '2026-11-14');
  assertEquals(created.assigned_to, 'Intake Officer');
  assertEquals(created.status, 'Draft');
});

Deno.test('the reference scan reads past one full page, so numbering keeps going', async () => {
  const db = fakeDb();
  for (let i = 1; i <= 2050; i += 1) db.seedCase({ case_number: `PIC-${String(i).padStart(4, '0')}` });
  db.seedReferral({});
  const outcome = await run(db);
  assertEquals(outcome.caseNumber, 'PIC-2051');
});

Deno.test('a scan that ends exactly on a full page still finds the end', async () => {
  const db = fakeDb();
  for (let i = 1; i <= 100; i += 1) db.seedCase({ case_number: `PIC-${String(i).padStart(4, '0')}` });
  db.seedReferral({});
  const outcome = await run(db);
  assertEquals(outcome.caseNumber, 'PIC-0101');
});

Deno.test('a non-array (unreadable) response blocks creation instead of reading it as empty', async () => {
  const db = fakeDb({ malformed: true });
  db.seedReferral({});
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.code, 'REFERENCE_SCAN_FAILED');
  assertEquals(db.tables.IntakeCase.length, 0);
  assertEquals(db.writes.length, 0);
});

Deno.test('a server that repeats the same page blocks the handover', async () => {
  const db = fakeDb({ repeatPage: true });
  for (let i = 1; i <= 120; i += 1) db.seedCase({ case_number: `PIC-${String(i).padStart(4, '0')}` });
  db.seedReferral({});
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.code, 'REFERENCE_SCAN_INCOMPLETE');
  assertEquals(db.writes.length, 0);
});

Deno.test('a server that caps pages below the requested size blocks the handover', async () => {
  const db = fakeDb({ pageCap: 40 });
  for (let i = 1; i <= 50; i += 1) db.seedCase({ case_number: `PIC-${String(i).padStart(4, '0')}` });
  db.seedReferral({});
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.code, 'REFERENCE_SCAN_INCOMPLETE');
  assertEquals(db.writes.length, 0);
});

Deno.test('a failure to link is reported as pending and a retry links instead of duplicating', async () => {
  const db = fakeDb({ failReferralUpdate: true });
  db.seedReferral({});
  const first = await run(db);
  assertEquals(first.state, 'created_link_pending');
  assertEquals(first.retryable, true);

  // The same referral, now writable: the reserved number is reused, no second case.
  db.options.failReferralUpdate = false;
  const retry: any = await run(db);
  assertEquals(db.tables.IntakeCase.length, 1);
  assertEquals(retry.caseNumber, first.caseNumber);
  assertEquals(retry.state.startsWith('linked'), true);
});

Deno.test('a case created but never linked is recovered on retry', async () => {
  const db = fakeDb();
  const created = db.seedCase({ case_number: 'PIC-0005' });
  const referral = db.seedReferral({ status: 'Sent' });
  db.seedLink({ referral_id: referral.id, case_number: 'PIC-0005', intake_case_id: created.id, state: 'created' });

  const outcome = await run(db);
  assertEquals(outcome.caseId, created.id);
  assertEquals(outcome.caseNumber, 'PIC-0005');
  assertEquals(db.tables.IntakeCase.length, 1);
});

Deno.test('an audit-log failure never reports the handover as failed', async () => {
  const db = fakeDb({ failStatusLog: true });
  db.seedReferral({});
  const outcome = await run(db);
  assertEquals(outcome.state, 'linked_audit_pending');
  assertEquals(db.tables.Referral[0].status, 'In Progress');
});

Deno.test('a refused case write leaves the reserved number reusable and creates nothing', async () => {
  const db = fakeDb({ failCaseCreate: true });
  db.seedReferral({});
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.code, 'CASE_CREATE_FAILED');
  assertEquals(db.tables.IntakeCase.length, 0);
  assertEquals(db.tables.ReferralIntakeLink.length, 1);
  assertEquals(db.tables.ReferralIntakeLink[0].state, 'creating');
});