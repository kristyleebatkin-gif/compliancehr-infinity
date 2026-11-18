/**
 * Shared primitives for the register services (decision register, compliance operations).
 * Kept in one place so validation, date handling and audit evidence behave identically everywhere.
 */

export const str = (value: any) => (typeof value === 'string' ? value.trim() : '');

export const num = (value: any) => (Number.isFinite(Number(value)) ? Number(value) : null);

export const dateOnly = (value: any) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '');

export const clampPercent = (value: any) => {
  const n = num(value);
  return n === null ? null : Math.max(0, Math.min(100, Math.round(n)));
};

export const today = () => new Date().toISOString().slice(0, 10);

export const nowIso = () => new Date().toISOString();

export const round = (value: number) => Math.round(value);

/** Appends an audit record. Every register write goes through this so the trail cannot be skipped. */
export async function writeAudit(
  base44: any,
  user: any,
  options: {
    action: string;
    entityType: string;
    record: any;
    details: any;
    route: string;
    title?: string;
  },
) {
  const { action, entityType, record, details, route, title } = options;
  await base44.asServiceRole.entities.AuditLog.create({
    tenant_id: record?.tenant_id || '',
    action,
    entity_type: entityType,
    record_id: record?.id || '',
    record_title: title || record?.title || record?.control_statement || record?.gap_title
      || record?.assessment_ref || record?.plan_ref || entityType,
    performed_by: user.full_name || user.email || 'Unknown',
    performed_by_user_id: user.id,
    performed_by_email: user.email || '',
    performed_by_role: user.role,
    route,
    details: JSON.stringify(details || {}).slice(0, 4000),
    timestamp: nowIso(),
  });
}