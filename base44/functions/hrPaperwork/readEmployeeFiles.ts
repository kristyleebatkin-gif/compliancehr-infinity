import { hasApprovedAccess } from '../../shared/appAccess.ts';

const READ_ROLES = ['admin', 'Provider Administrator', 'Management', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager', 'Rostering Coordinator'];
const KINDS = { contract: 'EmployeeEmploymentContract', position: 'EmployeePositionDescription', upload: 'EmployeeDocument', form: 'FormsLibraryDocument', letter: 'StaffLetter', appraisal: 'EmployeePerformanceAppraisal', review: 'PerformanceReview' };
export async function readEmployeeFiles(base44, user, body) {
  if (!hasApprovedAccess(user) || ['Participant', 'Auditor'].includes(user.role)) return Response.json({ error: 'Employee access required' }, { status: 403 });
  if (!Object.hasOwn(KINDS, body.kind)) return Response.json({ error: 'Invalid HR file category' }, { status: 400 });
  let profile;
  if (body.staff_profile_id && READ_ROLES.includes(user.role)) {
    profile = await base44.asServiceRole.entities.StaffProfile.get(String(body.staff_profile_id));
  } else {
    if (!user.email) return Response.json({ error: 'A verified employee email is required' }, { status: 403 });
    const page = await base44.asServiceRole.entities.StaffProfile.filter({ email: user.email }, { limit: 2 });
    if (page.items.length > 1) return Response.json({ error: 'Duplicate employee profiles found. Ask an administrator to correct the link.' }, { status: 409 });
    profile = page.items[0];
    if (body.staff_profile_id && body.staff_profile_id !== profile?.id) return Response.json({ error: 'Only your own HR files are available' }, { status: 403 });
  }
  if (!profile) return Response.json({ items: [], has_more: false, next_cursor: null, linked: false, status_counts: [] });
  const kind = body.kind;
  let query;
  if (kind === 'form') query = { library: `staff-${profile.id}` };
  else if (kind === 'upload') {
    const ids = [profile.id];
    if (profile.employee_number) {
      const numbers = await base44.asServiceRole.entities.StaffProfile.filter({ employee_number: profile.employee_number }, { limit: 2, fields: ['id'] });
      if (numbers.items.length === 1) ids.push(profile.employee_number);
    }
    query = { employee_id: { $in: ids }, status: { $ne: 'Archived' } };
  }
  else if (kind === 'letter') query = { staff_id: profile.id };
  else if (kind === 'review') query = { staff_id: profile.id };
  else query = { staff_profile_id: profile.id, archived: { $ne: true } };
  // Legacy name-only files are included only for an unambiguous employee name.
  if (['review', 'upload'].includes(kind) && profile.full_name) {
    const names = await base44.asServiceRole.entities.StaffProfile.filter({ full_name: profile.full_name }, { limit: 2, fields: ['id'] });
    if (names.items.length === 1) {
      const idField = kind === 'review' ? 'staff_id' : 'employee_id';
      const nameField = kind === 'review' ? 'staff_name' : 'employee_name';
      const legacy = { $and: [{ [nameField]: profile.full_name }, { $or: [{ [idField]: '' }, { [idField]: null }] }] };
      query = kind === 'review' ? { $or: [query, legacy] } : { $and: [{ status: { $ne: 'Archived' } }, { $or: [query, legacy] }] };
    }
  }
  const entity = base44.asServiceRole.entities[KINDS[kind]];
  const [page, statuses] = await Promise.all([
    entity.filter(query, { sort: '-created_date', limit: 25, ...(typeof body.cursor === 'string' && body.cursor.length <= 2000 ? { cursor: body.cursor } : {}) }),
    kind === 'review' ? entity.aggregate({ query, groupBy: 'status' }) : Promise.resolve({ rows: [] }),
  ]);
  return Response.json({ ...page, linked: true, status_counts: statuses.rows });
}