import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { evaluate, ref } from './result.ts';

/** Audit health: was it done, was it independent, and did it record what it found? */
export function auditValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const openAudits = dataset.audits.filter((audit) => audit.status === 'planned' || audit.status === 'in_progress');
  const overdue = openAudits.filter((audit) => audit.plannedFor < today);
  const completeWithoutDate = dataset.audits.filter((audit) => audit.status === 'complete' && audit.completedOn === null);
  const completeWithoutFindings = dataset.audits.filter(
    (audit) => audit.status === 'complete' && !dataset.findings.some((finding) => finding.auditId === audit.id)
  );
  const noStandards = dataset.audits.filter((audit) => audit.standardIds.length === 0);
  const unlinkedFindings = dataset.findings.filter((finding) => finding.auditId === null && finding.source !== 'complaint');
  const scopeBlank = dataset.audits.filter((audit) => audit.scope.trim().length === 0);

  return [
    evaluate(
      {
        id: 'audit.overdue',
        dimension: 'audit',
        severity: 'high',
        title: 'Audits past their planned date that have not completed',
        detail: 'The audit is still open after the date it was scheduled for.',
      },
      overdue.map((audit) => ref('audit', audit.id))
    ),
    evaluate(
      {
        id: 'audit.complete-without-date',
        dimension: 'audit',
        severity: 'high',
        title: 'Audits marked complete with no completion date',
        detail: 'A completion date is what makes an audit result traceable in time.',
      },
      completeWithoutDate.map((audit) => ref('audit', audit.id))
    ),
    evaluate(
      {
        id: 'audit.no-findings-recorded',
        dimension: 'audit',
        severity: 'medium',
        title: 'Completed audits with no findings at all',
        detail: 'An audit that recorded nothing, not even conformity, usually means results were not entered.',
        statusWhenFound: 'warn',
      },
      completeWithoutFindings.map((audit) => ref('audit', audit.id))
    ),
    evaluate(
      {
        id: 'audit.no-standards',
        dimension: 'audit',
        severity: 'medium',
        title: 'Audits with no standard in scope',
        detail: 'The audit cannot be reported against a standard if none was in scope.',
        statusWhenFound: 'warn',
      },
      noStandards.map((audit) => ref('audit', audit.id))
    ),
    evaluate(
      {
        id: 'audit.finding-unlinked',
        dimension: 'audit',
        severity: 'low',
        title: 'Findings raised outside any audit',
        detail: 'Legitimate for spot checks and complaints, but they carry less assurance weight than audited findings.',
        statusWhenFound: 'warn',
      },
      unlinkedFindings.map((finding) => ref('finding', finding.id))
    ),
    evaluate(
      {
        id: 'audit.scope-blank',
        dimension: 'audit',
        severity: 'medium',
        title: 'Audits with no recorded scope',
        detail: 'An audit without a scope cannot be shown to have covered the obligation.',
      },
      scopeBlank.map((audit) => ref('audit', audit.id))
    ),
  ];
}