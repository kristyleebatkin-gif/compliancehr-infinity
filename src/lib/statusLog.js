import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export function formatLogLine(fromStatus, toStatus, changedBy) {
  return `${format(new Date(), 'd MMM yyyy HH:mm')} - ${fromStatus || 'New'} to ${toStatus}${changedBy ? ` by ${changedBy}` : ''}`;
}

export async function currentUserName() {
  try {
    const me = await base44.auth.me();
    return me?.full_name || me?.email || 'System';
  } catch {
    return 'System';
  }
}

export async function recordStatusLog(entityType, record, toStatus, changedBy, notes) {
  await base44.entities.StatusLog.create({
    entity_type: entityType,
    record_id: record.id,
    record_title: record.title || record.subject || '',
    from_status: record.status || '',
    to_status: toStatus,
    changed_by: changedBy || 'System',
    notes: notes || '',
  });
}

export async function changeStatus({ entityType, entity, record, toStatus, dateField, statusLogField = 'status_log' }) {
  const changedBy = await currentUserName();
  const line = formatLogLine(record.status, toStatus, changedBy);
  const updates = { status: toStatus, [statusLogField]: [record[statusLogField], line].filter(Boolean).join('\n') };
  if (dateField) updates[dateField] = new Date().toISOString();
  await base44.entities[entity].update(record.id, updates);
  await recordStatusLog(entityType, record, toStatus, changedBy);
  return changedBy;
}