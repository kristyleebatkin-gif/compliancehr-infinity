import { base44 } from '@/api/base44Client';

// Fire-and-forget client helper: logs all 14 global activity verbs (Create, Edit, Save, Submit,
// Review, Approve, Reject, Upload, Download, Export, Print, Archive, Restore, Delete)
// with module, record, previous_value, and new_value into AuditLog & StatusLog.
export function logUserAction(
  action,
  entity_type,
  { record_id, record_title, details, person, previous_value, new_value, module } = {}
) {
  const enrichedDetails = [
    details,
    module ? `Module: ${module}` : null,
    previous_value !== undefined ? `Previous: ${previous_value}` : null,
    new_value !== undefined ? `New: ${new_value}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  return base44.functions
    .invoke('logUserAction', {
      action,
      entity_type,
      record_id,
      record_title,
      details: enrichedDetails || details,
      person,
      route: typeof window !== 'undefined' ? window.location.pathname : '/dashboard',
    })
    .catch((error) => console.error(error));
}