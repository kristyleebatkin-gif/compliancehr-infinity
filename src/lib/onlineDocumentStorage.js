import { base44 } from '@/api/base44Client';
import { buildBrandedTemplatePdf, getTemplateMeta } from '@/lib/officialFormTemplates';
import { routeDocument } from '@/lib/documentRouting';

export const documentFormKey = (library, title, caseId = '') => `online:${library}:${caseId}:${title}`;
export const blankOnlineDocument = (answers = {}) => ({ answers: { ...answers }, tableRows: [], name: '', signature: '', confirmed: false });
export const readOnlineDocument = (record, answers = {}) => ({ ...blankOnlineDocument(answers), ...JSON.parse(record?.data || '{}') });

export async function saveOnlineDocumentDraft({ record, title, libraryKey, intakeCase, model, user }) {
  const data = JSON.stringify(model);
  if (data.length > 120000) throw new Error('This document is too large to save. Please shorten long answers or split register entries into another document.');
  const payload = {
    form_template_id: documentFormKey(libraryKey, title, intakeCase?.id),
    form_title: title,
    category: intakeCase ? `${intakeCase.intake_type} Intake` : `${libraryKey} Forms Library`,
    ...(intakeCase ? { intake_case_id: intakeCase.id } : {}),
    ...(libraryKey.startsWith('participant-') ? { participant_id: libraryKey.slice(12) } : {}),
    ...(libraryKey.startsWith('staff-') ? { employee_id: libraryKey.slice(6) } : intakeCase?.intake_type === 'Employee' && intakeCase.related_profile_id ? { employee_id: intakeCase.related_profile_id } : {}),
    submitted_by: user.full_name || user.email,
    saved_by_user_id: user.id,
    submission_method: 'Online', online_document: true, data, status: 'Draft',
  };
  return record?.status === 'Draft'
    ? base44.entities.FormSubmission.update(record.id, payload)
    : base44.entities.FormSubmission.create(payload);
}

export async function fileOnlineDocument({ title, code, definition, model, user, libraryKey, onFinalize }) {
  const completedAt = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
  const meta = getTemplateMeta(title) || {};
  const doc = await buildBrandedTemplatePdf({
    title, code, subtitle: definition.label || title, ...meta,
    fields: [...(definition.fields || []), { label: 'Declaration confirmed by' }],
    values: { ...model.answers, 'Declaration confirmed by': model.name },
    columns: definition.columns, rows: model.tableRows.length,
    tableValues: model.tableRows, completedBy: user.full_name || user.email, completedAt,
    signatureDataUrl: model.signature,
  });
  const file = new File([doc.output('blob')], `${title} (completed online).pdf`, { type: 'application/pdf' });
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
  if (onFinalize) await onFinalize({ file_uri, file_name: file.name, answers: model.answers, tableRows: model.tableRows });
  else {
    const record = await base44.entities.FormsLibraryDocument.create({
      library: libraryKey, document_type: title, title: `${title} - ${model.name}`,
      person_name: model.name, file_name: file.name, file_uri,
      uploaded_date: new Date().toISOString().slice(0, 10), uploaded_by: user.full_name || user.email,
    });
    await routeDocument(record);
  }
  return file_uri;
}