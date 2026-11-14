// Referral -> intake handover, server-side only.
//
// Security rules this module is written to satisfy:
//  - the caller is never trusted: identity, role, approval and business come from
//    the authenticated user, never from the request body;
//  - the referral is loaded from the database, never taken from the payload;
//  - consent, status and existing-link rules are decided here, after the load;
//  - retries never create a second case: a case number is reserved in
//    ReferralIntakeLink before the case is created, so a recovery attempt can find
//    the case again by its reserved number;
//  - the platform cannot give us a transaction, so every partial outcome is
//    reported precisely instead of pretending the whole handover succeeded.

import { auDate, auTime, pageItems } from './reminders.ts';
import { hasAnyRole, hasApprovedAccess } from './systemAuth.ts';

export const REFERRAL_INTAKE_ROLES = ['admin', 'Provider Administrator', 'Intake Officer', 'Administration'];
export const LINKABLE_REFERRAL_STATUSES = ['Prepared', 'Sent', 'Accepted', 'In Progress'];
export const OPEN_CASE_STATUSES = ['Draft', 'Information Required', 'Ready for Review', 'Approved'];

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

// Reads every page. A response-shape mismatch or a read failure is a real error,
// never an empty list: creating a case on an unreadable reference is how
// duplicate case numbers happen.
async function readAll(entities: any, name: string, query: any) {
  const rows: any[] = [];
  let cursor: string | null = null;
  let pages = 0;
  for (;;) {
    const options: any = { sort: '-created_date', limit: PAGE_SIZE };
    if (cursor) options.cursor = cursor;
    const page = await entities[name].filter(query, options);
    rows.push(...pageItems(page));
    pages += 1;
    const hasMore = Boolean(page && !Array.isArray(page) && page.has_more && page.next_cursor);
    if (!hasMore) return rows;
    if (pages >= MAX_REFERENCE_PAGES) {
      throw new HandoverError(
        409,
        'REFERENCE_SCAN_INCOMPLETE',
        'The existing intake case numbers could not be read completely, so no new case was created. No records were changed.',
      );
    }
    cursor = page.next_cursor;
  }
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

async function getOrNull(entity: any, id: string) {
  if (!id) return null;
  return await entity.get(id).catch((error: any) => (error?.status === 404 ? null : Promise.reject(error)));
}

export interface HandoverInput {
  entities: any;
  user: any;
  referralId: string;
  now?: Date;
  tenantId?: string | null;
}

export async function handoverReferralToIntake({ entities, user, referralId, now = new Date(), tenantId = null }: HandoverInput) {
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
  if (referral.tenant_id && referral.tenant_id !== businessId) {
    throw new HandoverError(403, 'CROSS_BUSINESS', 'That referral belongs to another business.');
  }

  const changedBy = String(user?.full_name || user?.email || '').trim() || 'Unknown user';

  // 1. Already linked: nothing to create, nothing to change.
  if (referral.intake_case_id) {
    const linked = await getOrNull(entities.IntakeCase, referral.intake_case_id);
    if (linked) {
      return {
        state: 'already_linked',
        caseId: linked.id,
        caseNumber: linked.case_number || referral.intake_case_number || '',
        message: `This referral is already linked to intake case ${linked.case_number || referral.intake_case_number}.`,
      };
    }
  }

  // 2. A previous attempt may have created the case but failed to link it.
  //    The reserved case number is the durable key that finds it again.
  const attempts = pageItems(await entities.ReferralIntakeLink.filter({ referral_id: referral.id }, { sort: '-created_date', limit: 5 }));
  const attempt = attempts[0] || null;
  if (attempt) {
    // A reserved number from an earlier attempt is the durable key: if a case
    // already holds it, link that case instead of creating another one.
    const reserved = attempt.intake_case_id
      ? await getOrNull(entities.IntakeCase, attempt.intake_case_id)
      : pageItems(await entities.IntakeCase.filter({ case_number: attempt.case_number }, { limit: 5 }))[0] || null;
    if (reserved) {
      return await linkExistingCase({ entities, referral, intakeCase: reserved, attempt, changedBy, now });
    }
  }

  // 3. Business rules, decided after the database load.
  const blockers = handoverBlockers(referral);
  if (blockers.length) {
    const consentBlocked = referral.consent !== 'Consent given';
    throw new HandoverError(409, consentBlocked ? 'CONSENT_MISSING' : 'REFERRAL_NOT_ELIGIBLE', blockers[0], { blockers });
  }

  // 4/5. Reserve the number before creating anything. A number reserved by an
  //      earlier attempt is reused as-is, so a retry never takes a fresh number
  //      while a case from that attempt might still exist.
  let caseNumber = attempt?.case_number || '';
  let ledger: any = attempt;
  if (!caseNumber) {
    // No case may be created without knowing every number already in use.
    const [participantCases, ledgerRows] = await Promise.all([
      readAll(entities, 'IntakeCase', { intake_type: 'Participant' }),
      readAll(entities, 'ReferralIntakeLink', {}),
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

  await entities.ReferralIntakeLink.update(ledger.id, { intake_case_id: created.id, state: 'created' }).catch(() => {});

  // 7. Duplicate review flag + number collision check (reported, never merged).
  const sameName = pageItems(
    await entities.IntakeCase.filter({ applicant_name: created.applicant_name, status: { $in: OPEN_CASE_STATUSES } }, { limit: 10 }),
  ).filter((c: any) => c.id !== created.id);
  const dobMatch = sameName.find((c: any) => String(c.date_of_birth || '') && c.date_of_birth === String(referral.date_of_birth || ''));
  const sameNumber = pageItems(await entities.IntakeCase.filter({ case_number: caseNumber }, { limit: 5 })).filter((c: any) => c.id !== created.id);

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
    review: {
      possibleDuplicateOf: dobMatch?.case_number || '',
      nameMatchReview: sameName.length > 0,
      numberConflict: sameNumber.length > 0,
    },
  });
}

async function linkExistingCase({ entities, referral, intakeCase, attempt, changedBy, now, review = {} }: any) {
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