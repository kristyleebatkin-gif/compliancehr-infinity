import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { HR_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';

// Only these fields may be written, per document kind.
const ALLOWED_FIELDS = {
  contract: new Set(['staff_profile_id', 'employee_id', 'employee_user_id', 'employee_name', 'position_title',
    'employment_type', 'classification', 'industrial_instrument', 'manager_name', 'commencement_date', 'end_date',
    'probation_end_date', 'ordinary_weekly_hours', 'hourly_rate', 'position_duties', 'contract_status',
    'employee_signed_date', 'employer_signed_date', 'completed_date', 'completed_by', 'document_url',
    'source_employee_document_id', 'signature', 'notes', 'archived']),
  position: new Set(['staff_profile_id', 'employee_id', 'employee_user_id', 'employee_name', 'position_title',
    'reports_to', 'employment_type', 'position_purpose', 'key_responsibilities', 'essential_requirements',
    'qualifications_experience', 'performance_measures', 'status', 'document_url', 'source_employee_document_id',
    'acknowledged_date', 'notes', 'archived']),
};

/**
 * Saves HR paperwork records (employment contracts and position descriptions).
 * The underlying entities are service-role-write only, so this narrowly scoped
 * function performs the create/update on behalf of an authorised HR user,
 * with an explicit field allowlist.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasAnyRole(user, HR_ROLES)) {
      return Response.json({ error: 'HR access required' }, { status: 403 });
    }

    const body = await req.json();
    const action = body.action;
    const kind = body.kind;
    const data = body.data || {};
    const id = body.id;

    if (action !== 'create' && action !== 'update') {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
    if (kind !== 'contract' && kind !== 'position') {
      return Response.json({ error: 'kind must be contract or position' }, { status: 400 });
    }
    const entityName = kind === 'contract' ? 'EmployeeEmploymentContract' : 'EmployeePositionDescription';
    const entity = base44.asServiceRole.entities[entityName];
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([field]) => ALLOWED_FIELDS[kind].has(field)),
    );

    if (action === 'create') {
      if (!cleanData.staff_profile_id || !String(cleanData.position_title || '').trim() || (kind === 'contract' && !cleanData.commencement_date)) {
        return Response.json({ error: 'Employee profile, position and contract commencement date are required' }, { status: 400 });
      }
      const staff = await base44.asServiceRole.entities.StaffProfile.get(cleanData.staff_profile_id);
      if (!staff) return Response.json({ error: 'Employee profile not found' }, { status: 404 });
      cleanData.employee_name = staff.full_name;
      cleanData.employee_id = staff.employee_number || staff.id;
      const record = await entity.create(cleanData);
      return Response.json({ record });
    }
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });
    const record = await entity.update(id, cleanData);
    return Response.json({ record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}