// Referral -> intake handover, server-side only.
//
// RELEASE STATE: DISABLED. HANDOVER_ENABLED is false and the public entry point
// refuses before it touches a single record (see the gate at the top of
// handoverReferralToIntake). Nothing is created, linked or changed while it is off.
//
// Security rules this module is written to satisfy:
//  - the caller is never trusted: identity, role, approval and business come from
//    the authenticated user, never from the request body;
//  - the referral is loaded from the database, never taken from the payload;
//  - consent, business membership and existing-link rules are decided here, after
//    the load, and apply to a recovery attempt exactly as they apply to a first one;
//  - every record this module reads or writes is checked against the caller's
//    business here, independently of the tenant-enforcement release flag;
//  - retries never create a second case: a case number is reserved in
//    ReferralIntakeLink before the case is created, so a recovery attempt can find
//    the case again by its reserved number;
//  - the platform cannot give us a transaction, so every partial outcome is
//    reported precisely instead of pretending the whole handover succeeded.
//
// KNOWN ACCEPTANCE BLOCKERS (the reason HANDOVER_ENABLED is false)
//  1. No transaction: two simultaneous first-time handovers for different referrals
//     can reserve the same case number. This is detected afterwards (number_conflict)
//     and reported, never prevented.
//  2. IntakeCase has no source_referral_id field, so recovery identifies a case by
//     the case number reserved in ReferralIntakeLink. That number is unique only in
//     practice, not by constraint. Adding a dedicated field to the IntakeCase schema
//     is the intended fix and must land before this is enabled.
// Both blockers must be closed, and the live walkthrough repeated, before
// HANDOVER_ENABLED becomes true.

import { auDate, auTime } from './reminders.ts';
import { hasAnyRole, hasApprovedAccess } from './systemAuth.ts';

export const REFERRAL_INTAKE_ROLES = ['admin', 'Provider Administrator', 'Intake Officer', 'Administration'];
export const LINKABLE_REFERRAL_STATUSES = ['Prepared', 'Sent', 'Accepted', 'In Progress'];
export const OPEN_CASE_STATUSES = ['Draft', 'Information Required', 'Ready for Review', 'Approved'];

// Released feature switches live here so the server and the screen cannot disagree.
export const HANDOVER_RELEASE = 'disabled_pending_concurrency_verification';
export const HANDOVER_ENABLED = false;
export const HANDOVER_PENDING_MESSAGE =
  'Starting intake from a referral is switched off while the duplicate-case and case-number checks are verified. Referrals and their records are unaffected.';

const PAGE_SIZE = 100;
const MAX_REFERENCE_PAGES = 100; // 100 pages x 100 = 10,000 records, then a safety block rather than a guess

export class HandoverError extends Error {
  status: number;
  code: string;
  details: any;

  constructor(status: number, code: string, message: string, details: any = {}) {
    super(message);
    this.name = 'HandoverError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function nextCaseNumber(numbers: string[], prefix = 'PIC') {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const max = (numbers || []).reduce((acc: number, value: any) => {
    const match = pattern.exec(String(value || ''));
    return match ? Math.max(acc, parseInt(match[1], 10)) : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}

// The installed SDK's entity client has two contracts (verified in
// @base44/sdk/dist/modules/entities.js):
//   filter(query, sort, limit, skip, fields) -> a plain array  (GET /{entity})
//   filter(query, options)                   -> one cursor page (GET /{entity}/v2/list)
// Backend functions run the SDK pinned in tenantScope (0.8.54), so this module
// uses only the positional array form, which every supported version implements.
// A number is only ever allocated from a read that reached the real end of the data.
async function readAll(entities: any, name: string, query: any) {
  const rows: any[] = [];
  const seenPages = new Set<string>();

  const readPage = async (skip: number) => {
    const page = await entities[name].filter(query, '-created_date', PAGE_SIZE, skip);
    if (!Array.isArray(page)) {
      throw new HandoverError(
        500,
        'REFERENCE_SCAN_FAILED',
        'The existing intake case numbers could not be read, so no new case was created. No records were changed.',
      );
    }
    return page;
  };

  let skip = 0;
  for (let pages = 0; pages < MAX_REFERENCE_PAGES; pages += 1) {
    const page = await readPage(skip);
    const signature = page.map((row: any) => String(row?.id ?? '')).join('|');
    if (page.length && seenPages.has(signature)) {
      // The server returned the same page twice: skip/sort is not being honoured,
      // so the rest of the data is unknown. Refuse instead of guessing a number.
      throw new HandoverError(
        409,
        'REFERENCE_SCAN_INCOMPLETE',
        'The existing intake case numbers could not be read completely, so no new case was created. No records were changed.',
      );
    }
    seenPages.add(signature);
    rows.push(...page);
    skip += page.length;

    if (page.length < PAGE_SIZE) {
      // A short page is only the end of the data if nothing follows it. If the
      // server caps pages below PAGE_SIZE, this probe returns records and the scan
      // is refused rather than silently truncated.
      if ((await readPage(skip)).length) {
        throw new HandoverError(
          409,
          'REFERENCE_SCAN_INCOMPLETE',
          'The existing intake case numbers could not be read completely, so no new case was created. No records were changed.',
        );
      }
      return rows;
    }
  }

  throw new HandoverError(
    409,
    'REFERENCE_SCAN_INCOMPLETE',
    'The existing intake case numbers could not be read completely, so no new case was created. No records were changed.',
  );
}

// Small, bounded reads use the same positional contract and never fall back to an
// empty list on a malformed response: "not found" and "could not read" are different.
async function readFew(entities: any, name: string, query: any, limit = 5) {
  const rows = await entities[name].filter(query, '-created_date', limit);
  if (!Array.isArray(rows)) {
    throw new HandoverError(
      500,
      'REFERENCE_SCAN_FAILED',
      'Existing records could not be read, so no case was created. No records were changed.',
    );
  }
  return rows;
}

export function referralProvenance(referral: any) {
  const referrer = [referral?.referrer_name, referral?.referrer_role].filter(Boolean).join(' — ');
  return [`Referral ${referral?.referral_id || referral?.id || ''}`.trim(), referrer].filter(Boolean).join(' — ');
}

export function handoverBlockers(referral: any) {
  const blockers: string[] = [];
  if (!referral) return ['That referral no longer exists.'];
  if (!String(referral.client_name || '').trim()) blockers.push('The referral has no person named.');
  if (referral.consent !== 'Consent given') blockers.push('Client consent has not been recorded on this referral, so an intake case cannot be opened.');
  if (referral.intake_case_id || referral.intake_case_number) blockers.push('This referral is already linked to an intake case.');
  if (!LINKABLE_REFERRAL_STATUSES.includes(referral.status)) {
    blockers.push(`Referral status is "${referral.status}". Move it to Prepared, Sent, Accepted or In Progress before starting intake.`);
  }
  return blockers;
}

// Business membership is checked here for every record, whether or not the tenant
// enforcement flag is on (the scoped client already applies it; this is the
// independent check the handover relies on).
function requireSameBusiness(record: any, businessId: string, what: string) {
  if (!record) return;
  const tag = record.tenant_id ?? record.data?.tenant_id ?? null;
  if (!tag) {
    throw new HandoverError(409, 'RECORD_UNTAGGED', `${what} is not tagged to a business, so the handover was refused. No records were changed.`);
  }
  if (tag !== businessId) {
    throw new HandoverError(403, 'CROSS_BUSINESS', `${what} belongs to another business.`);
  }
}

async function getOrNull(entity: any, id: string) {
  if (!id) return null;
  const record = await entity.get(id).catch((error: any) => (error?.status === 404 ? null : Promise.reject(error)));
  return record || null;
}

export interface HandoverInput {
  entities: any;
  user: any;
  referralId: string;
  now?: Date;
  tenantId?: string | null;
}

// Public entry point. Refuses before any data access while the release is off.
export async function handoverReferralToIntake(input: HandoverInput) {
  if (!HANDOVER_ENABLED) {
    throw new HandoverError(503, 'HANDOVER_PENDING_VERIFICATION', HANDOVER_PENDING_MESSAGE);
  }
  return await performHandover(input);
}

// The handover itself. Exported for tests only; the public path is gated above.
export async function performHandover({ entities, user, referralId, now = new Date(), tenantId = null }: HandoverInput) {
  if (!hasApprovedAccess(user)) {
    throw new HandoverError(403, 'ACCOUNT_NOT_APPROVED', 'This account is not approved and active, so it cannot open intake cases.');
  }
  if (!hasAnyRole(user, REFERRAL_INTAKE_ROLES)) {
    throw new HandoverError(403, 'ROLE_NOT_PERMITTED', 'Your role cannot open intake cases.');
  }
  const businessId = tenantId || user?.tenant_id || user?.data?.tenant_id || null;
  if (!businessId) throw new HandoverError(403, 'NO_BUSINESS', 'This account is not linked to a business.');

  const referral = await getOrNull(entities.Referral, String(referralId || ''));
  if (!referral) throw new HandoverError(404, 'REFERRAL_NOT_FOUND', 'That referral no longer exists.');
  // Untagged referrals are refused outright: without a business tag there is no way
  // to prove this caller may act on it, and no honest way to file the case.
  requireSameBusiness(referral, businessId, 'That referral');

  const changedBy = String(user?.full_name || user?.email || '').trim() || 'Unknown user';

  // Consent is decided before anything is read for recovery, so a retry can never
  // complete a handover the caller would not be allowed to start today.
  if (referral.consent !== 'Consent given') {
    throw new HandoverError(409, 'CONSENT_MISSING', 'Client consent has not been recorded on this referral, so an intake case cannot be opened.', {
      blockers: handoverBlockers(referral),
    });
  }

  // 1. Already linked: nothing to create, nothing to change.
  if (referral.intake_case_id) {
    const linked = await getOrNull(entities.IntakeCase, referral.intake_case_id);
    if (linked) {
      requireSameBusiness(linked, businessId, 'The linked intake case');
      return {
        state: 'already_linked',
        caseId: linked.id,
        caseNumber: linked.case_number || referral.intake_case_number || '',
        message: `This referral is already linked to intake case ${linked.case_number || referral.intake_case_number}.`,
      };
    }
  }

  // 2. A previous attempt may have created the case but failed to link it.
  //    Ledger rows are scoped to this business twice: in the query and by checking
  //    the tag on every row that comes back.
  const attemptRows = (await readFew(entities, 'ReferralIntakeLink', { referral_id: referral.id, tenant_id: businessId }, 5)).filter(
    (row: any) => (row?.tenant_id ?? row?.data?.tenant_id) === businessId,
  );
  const attempt = attemptRows[0] || null;
  if (attempt) {
    const reserved = attempt.intake_case_id
      ? await getOrNull(entities.IntakeCase, attempt.intake_case_id)
      : (await readFew(entities, 'IntakeCase', { case_number: attempt.case_number, tenant_id: businessId }, 5))[0] || null;
    if (reserved) {
      requireSameBusiness(reserved, businessId, 'The reserved intake case');
      return await linkExistingCase({ entities, referral, intakeCase: reserved, attempt, changedBy, now, businessId });
    }
  }

  // 3. The remaining business rules, decided after the database load.
  const blockers = handoverBlockers(referral);
  if (blockers.length) {
    throw new HandoverError(409, 'REFERRAL_NOT_ELIGIBLE', blockers[0], { blockers });
  }

  // 4/5. Reserve the number before creating anything. A number reserved by an
  //      earlier attempt is reused as-is, so a retry never takes a fresh number
  //      while a case from that attempt might still exist.
  let caseNumber = attempt?.case_number || '';
  let ledger: any = attempt;
  if (!caseNumber) {
    // No case may be created without knowing every number already in use.
    const [participantCases, ledgerRows] = await Promise.all([
      readAll(entities, 'IntakeCase', { intake_type: 'Participant', tenant_id: businessId }),
      readAll(entities, 'ReferralIntakeLink', { tenant_id: businessId }),
    ]);
    caseNumber = nextCaseNumber([
      ...participantCases.map((c: any) => c.case_number),
      ...ledgerRows.map((l: any) => l.case_number),
    ]);

    try {
      ledger = await entities.ReferralIntakeLink.create({
        referral_id: referral.id,
        referral_number: referral.referral_id || '',
        case_number: caseNumber,
        state: 'creating',
        changed_by: changedBy,
      });
    } catch (error: any) {
      throw new HandoverError(500, 'RESERVATION_FAILED', `The intake case was not created because the handover could not be reserved: ${error?.message || error}. No records were changed.`);
    }
    // The created row must belong to this business before anything hangs off it.
    requireSameBusiness(ledger, businessId, 'The handover reservation');
  }

  // 6. Create the case from the stored referral only.
  let created: any;
  try {
    created = await entities.IntakeCase.create({
      case_number: caseNumber,
      intake_type: 'Participant',
      applicant_name: String(referral.client_name || '').trim(),
      date_of_birth: referral.date_of_birth || '',
      email: referral.email || '',
      phone: referral.phone || '',
      address: [referral.address, referral.postcode].filter(Boolean).join(', '),
      reason_for_referral: referral.reason || '',
      requested_supports: referral.support_needs || '',
      referral_source: referralProvenance(referral),
      referral_date: auDate(now),
      assigned_to: changedBy,
      status: 'Draft',
    });
  } catch (error: any) {
    await entities.ReferralIntakeLink.update(ledger.id, {
      state: 'creating',
      last_error: String(error?.message || error).slice(0, 500),
    }).catch(() => {});
    throw new HandoverError(500, 'CASE_CREATE_FAILED', `The intake case could not be created: ${error?.message || error}. Retry is safe: the same reserved number ${caseNumber} will be reused.`);
  }
  requireSameBusiness(created, businessId, 'The new intake case');

  await entities.ReferralIntakeLink.update(ledger.id, { intake_case_id: created.id, state: 'created' }).catch(() => {});

  // 7. Duplicate review flag + number collision check (reported, never merged).
  const sameName = (
    await readFew(entities, 'IntakeCase', { applicant_name: created.applicant_name, status: { $in: OPEN_CASE_STATUSES }, tenant_id: businessId }, 10)
  ).filter((c: any) => c.id !== created.id);
  const dobMatch = sameName.find((c: any) => String(c.date_of_birth || '') && c.date_of_birth === String(referral.date_of_birth || ''));
  const sameNumber = (await readFew(entities, 'IntakeCase', { case_number: caseNumber, tenant_id: businessId }, 5)).filter((c: any) => c.id !== created.id);

  await entities.ReferralIntakeLink.update(ledger.id, {
    possible_duplicate_of: dobMatch?.case_number || '',
    name_match_review: sameName.length > 0,
    number_conflict: sameNumber.length > 0,
    state: 'created',
  }).catch(() => {});

  return await linkExistingCase({
    entities,
    referral,
    intakeCase: created,
    attempt: ledger,
    changedBy,
    now,
    businessId,
    review: {
      possibleDuplicateOf: dobMatch?.case_number || '',
      nameMatchReview: sameName.length > 0,
      numberConflict: sameNumber.length > 0,
    },
  });
}

async function linkExistingCase({ entities, referral, intakeCase, attempt, changedBy, now, businessId, review = {} }: any) {
  const caseNumber = intakeCase.case_number || attempt?.case_number || '';
  const stamp = `${auDate(now)} ${auTime(now)}`;
  const historyLine = `${stamp} - ${referral.status} to In Progress by ${changedBy} (Intake case ${caseNumber})`;

  let linkPending = false;
  try {
    await entities.Referral.update(referral.id, {
      status: 'In Progress',
      status_log: [referral.status_log, historyLine].filter(Boolean).join('\n'),
      intake_case_id: intakeCase.id,
      intake_case_number: caseNumber,
      intake_started_date: auDate(now),
    });
  } catch (error: any) {
    linkPending = true;
    if (attempt?.id) {
      await entities.ReferralIntakeLink.update(attempt.id, {
        intake_case_id: intakeCase.id,
        state: 'link_pending',
        last_error: String(error?.message || error).slice(0, 500),
      }).catch(() => {});
    }
  }

  // The audit trail is written last and must never tell the user the handover failed.
  let auditPending = false;
  if (!linkPending) {
    try {
      await entities.StatusLog.create({
        entity_type: 'Referral',
        record_id: referral.id,
        record_title: referral.client_name || '',
        from_status: referral.status || '',
        to_status: 'In Progress',
        changed_by: changedBy,
        notes: `Intake case ${caseNumber} opened`,
        ...(businessId ? { tenant_id: businessId } : {}),
      });
    } catch {
      auditPending = true;
    }
    if (attempt?.id) {
      await entities.ReferralIntakeLink.update(attempt.id, {
        state: auditPending ? 'audit_pending' : 'linked',
        intake_case_id: intakeCase.id,
      }).catch(() => {});
    }
  }

  const state = linkPending ? 'created_link_pending' : auditPending ? 'linked_audit_pending' : 'linked';
  const message = linkPending
    ? `Intake case ${caseNumber} exists but this referral could not be linked to it. Retry: the same case will be linked, not duplicated.`
    : auditPending
      ? `Intake case ${caseNumber} created and linked. The status history entry could not be written and is pending.`
      : `Intake case ${caseNumber} created and linked to this referral.`;

  return {
    state,
    caseId: intakeCase.id,
    caseNumber,
    retryable: linkPending,
    possibleDuplicateOf: review.possibleDuplicateOf || '',
    nameMatchReview: Boolean(review.nameMatchReview),
    numberConflict: Boolean(review.numberConflict),
    message,
  };
}