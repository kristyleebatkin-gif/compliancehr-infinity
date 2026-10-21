import { base44 } from '@/api/base44Client';
export async function loadEmployeeForm({ profileId, intakeCaseId, title }) {
  const { data } = await base44.functions.invoke('employeeRecordBridge', { action: 'load', profile_id: profileId, intake_case_id: intakeCaseId, title });
  return data;
}
export async function syncEmployeeRecord(source, id, changedFields) {
  const { data } = await base44.functions.invoke('employeeRecordBridge', { action: 'sync', source, id, changed_fields: changedFields });
  return data;
}