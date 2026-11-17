import type { CheckResult, Dimension, EntityRef, Severity } from '../types/index.ts';

/**
 * Builders for `CheckResult`. A rule that found nothing is a `pass`, not an absent check:
 * a health report needs to show which rules ran, not only the ones that complained.
 */
export interface RuleDefinition {
  readonly id: string;
  readonly dimension: Dimension;
  readonly severity: Severity;
  readonly title: string;
  readonly detail: string;
  /** Findings that deserve attention but are not breaches report as `warn`. */
  readonly statusWhenFound?: 'fail' | 'warn';
}

export function ref(type: EntityRef['type'], id: string): EntityRef {
  return { type, id };
}

export function refs(type: EntityRef['type'], ids: readonly string[]): EntityRef[] {
  return ids.map((id) => ref(type, id));
}

/** Evaluate a rule: pass when `refs` is empty, otherwise the rule's found-status. */
export function evaluate(rule: RuleDefinition, found: readonly EntityRef[]): CheckResult {
  const status = found.length === 0 ? 'pass' : rule.statusWhenFound ?? 'fail';
  return {
    id: rule.id,
    dimension: rule.dimension,
    severity: rule.severity,
    status,
    title: rule.title,
    detail: rule.detail,
    count: found.length,
    refs: found,
  };
}

/** A rule whose failing records are not entities (a missing field, for example). */
export function evaluateCount(rule: RuleDefinition, count: number, found: readonly EntityRef[] = []): CheckResult {
  const status = count === 0 ? 'pass' : rule.statusWhenFound ?? 'fail';
  return {
    id: rule.id,
    dimension: rule.dimension,
    severity: rule.severity,
    status,
    title: rule.title,
    detail: rule.detail,
    count,
    refs: found,
  };
}

/** Text is empty after trimming. Used by rules that care about a missing written field. */
export function blank(value: string | null | undefined): boolean {
  return (value ?? '').trim().length === 0;
}