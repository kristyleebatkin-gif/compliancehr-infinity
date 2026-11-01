// Adapts existing FormTemplate records to the established 11-section exporter.
export const CONTROLLED_REVIEW_FIELDS = [
  ['Document owner', 'Text'], ['Department', 'Text'], ['Created date', 'Date'],
  ['Modified date', 'Date'], ['Last review date', 'Date'], ['Next review date', 'Date'],
  ['Review frequency', 'Text'], ['Evidence references and findings', 'Long text'],
  ['Actions and responsible person', 'Long text'], ['Reviewer', 'Text'],
  ['Review outcome', 'Text'], ['Review findings and recommendations', 'Long text'],
  ['Approver', 'Text'], ['Approval date', 'Date'], ['Approval notes and signature reference', 'Long text'],
];
export function parseReviewFields(template) {
  try {
    const fields = JSON.parse(template?.fields_schema || '[]');
    return Array.isArray(fields) ? fields.filter((f) => typeof f?.label === 'string') : [];
  } catch { return []; }
}
export function controlledReviewRecord(template, values = {}) {
  const code = template.title.match(/^F\d{3}\b/)?.[0] || `RFT-${template.id.slice(-6).toUpperCase()}`;
  return {
    documentName: template.title, documentNumber: code, recordId: template.id,
    versionNumber: template.version || '1.0', status: template.status || 'Draft',
    module: 'Compliance', category: template.category,
    owner: values['Document owner'] || '', department: values.Department || '',
    createdDate: values['Created date'] || '', modifiedDate: values['Modified date'] || '',
    lastReviewDate: values['Last review date'] || '', nextReviewDate: values['Next review date'] || '',
    reviewFrequency: values['Review frequency'] || '', approvedBy: values.Approver || '',
    approvalDate: values['Approval date'] || '',
    purpose: template.description || '',
    scope: template.instructions || '',
    relatedDocuments: ['F046 Document Approval and Review', 'F045 Continuous Improvement and CAPA'],
    mainFields: parseReviewFields(template).map((f, i) => ({
      key: `field-${i}`, label: f.label, value: values[f.label] || '____________________',
    })),
    evidenceItems: [values['Evidence references and findings'] || 'Evidence reference and findings: ____________________'],
    actionsItems: [values['Actions and responsible person'] || 'Action, owner and due date: ____________________'],
    reviewer: values.Reviewer || '', reviewOutcome: values['Review outcome'] || '',
    reviewNotes: values['Review findings and recommendations'] || '',
    approvalNotes: values['Approval notes and signature reference'] || '',
  };
}
