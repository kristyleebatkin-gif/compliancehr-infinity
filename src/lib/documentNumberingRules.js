// Stable identifiers and versions are separate document-control concepts.
export const DOCUMENT_NUMBERING_RULES = [
  'F001 onward identifies a reusable master form. Keep F095 as F095; store v2.1 separately as its version.',
  'B01 onward and CONT remain the existing base-form and continuation-sheet master identifiers.',
  'Use CHR-TYPE-YEAR-NNN for separately registered controlled documents or completed records; link each record to its master form and version.',
  'Retain existing CHR and RFT identifiers as legacy aliases. Do not renumber records, reuse issued numbers or break existing links.',
  'Allocate new record sequences from the central document register after checking uniqueness; do not use random three-digit numbers.',
  'Editing or duplicating a form leaves it Draft. Activate only after the authorised F046 approval step with real evidence, approver and dates.',
];
