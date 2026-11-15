// Five-level approval engine rules. One source of truth for the server: the UI reads
// the stages the server stored with each request, so a rule change never rewrites
// the history of a request already in flight.

export const CHAIN_CATEGORIES = [
  'Expenditure',
  'Policy approval',
  'Risk acceptance',
  'Clinical decision',
  'HR action',
  'Access change',
  'Contract',
  'Incident action',
];

// Every template has five named levels; how many of them a request needs is decided
// by its category, amount and risk level.
const TEMPLATES = {
  Expenditure: [
    { name: 'Line supervisor', roles: ['Team Leader', 'Administration'] },
    { name: 'Cost centre manager', roles: ['Management', 'Compliance Manager'] },
    { name: 'Finance control', roles: ['Finance & Accounts Officer', 'Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
  ],
  'Policy approval': [
    { name: 'Document owner', roles: ['Compliance Manager', 'Quality & Improvement Manager'] },
    { name: 'Compliance administration', roles: ['Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
    { name: 'Board endorsement', roles: ['admin'] },
  ],
  'Risk acceptance': [
    { name: 'Risk owner', roles: ['Team Leader', 'Compliance Manager'] },
    { name: 'Risk and safety review', roles: ['Quality & Improvement Manager', 'Compliance Manager'] },
    { name: 'Compliance administrator', roles: ['Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
  ],
  'Clinical decision': [
    { name: 'Clinical lead', roles: ['Team Leader', 'Compliance Manager'] },
    { name: 'Clinical governance review', roles: ['Quality & Improvement Manager', 'Compliance Manager'] },
    { name: 'Compliance administrator', roles: ['Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
  ],
  'HR action': [
    { name: 'Line supervisor', roles: ['Team Leader', 'Administration'] },
    { name: 'Human resources', roles: ['Human Resources Manager', 'Compliance Manager'] },
    { name: 'Compliance administration', roles: ['Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
  ],
  'Access change': [
    { name: 'Team leader', roles: ['Team Leader', 'Administration'] },
    { name: 'Manager review', roles: ['Management', 'Compliance Manager'] },
    { name: 'Compliance administration', roles: ['Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
  ],
  Contract: [
    { name: 'Contract owner', roles: ['Team Leader', 'Compliance Manager'] },
    { name: 'Commercial review', roles: ['Finance & Accounts Officer', 'Management'] },
    { name: 'Compliance administration', roles: ['Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
  ],
  'Incident action': [
    { name: 'Incident lead', roles: ['Team Leader', 'Compliance Manager'] },
    { name: 'Quality review', roles: ['Quality & Improvement Manager', 'Compliance Manager'] },
    { name: 'Compliance administration', roles: ['Compliance Administrator'] },
    { name: 'Executive director', roles: ['Provider Administrator'] },
    { name: 'Board delegate', roles: ['admin'] },
  ],
};

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export function requiredLevels(category, amount, riskLevel) {
  const risk = { Low: 2, Medium: 3, High: 4, Critical: 5 }[riskLevel] || 3;
  if (category === 'Expenditure') {
    const value = Number(amount) || 0;
    const byAmount = value < 1000 ? 2 : value < 10000 ? 3 : value < 50000 ? 4 : 5;
    return Math.max(byAmount, risk);
  }
  return risk;
}

/** The ordered stages one request must clear, numbered from 1. */
export function buildStages(category, { amount = 0, riskLevel = 'Medium' } = {}) {
  const template = TEMPLATES[category] || TEMPLATES['Policy approval'];
  const count = requiredLevels(category, amount, riskLevel);
  return template.slice(0, count).map((stage, index) => ({
    level: index + 1,
    name: stage.name,
    roles: stage.roles,
  }));
}

export function stageAt(stages, level) {
  return (stages || []).find((stage) => Number(stage.level) === Number(level)) || null;
}

export function isRiskLevel(value) {
  return RISK_LEVELS.includes(value);
}

/** Case-insensitive role check; an admin may decide any level (never their own request). */
export function canDecide(stage, role) {
  const actual = String(role || '').trim().toLowerCase();
  if (!stage || !actual) return false;
  if (actual === 'admin') return true;
  return (stage.roles || []).some((allowed) => String(allowed).trim().toLowerCase() === actual);
}

export function stageNames(stages) {
  return (stages || []).map((stage) => `${stage.level}. ${stage.name}`).join(' | ');
}