// ComplianceHR Training Hub — Safeguarding Essentials™
// Structured workplace scenario library, shared with the LMS curriculum.
// Module numbers without an entry fall back to the curriculum's generic scenarios.

export const LMS_SCENARIOS = {};

export function getScenario(moduleNumber) {
  return LMS_SCENARIOS[moduleNumber] || null;
}