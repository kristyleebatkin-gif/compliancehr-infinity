import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { evaluate, ref } from './result.ts';

/** Reviews: what is overdue, what was never reviewed, and what was reviewed with work outstanding. */
export function reviewValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const overdue = dataset.reviews.filter((review) => review.dueOn < today);
  const neverReviewed = dataset.reviews.filter((review) => review.lastReviewedOn === null && review.dueOn >= today);
  const changesOutstanding = dataset.reviews.filter(
    (review) => review.outcome === 'changes_required' && review.dueOn >= today
  );
  const noOwner = dataset.reviews.filter((review) => review.ownerId === null);
  const noReviewer = dataset.reviews.filter((review) => review.reviewerName === null && review.lastReviewedOn !== null);
  const silent = dataset.reviews.filter(
    (review) => review.lastReviewedOn !== null && review.outcome === 'not_reviewed' && review.notes.trim().length === 0
  );

  return [
    evaluate(
      {
        id: 'review.overdue',
        dimension: 'review',
        severity: 'high',
        title: 'Reviews past their due date',
        detail: 'The record has not been re-examined in the cycle its cadence requires.',
      },
      overdue.map((review) => ref('review', review.id))
    ),
    evaluate(
      {
        id: 'review.never-reviewed',
        dimension: 'review',
        severity: 'medium',
        title: 'Records that have never been reviewed',
        detail: 'The first review has not happened, so the record has no confirmed baseline.',
        statusWhenFound: 'warn',
      },
      neverReviewed.map((review) => ref('review', review.id))
    ),
    evaluate(
      {
        id: 'review.changes-outstanding',
        dimension: 'review',
        severity: 'medium',
        title: 'Reviews that required changes still outstanding',
        detail: 'The reviewer asked for changes and the record has not been re-reviewed since.',
      },
      changesOutstanding.map((review) => ref('review', review.id))
    ),
    evaluate(
      {
        id: 'review.owner-missing',
        dimension: 'review',
        severity: 'low',
        title: 'Reviews with no accountable owner',
        detail: 'No one is recorded as answerable for keeping this review current.',
        statusWhenFound: 'warn',
      },
      noOwner.map((review) => ref('review', review.id))
    ),
    evaluate(
      {
        id: 'review.reviewer-missing',
        dimension: 'review',
        severity: 'low',
        title: 'Reviews with no named reviewer',
        detail: 'A review without a named person cannot be verified.',
        statusWhenFound: 'warn',
      },
      noReviewer.map((review) => ref('review', review.id))
    ),
    evaluate(
      {
        id: 'review.silent-not-reviewed',
        dimension: 'review',
        severity: 'low',
        title: 'Reviews marked not reviewed with no note',
        detail: 'A skipped review with no explanation is indistinguishable from an oversight.',
        statusWhenFound: 'warn',
      },
      silent.map((review) => ref('review', review.id))
    ),
  ];
}