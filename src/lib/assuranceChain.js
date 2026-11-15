const DAY_MS = 24 * 60 * 60 * 1000;

/** Visual states an evidence record can be in, derived from status + validity. */
export const EVIDENCE_STATES = {
  verified: { label: 'Verified', chip: 'border-safe/40 bg-safe/10 text-safe' },
  expiring: { label: 'Expiring soon', chip: 'border-warning/50 bg-warning/20 text-warning' },
  in_review: { label: 'In review', chip: 'border-warning/40 bg-warning/15 text-warning' },
  unverified: { label: 'Unverified', chip: 'border-border bg-muted text-foreground' },
  rejected: { label: 'Rejected', chip: 'border-danger/40 bg-danger/15 text-danger' },
  expired: { label: 'Expired', chip: 'border-danger/50 bg-danger/20 text-danger' },
};

export const EVIDENCE_STATE_ORDER = ['verified', 'expiring', 'in_review', 'unverified', 'rejected', 'expired'];

export const FINDING_TONES = {
  Conformity: 'border-safe/40 bg-safe/10 text-safe',
  'Minor non-conformity': 'border-warning/40 bg-warning/15 text-warning',
  'Major non-conformity': 'border-danger/40 bg-danger/15 text-danger',
  Observation: 'border-brand/40 bg-brand/10 text-brand',
  'Opportunity for improvement': 'border-accent/40 bg-accent/10 text-accent',
};

export const FRAMEWORKS = [
  'NDIS Practice Standards',
  'Aged Care Quality Standards',
  'ISO 9001:2015',
  'ISO/IEC 27001:2022',
  'NSQHS Standards',
  'HSQF',
  'Fair Work',
];

export const EVIDENCE_TYPES = [
  'Document',
  'Record',
  'Register extract',
  'Photo',
  'Sign-off',
  'System export',
  'Certificate',
  'Training record',
  'Meeting minutes',
  'Other',
];

/** Whole days until a date (negative when it has passed). Null when there is no usable date. */
export function daysUntil(dateValue) {
  if (!dateValue) return null;
  const target = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/** The single state the register sorts, filters and colours by. */
export function evidenceState(evidence) {
  const status = evidence?.verification_status;
  if (status === 'Rejected') return 'rejected';
  if (status === 'Expired') return 'expired';
  const remaining = daysUntil(evidence?.valid_to);
  if (remaining !== null && remaining < 0) return 'expired';
  if (remaining !== null && remaining <= 30) return 'expiring';
  if (status === 'Verified') return 'verified';
  if (status === 'In Review') return 'in_review';
  return 'unverified';
}

export function isEvidenceHolding(evidence) {
  const state = evidenceState(evidence);
  return state === 'verified' || state === 'expiring';
}

export function confidenceTone(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 'bg-muted';
  if (score >= 85) return 'bg-safe';
  if (score >= 60) return 'bg-warning';
  return 'bg-danger';
}

/** Headline numbers for the Evidence OS KPI strip. */
export function summariseEvidence({ evidence = [], controls = [], findings = [] } = {}) {
  const states = { verified: 0, expiring: 0, in_review: 0, unverified: 0, rejected: 0, expired: 0 };
  evidence.forEach((item) => {
    states[evidenceState(item)] += 1;
  });

  const holdingControlIds = new Set(
    evidence.filter(isEvidenceHolding).map((item) => item.control_id).filter(Boolean)
  );
  const controlsCovered = controls.filter((control) => holdingControlIds.has(control.id)).length;
  const controlsTotal = controls.length;

  return {
    evidenceTotal: evidence.length,
    ...states,
    controlsTotal,
    controlsCovered,
    controlsMissing: Math.max(controlsTotal - controlsCovered, 0),
    openFindings: findings.filter((finding) => finding.status !== 'Closed').length,
    coveragePercent: controlsTotal ? Math.round((controlsCovered / controlsTotal) * 100) : 0,
  };
}

/** One row per standard: how many controls it has, how many are actually evidenced, open findings. */
export function standardCoverage({ standards = [], controls = [], evidence = [], findings = [] } = {}) {
  const holdingControlIds = new Set(
    evidence.filter(isEvidenceHolding).map((item) => item.control_id).filter(Boolean)
  );
  const openByControl = new Map();
  findings
    .filter((finding) => finding.status !== 'Closed' && finding.control_id)
    .forEach((finding) => {
      openByControl.set(finding.control_id, (openByControl.get(finding.control_id) || 0) + 1);
    });

  return standards
    .map((standard) => {
      const linked = controls.filter(
        (control) =>
          control.standard_id === standard.id ||
          (control.standard_code && control.standard_code === standard.standard_code)
      );
      const covered = linked.filter((control) => holdingControlIds.has(control.id)).length;
      const openFindings = linked.reduce((sum, control) => sum + (openByControl.get(control.id) || 0), 0);
      return {
        id: standard.id,
        framework: standard.framework,
        standard_code: standard.standard_code || 'Uncoded',
        standard_title: standard.standard_title || 'Untitled standard',
        status: standard.status,
        controls: linked.length,
        covered,
        openFindings,
        coverage: linked.length ? Math.round((covered / linked.length) * 100) : 0,
      };
    })
    .sort((a, b) => a.coverage - b.coverage || String(a.standard_code).localeCompare(String(b.standard_code)));
}

/** Plain-language assurance sentence for one control, used in the chain view and CSV export. */
export function assuranceStatement({ control, evidence = [], findings = [] } = {}) {
  if (!control) return 'No control selected.';
  const holding = evidence.filter(isEvidenceHolding).length;
  const open = findings.filter((finding) => finding.status !== 'Closed').length;
  if (!evidence.length) return 'Not assured: no evidence is linked to this control.';
  if (!holding) return `Partly assured: ${evidence.length} evidence item(s) linked, none verified.`;
  if (open) return `Assured with exceptions: ${holding} verified evidence item(s), ${open} open finding(s).`;
  return `Fully assured: ${holding} verified evidence item(s) and no open findings.`;
}