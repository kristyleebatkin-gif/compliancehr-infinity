import { base44 } from '@/api/base44Client';

export async function recordSafetyEvent(entityType, recordId, { notify = true } = {}) {
  const response = await base44.functions.invoke('safetyEvent', {
    entity_type: entityType,
    record_id: recordId,
    notify,
  });
  if (response.data?.error) throw new Error(response.data.error);
  return response.data;
}