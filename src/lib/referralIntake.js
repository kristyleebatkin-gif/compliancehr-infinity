import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { createProfileId, OPEN_INTAKE_STATUSES } from '@/lib/intakeCases';
import { formatLogLine, recordStatusLog } from '@/lib/statusLog';

// Referral -> Intake Case handover (priority journey A: referral -> intake ->
// participant profile -> commencement). This creates the intake case from the
// referral that was already accepted, carrying the known details across so the
// intake officer does not retype them. Nothing is invented: only fields the
// referral actually holds are copied.

export function referralIntakeBlockers(referral) {
  const blockers = [];
  if (!referral) return ['No referral selected.'];
  if (!String(referral.client_name || '').trim()) blockers.push('The referral has no person named.');
  if (referral.consent !== 'Consent given') blockers.push('Client consent has not been recorded on this referral, so an intake case cannot be opened.');
  if (referral.intake_case_number) blockers.push(`An intake case (${referral.intake_case_number}) is already linked to this referral.`);
  if (!['Prepared', 'Sent', 'Accepted', 'In Progress'].includes(referral.status)) {
    blockers.push(`Referral status is "${referral.status}". Move it to Prepared, Sent, Accepted or In Progress before starting intake.`);
  }
  return blockers;
}

export function referralToIntakePayload(referral, existingCases = [], assignedTo = '') {
  const address = [referral.address, referral.postcode].filter(Boolean).join(', ');
  const referrer = [referral.referrer_name, referral.referrer_role].filter(Boolean).join(' — ');
  return {
    case_number: createProfileId(existingCases, 'case_number', 'PIC'),
    intake_type: 'Participant',
    applicant_name: String(referral.client_name || '').trim(),
    date_of_birth: referral.date_of_birth || '',
    email: referral.email || '',
    phone: referral.phone || '',
    address,
    reason_for_referral: referral.reason || '',
    requested_supports: referral.support_needs || '',
    referral_source: [`Referral ${referral.referral_id || referral.id}`, referrer].filter(Boolean).join(' — '),
    referral_date: format(new Date(), 'yyyy-MM-dd'),
    assigned_to: assignedTo || '',
    status: 'Draft',
  };
}

export async function findExistingIntakeCase(referral, cases = []) {
  const name = String(referral.client_name || '').trim().toLowerCase();
  if (!name) return null;
  return (
    cases.find(
      (c) =>
        String(c.applicant_name || '').trim().toLowerCase() === name &&
        (c.date_of_birth || '') === (referral.date_of_birth || '') &&
        OPEN_INTAKE_STATUSES.includes(c.status),
    ) || null
  );
}

export async function startIntakeFromReferral({ referral, changedBy = 'Intake team' }) {
  const blockers = referralIntakeBlockers(referral);
  if (blockers.length) {
    const error = new Error(blockers[0]);
    error.blockers = blockers;
    throw error;
  }

  const page = await base44.entities.IntakeCase.filter({ intake_type: 'Participant' }, { sort: '-created_date', limit: 500 });
  const cases = page?.items || [];
  const duplicate = await findExistingIntakeCase(referral, cases);
  if (duplicate) {
    const error = new Error(`An open intake case (${duplicate.case_number}) already matches this person. Link or close it instead of creating a second one.`);
    error.blockers = [error.message];
    throw error;
  }

  const created = await base44.entities.IntakeCase.create(referralToIntakePayload(referral, cases, changedBy));

  const line = formatLogLine(referral.status, 'In Progress', changedBy);
  await base44.entities.Referral.update(referral.id, {
    status: 'In Progress',
    status_log: [referral.status_log, line].filter(Boolean).join('\n'),
    intake_case_id: created.id,
    intake_case_number: created.case_number,
    intake_started_date: format(new Date(), 'yyyy-MM-dd'),
  });
  await recordStatusLog('Referral', referral, 'In Progress', changedBy, `Intake case ${created.case_number} opened`);

  return created;
}