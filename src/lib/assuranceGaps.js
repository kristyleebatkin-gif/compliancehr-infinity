// Autonomous assurance gap detection (V16 dependency + self-improvement rules).
// Pure functions only: every gap is derived from real register records, never invented.
// A gap answers the evidence-first questions: what is missing, what obligation it breaks,
// and what the next remediation action is.

import { daysUntil, evidenceState, isEvidenceHolding } from './assuranceChain.js';

export const GAP_SEVERITIES = {
  critical: { label: 'Critical', chip: 'border-danger/50 bg-danger/15 text-danger', priority: 'Urgent', weight: 0 },
  high: { label: 'High', chip: 'border-warning/50 bg-warning/20 text-warning', priority: 'High', weight: 1 },
  medium: { label: 'Medium', chip: 'border-brand/40 bg-brand/10 text-brand', priority: 'Medium', weight: 2 },
  low: { label: 'Low', chip: 'border-border bg-muted text-foreground', priority: 'Low', weight: 3 },
};

export const GAP_SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function detectAssuranceGaps({ standards = [], controls = [], evidence = [], findings = [] } = {}) {
  const gaps = [];

  const evidenceByControl = new Map();
  evidence.forEach((item) => {
    if (!item.control_id) return;
    evidenceByControl.set(item.control_id, [...(evidenceByControl.get(item.control_id) || []), item]);
  });

  // --- Controls: no evidence, unverified evidence, no owner, test overdue -----------
  controls.forEach((control) => {
    const code = control.standard_code || 'Uncoded';
    const linked = evidenceByControl.get(control.id) || [];
    const holding = linked.filter(isEvidenceHolding).length;

    if (!linked.length) {
      gaps.push({
        id: `no-evidence-${control.id}`,
        severity: 'high',
        rule: 'Control has no evidence',
        title: `${code} has no evidence linked`,
        detail: control.control_statement || 'This control has no supporting evidence recorded.',
        action: `Collect and link evidence for ${code}`,
        dueDate: addDays(14),
        controlId: control.id,
        standardCode: control.standard_code || '',
        framework: control.framework || '',
      });
    } else if (!holding) {
      gaps.push({
        id: `unverified-${control.id}`,
        severity: 'medium',
        rule: 'Evidence not verified',
        title: `${code} evidence is not verified`,
        detail: `${linked.length} evidence item(s) linked but none verified — this control does not count toward coverage.`,
        action: `Verify the evidence held for ${code}`,
        dueDate: addDays(7),
        controlId: control.id,
        standardCode: control.standard_code || '',
        framework: control.framework || '',
      });
    }

    if (!control.owner) {
      gaps.push({
        id: `no-owner-${control.id}`,
        severity: 'low',
        rule: 'Control has no owner',
        title: `${code} has no accountable owner`,
        detail: 'Without an owner nobody is answerable for keeping this control and its evidence current.',
        action: `Assign an owner for ${code}`,
        dueDate: addDays(30),
        controlId: control.id,
        standardCode: control.standard_code || '',
        framework: control.framework || '',
      });
    }

    const testRemaining = daysUntil(control.next_test_date);
    if (testRemaining !== null && testRemaining < 0) {
      gaps.push({
        id: `test-overdue-${control.id}`,
        severity: 'high',
        rule: 'Control test overdue',
        title: `${code} control test is overdue`,
        detail: `The next test was due ${control.next_test_date}. An untested control cannot be shown to be operating.`,
        action: `Test ${code} and record the result`,
        dueDate: addDays(7),
        controlId: control.id,
        standardCode: control.standard_code || '',
        framework: control.framework || '',
      });
    }
  });

  // --- Evidence: expired, expiring, unlinked, no validity window --------------------
  evidence.forEach((item) => {
    const state = evidenceState(item);
    const code = item.standard_code || 'Unlinked evidence';

    if (state === 'expired') {
      gaps.push({
        id: `expired-${item.id}`,
        severity: 'critical',
        rule: 'Evidence expired',
        title: `Expired evidence: ${item.title}`,
        detail: `Validity ended ${item.valid_to}. Until it is replaced, every control relying on it is unassured.`,
        action: `Replace expired evidence: ${item.title}`,
        dueDate: addDays(3),
        controlId: item.control_id || '',
        standardCode: item.standard_code || '',
        framework: item.framework || '',
      });
    } else if (state === 'expiring') {
      gaps.push({
        id: `expiring-${item.id}`,
        severity: 'high',
        rule: 'Evidence expiring',
        title: `Evidence expiring: ${item.title}`,
        detail: `Validity ends ${item.valid_to} — renew before it lapses to avoid a coverage break.`,
        action: `Renew evidence: ${item.title}`,
        dueDate: item.valid_to,
        controlId: item.control_id || '',
        standardCode: item.standard_code || '',
        framework: item.framework || '',
      });
    }

    if (!item.control_id) {
      gaps.push({
        id: `unlinked-${item.id}`,
        severity: 'medium',
        rule: 'Evidence not linked to a control',
        title: `Evidence is not traceable: ${item.title}`,
        detail: 'Evidence that is not linked to a control cannot support any obligation in the assurance chain.',
        action: `Link "${item.title}" to the control it supports`,
        dueDate: addDays(7),
        controlId: '',
        standardCode: code === 'Unlinked evidence' ? '' : code,
        framework: item.framework || '',
      });
    }

    if (!item.valid_to) {
      gaps.push({
        id: `no-validity-${item.id}`,
        severity: 'low',
        rule: 'Evidence has no validity window',
        title: `No expiry set: ${item.title}`,
        detail: 'Without a valid-from and valid-to date the evidence cannot be re-verified on schedule.',
        action: `Set the validity dates for "${item.title}"`,
        dueDate: addDays(30),
        controlId: item.control_id || '',
        standardCode: item.standard_code || '',
        framework: item.framework || '',
      });
    }
  });

  // --- Findings: overdue, no corrective action, no owner ---------------------------
  findings
    .filter((finding) => finding.status !== 'Closed')
    .forEach((finding) => {
      const remaining = daysUntil(finding.due_date);
      const base = {
        controlId: finding.control_id || '',
        standardCode: finding.standard_code || '',
        framework: finding.framework || '',
      };

      if (remaining !== null && remaining < 0) {
        gaps.push({
          ...base,
          id: `finding-overdue-${finding.id}`,
          severity: 'critical',
          rule: 'Corrective action overdue',
          title: `Findings overdue: ${finding.title}`,
          detail: `The corrective action was due ${finding.due_date} and the finding is still ${finding.status}.`,
          action: `Close out overdue corrective action: ${finding.title}`,
          dueDate: addDays(3),
        });
      } else if (!finding.corrective_action) {
        gaps.push({
          ...base,
          id: `finding-no-capa-${finding.id}`,
          severity: 'high',
          rule: 'Finding without a corrective action',
          title: `No corrective action: ${finding.title}`,
          detail: 'A finding cannot be verified closed without a documented corrective action.',
          action: `Record the corrective action for: ${finding.title}`,
          dueDate: addDays(7),
        });
      } else if (!finding.owner) {
        gaps.push({
          ...base,
          id: `finding-no-owner-${finding.id}`,
          severity: 'medium',
          rule: 'Finding has no owner',
          title: `No finding owner: ${finding.title}`,
          detail: 'Nobody is accountable for delivering this corrective action.',
          action: `Assign an owner to: ${finding.title}`,
          dueDate: addDays(14),
        });
      }
    });

  // --- Standards: registered but not operationally mapped --------------------------
  // Rolled up per framework: dozens of unmapped outcomes is one programme of work,
  // not dozens of separate actions.
  const unmappedByFramework = new Map();
  standards.forEach((standard) => {
    const linked = controls.filter(
      (control) =>
        control.standard_id === standard.id ||
        (control.standard_code && control.standard_code === standard.standard_code)
    );
    if (linked.length) return;
    const framework = standard.framework || 'Unspecified framework';
    const list = unmappedByFramework.get(framework) || [];
    list.push(standard.standard_code || standard.standard_title || 'Uncoded');
    unmappedByFramework.set(framework, list);
  });

  unmappedByFramework.forEach((codes, framework) => {
    const preview = codes.slice(0, 10).join(', ');
    gaps.push({
      id: `standards-unmapped-${framework}`,
      severity: 'high',
      rule: 'Standards not operationally mapped',
      title: `${codes.length} ${framework} standard${codes.length === 1 ? '' : 's'} have no controls`,
      detail: `Nothing in the business is mapped to these outcomes, so they cannot be evidenced: ${preview}${codes.length > 10 ? `, plus ${codes.length - 10} more` : ''}.`,
      action: `Map controls to the ${codes.length} unmapped ${framework} standards`,
      dueDate: addDays(30),
      controlId: '',
      standardCode: framework,
      framework,
    });
  });

  return gaps.sort((a, b) => {
    const bySeverity = GAP_SEVERITIES[a.severity].weight - GAP_SEVERITIES[b.severity].weight;
    if (bySeverity !== 0) return bySeverity;
    return String(a.dueDate).localeCompare(String(b.dueDate));
  });
}

export function summariseGaps(gaps = []) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, total: gaps.length };
  gaps.forEach((gap) => {
    counts[gap.severity] = (counts[gap.severity] || 0) + 1;
  });
  return counts;
}

/** Remediation task payload for a gap, ready for TodoTask. */
export function gapToTask(gap, tenantId = '') {
  return {
    tenant_id: tenantId,
    title: gap.action,
    task_type: 'Assurance remediation',
    module: 'Compliance',
    priority: GAP_SEVERITIES[gap.severity].priority,
    status: 'Pending',
    due_date: gap.dueDate,
    linked_entity_type: gap.controlId ? 'ComplianceControl' : 'RegulatoryStandard',
    linked_entity_id: gap.controlId || '',
    how_to_complete: gap.detail,
    important_info: `Raised by the Assurance Gap Engine · ${gap.rule}${gap.standardCode ? ` · ${gap.standardCode}` : ''}`,
    notes: gap.title,
  };
}