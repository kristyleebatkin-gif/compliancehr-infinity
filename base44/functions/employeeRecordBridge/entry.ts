import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { employeeFields, canonicalEmployeeForm, parseAnswers, eachPage, updateChanged } from '../../shared/employeeRecordFields.ts';
import { fileEmployeeDocument } from '../../shared/employeeDocumentBridge.ts';
import { hasApprovedAccess } from '../../shared/appAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user) || user.role === 'Participant') return Response.json({ error: 'Staff access required' }, { status: 403 });
    const body = await req.json();
    const allowed = ['StaffProfile', 'IntakeCase', 'StaffFormEntry', 'FormSubmission', 'EmployeeDocument', 'FormsLibraryDocument', 'IntakeDocument'];
    if (!['load', 'sync'].includes(body.action) || (body.action === 'sync' && (!allowed.includes(body.source) || typeof body.id !== 'string'))) return Response.json({ error: 'Invalid request' }, { status: 400 });
    const entities = base44.asServiceRole.entities;
    const source = body.action === 'sync' ? await entities[body.source].get(body.id) : null;
    let profileId = body.profile_id || (body.source === 'StaffProfile' ? source.id : source?.staff_id || source?.employee_id || source?.profile_id || (source?.library?.startsWith('staff-') ? source.library.slice(6) : ''));
    let caseId = body.intake_case_id || (body.source === 'IntakeCase' ? source.id : source?.intake_case_id);
    if (caseId?.startsWith('profile-')) { profileId = profileId || caseId.slice(8); caseId = null; }
    let intake = caseId ? await entities.IntakeCase.get(caseId) : null;
    if (intake && intake.intake_type !== 'Employee') return Response.json({ error: 'Not an employee intake' }, { status: 400 });
    profileId = profileId || intake?.related_profile_id;
    const profile = profileId ? await entities.StaffProfile.get(profileId) : null;
    const manager = ['admin', 'Provider Administrator', 'Human Resources Manager', 'Administration', 'Intake Officer'].includes(user.role);
    const owner = profile?.email || intake?.email;
    if (!owner && !profile && !intake) return Response.json({ skipped: true, reason: 'Link an employee profile first' });
    if (!manager && (!owner || owner.toLowerCase() !== user.email?.toLowerCase() || (intake && intake.email?.toLowerCase() !== user.email?.toLowerCase()))) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (intake?.related_profile_id && profile && intake.related_profile_id !== profile.id) return Response.json({ error: 'Employee link mismatch' }, { status: 400 });
    const cases = [];
    if (profile) await eachPage(entities.IntakeCase, { intake_type: 'Employee', related_profile_id: profile.id }, (item) => { cases.push(item); });
    if (intake && !cases.some((item) => item.id === intake.id)) cases.push(intake);
    intake = intake || cases[0];
    const title = canonicalEmployeeForm(body.title || source?.form_type || source?.form_title || '');
    if (body.action === 'load') {
      if (!title || title.length > 200) return Response.json({ error: 'Choose a form' }, { status: 400 });
      const forms = [];
      if (profile) await eachPage(entities.StaffFormEntry, { staff_id: profile.id }, (item) => { if (canonicalEmployeeForm(item.form_type) === title) forms.push({ ...item, values: parseAnswers(item.answers) }); });
      const queries = [...(profile ? [{ employee_id: profile.id, online_document: true }] : []), ...cases.map((item) => ({ intake_case_id: item.id, online_document: true }))];
      for (const query of queries) await eachPage(entities.FormSubmission, query, (item) => { if (canonicalEmployeeForm(item.form_title) === title) forms.push({ ...item, values: parseAnswers(item.data).answers || {} }); });
      const answers = Object.assign({}, ...forms.sort((a, b) => String(a.updated_date).localeCompare(String(b.updated_date))).map((item) => item.values));
      for (const [field, intakeField, labels] of employeeFields) {
        const value = profile?.[field] ?? intake?.[intakeField];
        if (value !== undefined) for (const label of labels) if (Object.hasOwn(answers, label)) answers[label] = value;
      }
      const defaults = {};
      for (const [field, intakeField, labels] of employeeFields) for (const label of labels) defaults[label] = profile?.[field] ?? intake?.[intakeField] ?? '';
      return Response.json({ answers, defaults, entry: forms.filter((item) => item.staff_id).at(-1) || null });
    }
    const profileValues = {}, intakeValues = {};
    const isForm = ['StaffFormEntry', 'FormSubmission'].includes(body.source);
    const online = body.source === 'FormSubmission' ? parseAnswers(source.data) : null;
    const answers = isForm ? (online ? { ...online.answers, __rows: online.tableRows || [] } : parseAnswers(source.answers)) : {};
    for (const [field, intakeField, labels] of employeeFields) {
      const answer = labels.find((label) => Object.hasOwn(answers, label));
      const value = body.source === 'StaffProfile' ? source[field] : body.source === 'IntakeCase' ? source[intakeField] : answer ? answers[answer] : undefined;
      if (value !== undefined && typeof value === 'string') { profileValues[field] = value; intakeValues[intakeField] = value; }
    }
    if (profile && body.source !== 'StaffProfile') await updateChanged(entities.StaffProfile, profile, profileValues);
    for (const item of cases) if (body.source !== 'IntakeCase' || item.id !== source.id) await updateChanged(entities.IntakeCase, item, intakeValues);
    if (body.source === 'IntakeCase') await updateChanged(entities.IntakeCase, source, intakeValues);
    if (isForm && profile) {
      const existing = await entities.StaffFormEntry.filter({ staff_id: profile.id, form_type: title }, { sort: '-updated_date', limit: 1 });
      const previous = existing.items[0];
      const values = { staff_name: profile.full_name, answers: JSON.stringify({ ...parseAnswers(previous?.answers), ...answers }), completed_by: user.full_name || user.email, completed_date: new Date().toISOString().slice(0, 10) };
      if (previous) await updateChanged(entities.StaffFormEntry, previous, values);
      else await entities.StaffFormEntry.create({ ...values, staff_id: profile.id, form_type: title });
    }
    if (profile && Object.keys(profileValues).length) await eachPage(entities.StaffFormEntry, { staff_id: profile.id }, async (item) => {
      const values = parseAnswers(item.answers);
      for (const [field, , labels] of employeeFields) if (Object.hasOwn(profileValues, field)) for (const label of labels) if (Object.hasOwn(values, label)) values[label] = profileValues[field];
      await updateChanged(entities.StaffFormEntry, item, { answers: JSON.stringify(values) });
    });
    if (profile) {
      if (['EmployeeDocument', 'FormsLibraryDocument', 'IntakeDocument'].includes(body.source)) await fileEmployeeDocument(entities, profile, cases, source, body.source);
      for (const file of (Array.isArray(answers.__documents) ? answers.__documents.slice(0, 5) : [])) await fileEmployeeDocument(entities, profile, cases, { file_uri: file.file_uri, file_name: file.name, document_type: title, title }, 'StaffFormEntry');
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}