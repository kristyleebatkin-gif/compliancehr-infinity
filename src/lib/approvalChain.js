// Display helpers for approval chains. The stages themselves come from the server so a
// rule change never rewrites a request already in flight.

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

export const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const STATUS_TONE = {
  Pending: 'bg-amber-100 text-amber-900',
  Approved: 'bg-emerald-100 text-emerald-900',
  Returned: 'bg-rose-100 text-rose-900',
  Withdrawn: 'bg-slate-100 text-slate-700',
};

export const stagesOf = (chain) => (Array.isArray(chain?.stages) ? chain.stages : []);
export const decisionsOf = (chain) => (Array.isArray(chain?.decisions) ? chain.decisions : []);

export function progress(chain) {
  const total = Number(chain?.levels) || stagesOf(chain).length || 1;
  const decided = decisionsOf(chain).filter((entry) => entry.decision === 'approve').length;
  return { decided, total, percent: Math.round((decided / total) * 100) };
}

export function currentStage(chain) {
  return stagesOf(chain).find((stage) => Number(stage.level) === Number(chain?.current_level)) || null;
}

const roleOf = (value) => String(value || '').trim().toLowerCase();

/** Mirrors the server rule so the button only appears where the server will accept it. */
export function canDecideNow(chain, role) {
  if (!chain || chain.status !== 'Pending' || chain.mine) return false;
  const stage = currentStage(chain);
  if (!stage) return false;
  const actual = roleOf(role);
  if (actual === 'admin') return true;
  return (stage.roles || []).some((allowed) => roleOf(allowed) === actual);
}

export const when = (iso) => (iso ? new Date(iso).toLocaleString('en-AU', {
  timeZone: 'Australia/Brisbane', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
}) : '—');