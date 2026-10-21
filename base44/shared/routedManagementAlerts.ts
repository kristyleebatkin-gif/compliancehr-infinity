const ROLES = {
  Incident: ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'],
  Risk: ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'],
  DataBreach: ['admin', 'Provider Administrator'],
};
const PATHS = { Incident: '/incidents', Risk: '/risks', DataBreach: '/documents' };
export async function notifyRoutedManagement(service, entity, recordId, type, message) {
  if (!ROLES[entity]) return 0;
  const records = await service.entities.User.list();
  const recipients = (Array.isArray(records) ? records : records.items || []).filter((user) => ROLES[entity].includes(user.role) && !['Rejected', 'Archived', 'Suspended'].includes(user.account_status));
  let sent = 0;
  for (let offset = 0; offset < recipients.length; offset += 6) {
    await Promise.all(recipients.slice(offset, offset + 6).map(async (user) => {
      const key = { recipient_id: user.id, linked_entity_type: entity, linked_entity_id: recordId, type, message };
      const existing = await service.entities.Notification.filter(key, { limit: 1 });
      if (existing.items.length) return;
      await service.entities.Notification.create({ ...key, recipient: user.full_name || user.email, read: false, action_url: entity === 'Incident' ? `/incidents/${encodeURIComponent(recordId)}` : PATHS[entity] });
      sent++;
    }));
  }
  return sent;
}