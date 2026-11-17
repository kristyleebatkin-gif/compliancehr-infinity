// Enterprise Integrity Index — the single weighted composite defined by the governing specification.
//
// Ten dimensions, weights summing to 100:
//   Governance 15, Compliance 15, Risk 10, Audit 10, Evidence 10,
//   Workforce 10, Clinical Governance 10, Trust 10, Assurance 5, Strategic Outcomes 5.
//
// Every dimension score comes from real record counts in the caller's business (never a typed-in
// number). Each measure is either "good" evidence (counts toward the numerator) or "bad" evidence
// (counts toward the denominator only). A dimension with no countable records is reported as
// "not measured" and is left out of the weighted total, so an empty register can never inflate
// the index. Coverage reports how much of the 100 points of weight was actually measurable.
//
// This file holds no React and no network calls, so the arithmetic is testable on its own.

import { BUSINESS_TIME_ZONE } from './businessTime.js';

const OPEN_RISK_STATUS = ['Identified', 'Assessed', 'Treating', 'Monitored'];
const EPOCH = '1900-01-01';

export function businessToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const before = (today) => ({ $gte: EPOCH, $lt: today });

/**
 * The ten dimensions with their exact measures. `side` decides which way a count moves the score.
 * @param {string} today business-local date, YYYY-MM-DD
 */
export function integrityDimensions(today) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(today))) throw new Error('A business date (YYYY-MM-DD) is required');
  return [
    {
      key: 'governance',
      label: 'Governance',
      weight: 15,
      measures: [
        { key: 'govActive', entity: 'GovernanceObject', label: 'Governance objects in force', query: { status: 'Active' }, side: 'good' },
        { key: 'govOverdue', entity: 'GovernanceObject', label: 'Governance reviews past due', query: { status: { $in: ['Active', 'Under Review'] }, review_date: before(today) }, side: 'bad' },
        { key: 'boardApproved', entity: 'BoardResolution', label: 'Board resolutions approved', query: { status: 'Approved' }, side: 'good' },
        { key: 'boardOverdue', entity: 'BoardResolution', label: 'Resolution reviews past due', query: { status: 'Approved', review_date: before(today) }, side: 'bad' },
      ],
    },
    {
      key: 'compliance',
      label: 'Compliance',
      weight: 15,
      measures: [
        { key: 'controlsActive', entity: 'ComplianceControl', label: 'Obligation controls active', query: { status: 'Active' }, side: 'good' },
        { key: 'controlsDraft', entity: 'ComplianceControl', label: 'Controls still draft or under review', query: { status: { $in: ['Draft', 'Under Review'] } }, side: 'bad' },
        { key: 'issuesClosed', entity: 'ComplianceIssue', label: 'Compliance issues resolved', query: { status: { $in: ['Resolved', 'Closed'] } }, side: 'good' },
        { key: 'issuesOpen', entity: 'ComplianceIssue', label: 'Compliance issues still open', query: { status: { $in: ['Open', 'In Progress'] } }, side: 'bad' },
        { key: 'policiesActive', entity: 'Policy', label: 'Policies current', query: { status: 'Active' }, side: 'good' },
        { key: 'policiesExpired', entity: 'Policy', label: 'Policies expired', query: { status: 'Expired' }, side: 'bad' },
      ],
    },
    {
      key: 'risk',
      label: 'Risk',
      weight: 10,
      measures: [
        { key: 'riskControlled', entity: 'Risk', label: 'Open risks held at low or medium', query: { status: { $in: OPEN_RISK_STATUS }, rating: { $in: ['Low', 'Medium'] } }, side: 'good' },
        { key: 'riskClosed', entity: 'Risk', label: 'Risks closed', query: { status: 'Closed' }, side: 'good' },
        { key: 'riskHigh', entity: 'Risk', label: 'Open risks rated high or critical', query: { status: { $in: OPEN_RISK_STATUS }, rating: { $in: ['High', 'Critical'] } }, side: 'bad' },
        { key: 'riskOverdue', entity: 'Risk', label: 'Risk reviews past due', query: { status: { $in: OPEN_RISK_STATUS }, review_date: before(today) }, side: 'bad' },
      ],
    },
    {
      key: 'audit',
      label: 'Audit',
      weight: 10,
      measures: [
        { key: 'auditsComplete', entity: 'Audit', label: 'Audits complete', query: { status: 'Complete' }, side: 'good' },
        { key: 'auditsOpen', entity: 'Audit', label: 'Audits scheduled or in progress', query: { status: { $in: ['Scheduled', 'In Progress'] } }, side: 'bad' },
        { key: 'auditsFollowUp', entity: 'Audit', label: 'Audits needing follow-up', query: { status: 'Follow-up Required' }, side: 'bad' },
        { key: 'findingsClosed', entity: 'AssuranceFinding', label: 'Findings closed', query: { status: 'Closed' }, side: 'good' },
        { key: 'findingsOpen', entity: 'AssuranceFinding', label: 'Findings open or in verification', query: { status: { $in: ['Open', 'In Progress', 'Verification'] } }, side: 'bad' },
      ],
    },
    {
      key: 'evidence',
      label: 'Evidence',
      weight: 10,
      measures: [
        { key: 'evidenceVerified', entity: 'AssuranceEvidence', label: 'Evidence verified', query: { verification_status: 'Verified' }, side: 'good' },
        { key: 'evidencePending', entity: 'AssuranceEvidence', label: 'Evidence awaiting verification', query: { verification_status: { $in: ['Unverified', 'In Review'] } }, side: 'bad' },
        { key: 'evidenceFailing', entity: 'AssuranceEvidence', label: 'Evidence expired or rejected', query: { verification_status: { $in: ['Expired', 'Rejected'] } }, side: 'bad' },
      ],
    },
    {
      key: 'workforce',
      label: 'Workforce',
      weight: 10,
      measures: [
        { key: 'certCurrent', entity: 'Certificate', label: 'Certificates current', query: { status: 'Current' }, side: 'good' },
        { key: 'certExpiring', entity: 'Certificate', label: 'Certificates expiring soon', query: { status: 'Expiring Soon' }, side: 'bad' },
        { key: 'certFailed', entity: 'Certificate', label: 'Certificates expired or revoked', query: { status: { $in: ['Expired', 'Revoked'] } }, side: 'bad' },
        { key: 'trainingValid', entity: 'TrainingCompletion', label: 'Training in date', query: { expiry_date: { $gte: today } }, side: 'good' },
        { key: 'trainingLapsed', entity: 'TrainingCompletion', label: 'Training lapsed', query: { expiry_date: before(today) }, side: 'bad' },
      ],
    },
    {
      key: 'clinical',
      label: 'Clinical Governance',
      weight: 10,
      measures: [
        { key: 'plansActive', entity: 'CarePlan', label: 'Care plans active', query: { status: 'Active' }, side: 'good' },
        { key: 'plansOverdue', entity: 'CarePlan', label: 'Care plan reviews past due', query: { status: 'Active', review_due: before(today) }, side: 'bad' },
        { key: 'consentPending', entity: 'CarePlan', label: 'Care plans awaiting consent', query: { consent_status: 'Consent pending' }, side: 'bad' },
        { key: 'referralsClosed', entity: 'AlliedHealthReferral', label: 'Allied health referrals completed', query: { status: { $in: ['Completed', 'Closed'] } }, side: 'good' },
        { key: 'referralsOverdue', entity: 'AlliedHealthReferral', label: 'Referral follow-ups past due', query: { status: { $in: ['Sent', 'Accepted', 'Scheduled'] }, review_due: before(today) }, side: 'bad' },
      ],
    },
    {
      key: 'trust',
      label: 'Trust',
      weight: 10,
      measures: [
        { key: 'complaintsClosed', entity: 'Complaint', label: 'Complaints resolved', query: { status: { $in: ['Resolved', 'Closed'] } }, side: 'good' },
        { key: 'complaintsOpen', entity: 'Complaint', label: 'Complaints still open', query: { status: { $in: ['Received', 'Acknowledged', 'Under Investigation'] } }, side: 'bad' },
        { key: 'feedbackFinalised', entity: 'Feedback', label: 'Feedback finalised', query: { status: 'Finalised' }, side: 'good' },
        { key: 'feedbackOpen', entity: 'Feedback', label: 'Feedback awaiting action', query: { status: { $in: ['Received', 'Viewed', 'Pending Further Action'] } }, side: 'bad' },
      ],
    },
    {
      key: 'assurance',
      label: 'Assurance',
      weight: 5,
      measures: [
        { key: 'controlsTested', entity: 'ComplianceControl', label: 'Controls tested within schedule', query: { status: 'Active', next_test_date: { $gte: today } }, side: 'good' },
        { key: 'controlsUntested', entity: 'ComplianceControl', label: 'Control tests past due', query: { status: 'Active', next_test_date: before(today) }, side: 'bad' },
      ],
    },
    {
      key: 'strategic',
      label: 'Strategic Outcomes',
      weight: 5,
      measures: [
        { key: 'goalsAchieved', entity: 'Goal', label: 'Participant goals achieved', query: { status: 'Achieved' }, side: 'good' },
        { key: 'goalsOpen', entity: 'Goal', label: 'Goals in progress or on hold', query: { status: { $in: ['In Progress', 'On Hold'] } }, side: 'bad' },
        { key: 'projectsComplete', entity: 'BusinessProject', label: 'Business projects complete', query: { status: 'Complete' }, side: 'good' },
        { key: 'projectsOverdue', entity: 'BusinessProject', label: 'Projects past due date', query: { status: { $in: ['Active', 'On Hold'] }, due_date: before(today) }, side: 'bad' },
      ],
    },
  ];
}

const isCount = (value) => Number.isSafeInteger(value) && value >= 0;

/** Score one dimension from the counts that came back. Null means nothing was measurable. */
export function scoreDimension(dimension, counts = {}) {
  let good = 0;
  let bad = 0;
  let measuredMeasures = 0;
  for (const measure of dimension.measures) {
    const value = counts[measure.key];
    if (!isCount(value)) continue;
    measuredMeasures += 1;
    if (measure.side === 'good') good += value;
    else bad += value;
  }
  const denominator = good + bad;
  const score = denominator > 0 ? Math.round((good / denominator) * 100) : null;
  return {
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    good,
    bad,
    coverage: dimension.measures.length ? Math.round((measuredMeasures / dimension.measures.length) * 100) : 0,
    measures: dimension.measures,
    score,
    contribution: score === null ? null : Math.round(((score * dimension.weight) / 100) * 10) / 10,
  };
}

/** Bands used on the executive surface. */
export function integrityBand(score) {
  if (score === null || score === undefined) return { label: 'Not measured', tone: 'unmeasured' };
  if (score >= 90) return { label: 'Exemplary', tone: 'exemplary' };
  if (score >= 75) return { label: 'Assured', tone: 'assured' };
  if (score >= 60) return { label: 'Developing', tone: 'developing' };
  return { label: 'At risk', tone: 'risk' };
}

/**
 * Combine the dimensions into the index. Only measured dimensions carry weight; the remaining
 * weight is reported as unmeasured coverage rather than silently scored as zero or as full marks.
 */
export function scoreIntegrityIndex(dimensions, counts = {}) {
  const scored = dimensions.map((dimension) => scoreDimension(dimension, counts));
  const measured = scored.filter((dimension) => dimension.score !== null);
  const measuredWeight = measured.reduce((total, dimension) => total + dimension.weight, 0);
  const weighted = measured.reduce((total, dimension) => total + dimension.score * dimension.weight, 0);
  const score = measuredWeight > 0 ? Math.round(weighted / measuredWeight) : null;
  return {
    score,
    band: integrityBand(score),
    dimensions: scored,
    measuredDimensions: measured.length,
    totalDimensions: scored.length,
    coverage: measuredWeight,
  };
}