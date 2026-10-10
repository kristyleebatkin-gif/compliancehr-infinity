import { base44 } from '@/api/base44Client';
import { downloadCsv } from '@/lib/csvExport';

const COLUMNS = [
  { key: 'timestamp', label: 'When' }, { key: 'action', label: 'Action' },
  { key: 'entity_type', label: 'Module' }, { key: 'record_title', label: 'Record' },
  { key: 'performed_by', label: 'User' }, { key: 'performed_by_email', label: 'Email' },
  { key: 'performed_by_role', label: 'Role' }, { key: 'route', label: 'Route' },
  { key: 'details', label: 'Details' },
];

export async function exportModuleAccessLog(route, filename) {
  const rows = [];
  let cursor;
  do {
    const page = await base44.entities.AuditLog.filter({ route }, { sort: '-timestamp', limit: 500, cursor });
    rows.push(...page.items);
    cursor = page.next_cursor;
  } while (cursor);
  downloadCsv(filename, COLUMNS, rows);
  return rows.length;
}