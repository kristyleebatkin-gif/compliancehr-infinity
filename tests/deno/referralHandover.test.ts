// Behavioural tests for the referral -> intake handover server logic.
//   deno test --no-config --no-lock -A tests/deno/referralHandover.test.ts
// Synthetic in-memory repositories only: no live Base44 record is read or written.

import { assert, assertEquals, assertRejects } from 'jsr:@std/assert@1';
import {
  HandoverError,
  handoverReferralToIntake,
  nextCaseNumber,
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
      if ('$in' in expected) return (expected as Rec).$in.includes(actual);
      return false;
    }
    return actual === expected;
  });
}

function fakeDb(options: Rec = {}) {
  const tables: Rec = { Referral: [], IntakeCase: [], ReferralIntakeLink: [], StatusLog: [] };
  const writes: Rec[] = [];
  let seq = 0;

  const entity = (name: string) => ({
    get: async (id: string) => {
      const row = tables[name].find((r: Rec) => r.id === id);
      if (!row) {
        const error: any = new Error('not found');
        error.status = 404;
        throw error;
      }
      return { ...row };
    },
    filter: async (query: Rec = {}, opts: Rec = {}) => {
      const rows = tables[name].filter((r: Rec) => matches(r, query));
      // Raw SDK contract: an array, options ignored.
      if (options.arrayContract || !opts || !Object.keys(opts).length) return rows.map((r: Rec) => ({ ...r }));
      const limit = Number(opts.limit || 50);
      const start = opts.cursor ? Number(opts.cursor) : 0;
      const items = rows.slice(start, start + limit).map((r: Rec) => ({ ...r }));
      const hasMore = options.endless ? true : start + limit < rows.length;
      return { items, has_more: hasMore, next_cursor: hasMore ? String(start + limit) : null };
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
    tables,
    writes,
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
  };
}

const run = (db: ReturnType<typeof fakeDb>, user: Rec = USER, referralId = 'ref1') =>
  handoverReferralToIntake({ entities: db.entities, user, referralId, now: NOW });

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
  const existing = db.seedCase({ case_number: 'PIC-0042' });
  db.seedReferral({ intake_case_id: existing.id, intake_case_number: 'PIC-0042' });
  const result = await run(db);
  assertEquals(result.state, 'already_linked');
  assertEquals(result.caseNumber, 'PIC-0042');
  assertEquals(db.tables.IntakeCase.length, 1);
  assertEquals(db.writes.length, 0);
});

Deno.test('a name match without a date of birth is a review flag, never a merge', async () => {
  const db = fakeDb();
  db.seedCase({ case_number: 'PIC-0003', applicant_name: 'Alex Example', date_of_birth: '', status: 'Draft' });
  db.seedReferral({});
  const result = await run(db);
  assertEquals(result.state, 'linked');
  assertEquals(result.nameMatchReview, true);
  assertEquals(result.possibleDuplicateOf, '');
  assertEquals(db.tables.IntakeCase.length, 2, 'both people keep their own case');
});

Deno.test('a same name and date of birth is flagged with the other case number', async () => {
  const db = fakeDb();
  db.seedCase({ case_number: 'PIC-0005', applicant_name: 'Alex Example', date_of_birth: '1990-04-02', status: 'Ready for Review' });
  db.seedReferral({});
  const result = await run(db);
  assertEquals(result.possibleDuplicateOf, 'PIC-0005');
  assertEquals(db.tables.IntakeCase.length, 2);
});

Deno.test('the new case carries server-derived provenance, tenant and identity', async () => {
  const db = fakeDb();
  db.seedReferral({});
  const result = await run(db, { ...USER, full_name: 'Sherelle Dalton' });
  assertEquals(result.caseNumber, 'PIC-0001');
  const created = db.tables.IntakeCase[0];
  assertEquals(created.tenant_id, 't1');
  assertEquals(created.applicant_name, 'Alex Example');
  assertEquals(created.address, '1 Test Street, 4870');
  assertEquals(created.referral_source, 'Referral REF-0007 — Jane Referrer — Support Coordinator');
  assertEquals(created.referral_date, '2026-11-14');
  assertEquals(created.assigned_to, 'Sherelle Dalton');
  assertEquals(created.status, 'Draft');
  const referral = db.tables.Referral[0];
  assertEquals(referral.intake_case_id, created.id);
  assertEquals(referral.intake_case_number, 'PIC-0001');
  assertEquals(referral.status, 'In Progress');
  assert(referral.status_log.includes('Intake case PIC-0001'));
  assertEquals(db.tables.StatusLog.length, 1);
  assertEquals(db.tables.ReferralIntakeLink[0].state, 'linked');
});

Deno.test('the reference scan reads every page, so numbering does not collide past 500 records', async () => {
  const db = fakeDb();
  for (let i = 1; i <= 2050; i += 1) {
    db.seedCase({ case_number: `PIC-${String(i).padStart(4, '0')}` });
  }
  db.seedReferral({});
  const result = await run(db);
  assertEquals(result.caseNumber, 'PIC-2051');
  assertEquals(db.tables.IntakeCase.length, 2051);
});

Deno.test('a raw array response is handled and does not loop', async () => {
  const db = fakeDb({ arrayContract: true });
  db.seedCase({ case_number: 'PIC-0004' });
  db.seedReferral({});
  const result = await run(db);
  assertEquals(result.caseNumber, 'PIC-0005');
});

Deno.test('an unreadable reference scan blocks creation instead of guessing a number', async () => {
  const db = fakeDb({ endless: true });
  db.seedReferral({});
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.status, 409);
  assertEquals(error.code, 'REFERENCE_SCAN_INCOMPLETE');
  assertEquals(db.tables.IntakeCase.length, 0);
});

Deno.test('a failure to link is reported as pending and a retry links instead of duplicating', async () => {
  const flags: Rec = { failReferralUpdate: true };
  const db = fakeDb(flags);
  db.seedReferral({});
  const first = await run(db);
  assertEquals(first.state, 'created_link_pending');
  assertEquals(first.retryable, true);
  assertEquals(db.tables.IntakeCase.length, 1);

  // Second attempt with the link now writable: same reserved case, no duplicate.
  flags.failReferralUpdate = false;
  const retry = await run(db);
  assertEquals(retry.state, 'linked');
  assertEquals(retry.caseNumber, first.caseNumber);
  assertEquals(db.tables.IntakeCase.length, 1, 'the retry must not create a second case');
});

Deno.test('a case created but never linked is recovered on retry', async () => {
  const db = fakeDb();
  const orphan = db.seedCase({ case_number: 'PIC-0008', applicant_name: 'Alex Example', status: 'Draft' });
  db.tables.ReferralIntakeLink.push({ id: 'link1', tenant_id: 't1', referral_id: 'ref1', case_number: 'PIC-0008', state: 'creating' });
  db.seedReferral({});
  const result = await run(db);
  assertEquals(result.state, 'linked');
  assertEquals(result.caseId, orphan.id);
  assertEquals(db.tables.IntakeCase.length, 1);
  assertEquals(db.tables.Referral[0].intake_case_id, orphan.id);
});

Deno.test('an audit-log failure never reports the handover as failed', async () => {
  const db = fakeDb({ failStatusLog: true });
  db.seedReferral({});
  const result = await run(db);
  assertEquals(result.state, 'linked_audit_pending');
  assertEquals(result.retryable, false);
  assert(result.message.includes('linked'));
  assertEquals(db.tables.Referral[0].intake_case_id, db.tables.IntakeCase[0].id);
});

Deno.test('a refused case write leaves the reserved number reusable and creates nothing', async () => {
  const db = fakeDb({ failCaseCreate: true });
  db.seedReferral({});
  const error: any = await assertRejects(() => run(db), HandoverError);
  assertEquals(error.status, 500);
  assertEquals(error.code, 'CASE_CREATE_FAILED');
  assertEquals(db.tables.IntakeCase.length, 0);
  assertEquals(db.tables.ReferralIntakeLink.length, 1);
  assertEquals(db.tables.ReferralIntakeLink[0].case_number, 'PIC-0001');
});