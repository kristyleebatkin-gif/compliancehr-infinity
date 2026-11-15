// AI Intelligence OS model: governed agents, explainable recommendations and the
// measurable health of the intelligence layer. Nothing here asserts a number the
// registers cannot prove — every metric is derived from logged interactions.

export const AGENT_STATUS_TONES = {
  Active: 'border-safe/40 bg-safe/10 text-safe',
  Draft: 'border-border bg-muted text-foreground',
  Paused: 'border-warning/40 bg-warning/15 text-warning',
  Retired: 'border-danger/40 bg-danger/10 text-danger',
};

export const RECOMMENDATION_STATUS_TONES = {
  'Awaiting review': 'border-warning/40 bg-warning/15 text-warning',
  Accepted: 'border-safe/40 bg-safe/10 text-safe',
  Rejected: 'border-danger/40 bg-danger/15 text-danger',
  Implemented: 'border-brand/40 bg-brand/10 text-brand',
};

export const PRIORITY_TONES = {
  Critical: 'border-danger/50 bg-danger/15 text-danger',
  High: 'border-warning/50 bg-warning/20 text-warning',
  Medium: 'border-brand/40 bg-brand/10 text-brand',
  Low: 'border-border bg-muted text-foreground',
};

export const PROMPT_STATUS_TONES = {
  Approved: 'border-safe/40 bg-safe/10 text-safe',
  'In review': 'border-warning/40 bg-warning/15 text-warning',
  Draft: 'border-border bg-muted text-foreground',
  Retired: 'border-danger/40 bg-danger/10 text-danger',
};

/** The canonical enterprise chain every AI answer must trace back through. */
export const CANONICAL_CHAIN = [
  'Regulation',
  'Standard',
  'Obligation',
  'Control',
  'Policy',
  'Procedure',
  'Form',
  'Evidence',
  'Audit',
  'Finding',
  'Corrective action',
  'Risk',
  'Outcome',
];

/** Reviews a copilot can actually run today. */
export const COPILOT_ACTIONS = [
  {
    key: 'compliance_review',
    label: 'Compliance review',
    description: 'Traces coverage across the assurance chain and names the weakest controls.',
  },
  {
    key: 'evidence_review',
    label: 'Evidence review',
    description: 'Validates currency, ownership and traceability of the evidence held.',
  },
  {
    key: 'audit_readiness',
    label: 'Audit readiness',
    description: 'Reviews the bounded evidence position and drafts questions for human review.',
  },
  {
    key: 'risk_review',
    label: 'Risk review',
    description: 'Connects evidence gaps and open findings to enterprise risk exposure.',
  },
];

export function confidenceBand(value) {
  const score = value === null || value === undefined || value === '' ? NaN : Number(value);
  if (!Number.isFinite(score)) return { label: 'Not scored', chip: 'border-border bg-muted text-foreground' };
  if (score >= 85) return { label: 'High confidence', chip: 'border-safe/40 bg-safe/10 text-safe' };
  if (score >= 65) return { label: 'Moderate confidence', chip: 'border-warning/40 bg-warning/15 text-warning' };
  return { label: 'Low confidence', chip: 'border-danger/40 bg-danger/15 text-danger' };
}

export function summariseAi({ interactions = [], recommendations = [], agents = [], prompts = [] } = {}) {
  const decided = recommendations.filter((item) => ['Accepted','Rejected','Implemented'].includes(item.status));
  const accepted = recommendations.filter((item) => item.status === 'Accepted' || item.status === 'Implemented');

  return {
    runs: interactions.length,
    avgConfidence: null, // No task-specific confidence calibration has been accepted.
    flagged: interactions.filter((item) => item.flagged).length,
    overrides: interactions.filter((item) => item.override).length,
    flaggedRate: interactions.length
      ? Math.round((interactions.filter((item) => item.flagged).length / interactions.length) * 100)
      : null,
    awaiting: recommendations.filter((item) => item.status === 'Awaiting review').length,
    accepted: accepted.length,
    acceptanceRate: decided.length ? Math.round((accepted.length / decided.length) * 100) : null,
    activeAgents: agents.filter((agent) => agent.status === 'Active').length,
    totalAgents: agents.length,
    approvedPrompts: prompts.filter((prompt) => prompt.status === 'Approved').length,
    totalPrompts: prompts.length,
  };
}

/** Groups recommendations by module so the command centre can show where the intelligence is being used. */
export function recommendationsByModule(recommendations = []) {
  const map = new Map();
  recommendations.forEach((item) => {
    const key = item.module || 'Unassigned';
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()]
    .map(([module, count]) => ({ module, count }))
    .sort((a, b) => b.count - a.count);
}

export const SPECIALIST_ACTIONS = [
 ['policy_review','Policy Copilot','Draft policy review questions from recorded obligations.'],
 ['standards_review','Standards Copilot','Inspect recorded mappings; verify legal interpretation with an authorised specialist.'],
 ['quality_review','Quality Copilot','Find assurance improvement opportunities.'],
 ['workforce_review','Workforce Copilot','Review workforce assurance metadata; credential clearance stays with a human.'],
 ['clinical_review','Clinical Governance Copilot','Review governance metadata; no diagnosis or treatment advice.'],
 ['allied_health_review','Allied Health Copilot','Review allied health assurance metadata and source gaps.'],
 ['incident_review','Incident Copilot','Review assurance links; statutory reportability stays in the incident workflow.'],
 ['board_review','Board Copilot','Draft a source-linked board assurance summary.'],
 ['ceo_review','CEO Copilot','Draft an executive assurance briefing.'],
 ['executive_review','Executive Copilot','Summarise authorised assurance data and limitations.'],
].map(([key,label,description])=>({key,label,description}));
export const ALL_COPILOT_ACTIONS = [...COPILOT_ACTIONS,...SPECIALIST_ACTIONS];
