export const TRAINING_PACKAGE_PREFIX = 'CHR-TRAINING-PACKAGE:1\n';
export const TRAINING_PACKAGE_SECTIONS = [
  ['purpose', 'Purpose and scope'],
  ['outcomes', 'Learning outcomes'],
  ['learnerGuide', 'Learner guide and worked examples'],
  ['sessionPlan', 'Facilitator session plan'],
  ['knowledgeCheck', 'Knowledge checks and assessment criteria'],
  ['practicalCheck', 'Practical observation checklist'],
  ['participantAdaptation', 'Participant-specific adaptations and limits'],
  ['evidence', 'Evidence required and assessment records'],
  ['sources', 'Policies, standards and source references'],
  ['followUp', 'Remediation, supervision and refresher plan'],
];
export function readTrainingPackage(description) {
  if (typeof description !== 'string' || !description.startsWith(TRAINING_PACKAGE_PREFIX)) return null;
  try {
    const value = JSON.parse(description.slice(TRAINING_PACKAGE_PREFIX.length));
    return value && value.version === 1 && typeof value.sections === 'object' ? value : null;
  } catch { return null; }
}
export function trainingTemplateSummary(template) {
  const pack = readTrainingPackage(template.description);
  return pack ? pack.summary || 'Provider-authored training package' : template.description || '';
}
export function trainingPackageText(template) {
  const pack = readTrainingPackage(template.description);
  if (!pack) return template.description || '';
  return [
    '# ' + template.name, 'Role: ' + template.role,
    'Status: ' + pack.status, 'Version: ' + (pack.revision || 'Draft'),
    'Reviewer: ' + (pack.reviewer || 'Not recorded'),
    'Reviewed: ' + (pack.reviewedDate || 'Not recorded'),
    'Next review: ' + (pack.reviewDate || 'Not set'),
    'Internal provider training. Not an accredited qualification or proof of practical competence.',
    ...TRAINING_PACKAGE_SECTIONS.flatMap(([key, label]) => ['\n## ' + label, pack.sections[key] || 'Content required before approval.']),
  ].join('\n\n');
}
