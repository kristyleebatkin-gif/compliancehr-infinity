import { updateChanged } from './employeeRecordFields.ts';
const known = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Staff Badge'];
export async function fileEmployeeDocument(entities, profile, cases, source, sourceType) {
  if (!source.file_uri) return;
  const title = (source.document_type === 'Other' ? source.title : source.document_type) || source.title || 'Supporting document';
  const date = source.uploaded_date || new Date().toISOString().slice(0, 10);
  const upsert = async (entity, query, values) => {
    const page = await entity.filter(query, { limit: 1 });
    if (page.items[0]) await updateChanged(entity, page.items[0], values);
    else await entity.create({ ...query, ...values });
  };
  if (sourceType !== 'FormsLibraryDocument') await upsert(entities.FormsLibraryDocument, { library: `staff-${profile.id}`, file_uri: source.file_uri }, {
    document_type: title, title: source.title || title, person_name: profile.full_name,
    file_name: source.file_name || source.title || title, uploaded_date: date, uploaded_by: source.uploaded_by || '',
  });
  if (sourceType !== 'EmployeeDocument') await upsert(entities.EmployeeDocument, { employee_id: profile.id, file_uri: source.file_uri }, {
    employee_name: profile.full_name, title: source.title || title, document_type: known.includes(title) ? title : 'Other',
    ...(source.issue_date ? { issue_date: source.issue_date } : {}), ...(source.expiry_date ? { expiry_date: source.expiry_date } : {}), status: source.status || 'Current',
  });
  for (const intake of cases) {
    if (sourceType !== 'IntakeDocument') await upsert(entities.IntakeDocument, { intake_case_id: intake.id, file_uri: source.file_uri }, {
      intake_type: 'Employee', profile_id: profile.id, intake_case_number: intake.case_number, document_type: title,
      file_name: source.file_name || source.title || title, uploaded_date: date, uploaded_by: source.uploaded_by || '',
    });
    // Filing a supporting attachment does not grant approval or complete an intake requirement.
  }
}