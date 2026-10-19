import { base44 } from '@/api/base44Client';

// Fire-and-forget client helper: logs a staff/participant action so admins
// see it in the audit trail and on the dashboard actions panel.
export function logUserAction(action, entity_type, { record_id, record_title, details } = {}) {
  return base44.functions
    .invoke('logUserAction', { action, entity_type, record_id, record_title, details, route: window.location.pathname })
    .catch((error) => console.error(error));
}