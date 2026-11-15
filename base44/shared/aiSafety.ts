// Deterministic safety rules: no model output determines access, approval or readiness.
export const AI_PROMPT_VERSION = 'assurance-review-2026-11-15.1';
export function normalisePage(value) {
  const items = Array.isArray(value) ? value : value?.items;
  if (!Array.isArray(items)) throw new Error('SOURCE_UNAVAILABLE');
  return items;
}
export function validateReviewTransition(previous, next, reason, proof) {
  const allowed = { 'Awaiting review': ['Accepted', 'Rejected'], Accepted: ['Implemented', 'Rejected'] };
  if (!allowed[previous]?.includes(next)) throw new Error('INVALID_TRANSITION');
  if (typeof reason !== 'string' || reason.trim().length < 5) throw new Error('REVIEW_REASON_REQUIRED');
  if (next === 'Implemented' && (typeof proof !== 'string' || proof.trim().length < 5)) throw new Error('IMPLEMENTATION_EVIDENCE_REQUIRED');
}
export function validateCitations(analysis, sources) {
  const byId = new Map(sources.map(x => [x.id, x]));
  const findings = Array.isArray(analysis?.key_findings) ? analysis.key_findings : [];
  const recommendations = Array.isArray(analysis?.recommendations) ? analysis.recommendations : [];
  const clean = items => items.map(item => {
    const ids = Array.isArray(item.source_ids) ? [...new Set(item.source_ids)] : [];
    if (!ids.length || ids.some(id => !byId.has(id))) throw new Error('UNSUPPORTED_CITATION');
    return { ...item, confidence: undefined, source_ids: ids };
  });
  if (!analysis || typeof analysis.executive_summary !== 'string') throw new Error('INVALID_MODEL_RESPONSE');
  return { ...analysis, key_findings: clean(findings), recommendations: clean(recommendations), confidence_score: null,
    confidence_method: 'Not calibrated. Source references are checked for existence; entailment requires human review.' };
}
export async function digest(value) {
 const bytes = new TextEncoder().encode(JSON.stringify(value));
 const hash = await crypto.subtle.digest('SHA-256', bytes);
 return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join('');
}
