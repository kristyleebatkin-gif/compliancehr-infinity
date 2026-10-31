// Professional per-module compliance audit checklist.
// Items are evaluated live from the module's registers, trackers, Forms
// Library and Internal Audit Register, so every audit report's checklist
// reflects real, current data rather than static claims.
const DOC_KEYWORDS = ['document', 'form', 'manual', 'policy', 'certificate', 'chemical', 'insurance', 'msds', 'plan'];

export const isDocRegister = (label) => DOC_KEYWORDS.some((k) => (label || '').toLowerCase().includes(k));

// Builds the checklist + corrective actions for one module audit.
// audit: result of gatherModuleAudit (entities, trackers, docs, formsCounts, priorAudits)
export function buildModuleAuditChecklist(audit) {
  const alerts = audit.trackers.filter((t) => t.value > 0);
  const items = [];
  const total = audit.entities.reduce((s, e) => s + (e.count || 0), 0);
  const anyRecent90 = audit.entities.some((e) => (e.recent90 || 0) > 0);

  // 1. Register maintenance
  if (total === 0) {
    items.push({ item: 'Module register is actively maintained', status: 'Not required', evidence: 'No records on file for this module yet.' });
  } else if (anyRecent90) {
    items.push({ item: 'Module register is actively maintained', status: 'Pass', evidence: 'Records were added in the last 90 days.' });
  } else {
    items.push({ item: 'Module register is actively maintained', status: 'Attention', evidence: 'No records added in the last 90 days.' });
  }

  // 2. Live tracker clear
  items.push(alerts.length === 0
    ? { item: 'Live compliance tracker is clear (no overdue or due-soon items)', status: 'Pass', evidence: 'All tracked compliance dates are in date.' }
    : { item: 'Live compliance tracker is clear (no overdue or due-soon items)', status: 'Attention', evidence: `${alerts.map((a) => `${a.value} ${a.label}`).join(', ')}.` });

  // 3. Documents and forms recorded
  const docCount = (audit.docs || []).reduce((s, d) => s + (d.count || 0), 0);
  items.push(docCount > 0
    ? { item: 'Documents and forms for this module are recorded and filed', status: 'Pass', evidence: `${docCount} document/form record(s) on file.` }
    : { item: 'Documents and forms for this module are recorded and filed', status: 'Not required', evidence: 'No document or form registers apply to this module.' });

  // 4. Forms Library currency
  const empForms = audit.formsCounts?.Employee || 0;
  const parForms = audit.formsCounts?.Participant || 0;
  const forms = empForms + parForms;
  items.push(forms > 0
    ? { item: 'Current forms are available in the Forms Library', status: 'Pass', evidence: `${forms} form(s) on file (Employee: ${empForms}, Participant: ${parForms}).` }
    : { item: 'Current forms are available in the Forms Library', status: 'Attention', evidence: 'Forms Library has no entries yet.' });

  // 5. Export availability is not proven by the register data gathered here.
  // Keep this unverified until the module's CSV and branded PDF actions are exercised.
  items.push({ item: 'Register exports (CSV and branded PDF) are available for this module', status: 'Attention', evidence: 'Export actions were not verified during this live data check.' });

  // 6. Prior audit evidence
  items.push((audit.priorAudits || 0) > 0
    ? { item: 'Internal audit evidence is logged in the Internal Audit Register', status: 'Pass', evidence: `${audit.priorAudits} prior audit(s) logged for this module.` }
    : { item: 'Internal audit evidence is logged in the Internal Audit Register', status: 'Attention', evidence: 'No prior audit logged; this report creates the first entry.' });

  // 7. Corrective actions tracked
  items.push(alerts.length === 0
    ? { item: 'Corrective actions are assigned, due-dated and tracked to closure', status: 'Pass', evidence: 'No corrective actions open.' }
    : { item: 'Corrective actions are assigned, due-dated and tracked to closure', status: 'Attention', evidence: `${alerts.length} open corrective action(s) listed in this report.` });

  // 8+. One live item per tracker in this module
  for (const t of audit.trackers) {
    items.push(t.value === 0
      ? { item: `All ${t.label.toLowerCase()} actioned`, status: 'Pass', evidence: 'Live check at audit time.' }
      : { item: `All ${t.label.toLowerCase()} actioned`, status: 'Attention', evidence: `${t.value} item(s) open.` });
  }

  // 9+. File checklist coverage: every listed document in the participant or
  // staff file checklist, checked live against the profiles in the system.
  const fc = audit.fileChecklist;
  if (fc?.entries?.length) {
    const subject = fc.kind === 'participant' ? 'participant' : 'staff';
    const subjectTitle = fc.kind === 'participant' ? 'Participant file checklist' : 'Staff file checklist';
    for (const e of fc.entries) {
      if (!e.total) {
        items.push({ item: `${subjectTitle}: ${e.label} on file`, status: 'Not required', evidence: `No ${subject} profiles in the system yet.` });
      } else if (e.have === e.total) {
        items.push({ item: `${subjectTitle}: ${e.label} on file`, status: 'Pass', evidence: `${e.have} of ${e.total} ${subject} file(s) hold this document.` });
      } else {
        items.push({ item: `${subjectTitle}: ${e.label} on file`, status: 'Attention', evidence: `${e.have} of ${e.total} ${subject} file(s) hold this document.` });
      }
    }
  }

  return { items, alerts };
}

// Corrective action register rows for one module audit.
export function buildCorrectiveActions(audit, { owner = '' } = {}) {
  const actions = [];
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  for (const a of (audit.trackers || []).filter((t) => t.value > 0)) {
    actions.push({
      action: `Review and resolve ${a.value} ${a.label.toLowerCase()}`,
      owner: owner || 'Module owner',
      due: due,
      status: 'Open',
    });
  }
  const fc = audit.fileChecklist;
  if (fc?.entries?.length) {
    const subject = fc.kind === 'participant' ? 'participant' : 'staff';
    for (const e of fc.entries) {
      if (e.total > 0 && e.have < e.total) {
        actions.push({
          action: `Obtain ${e.total - e.have} missing ${e.label} record(s) from ${subject} files`,
          owner: owner || 'Module owner',
          due: due,
          status: 'Open',
        });
      }
    }
  }
  return actions;
}