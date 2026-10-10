// Compliance NQ™ Safeguarding Essentials™ — Competency Assessment Checklist Library
// Structured supervisor competency checklists for the LMS supervisor sign-off stage.
// Module numbers without a checklist fall back to the module's standard supervisor items.

export const COMPETENCY_CHECKLIST_TITLE = 'Safeguarding Essentials™ Competency Assessment Checklist';

export const COMPETENCY_CHECKLISTS = {};

export function getCompetencyChecklist(moduleNumber) {
  return COMPETENCY_CHECKLISTS[moduleNumber] || null;
}