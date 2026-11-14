import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveTenantContext, scopeQuery, stampTenant, denied, TENANT_ENFORCEMENT_ON } from '../../shared/tenantContext.ts';

const ALLOWED_ROLES = [
  'admin',
  'Provider Administrator',
  'Compliance Manager',
  'Administration',
  'Team Leader',
  'Quality & Improvement Manager',
  'Human Resources Manager',
  'Rostering Coordinator',
  'Finance & Accounts Officer',
];

const SPECS = [
  { key: 'intake', title: 'Intake Centre', entity: 'IntakeCase', groupBy: 'intake_type' },
  { key: 'rostering', title: 'Rostering', entity: 'Shift', groupBy: 'status' },
  { key: 'goals', title: 'Goal Progress', entity: 'Goal', groupBy: 'status' },
  { key: 'programs', title: 'Programs & Events', entity: 'Event', groupBy: 'status', counts: ['CommunityProgram'] },
  { key: 'risks', title: 'Risk Reporting', entity: 'Risk', groupBy: 'status' },
  { key: 'invoicing', title: 'Invoicing', entity: 'Invoice', groupBy: 'status' },
  { key: 'receipts', title: 'Receipts', entity: 'Receipt', groupBy: 'status' },
  { key: 'quotes', title: 'Quotes', entity: 'Quote', groupBy: 'status' },
  { key: 'training', title: 'Training Centre', entity: 'TrainingCompletion', groupBy: 'status' },
  { key: 'meetings', title: 'Meeting Centre', entity: 'Meeting', groupBy: 'status' },
  { key: 'tasks', title: 'Tasks', entity: 'TodoTask', groupBy: 'status' },
  { key: 'feedback', title: 'Feedback & Surveys', entity: 'Feedback', groupBy: 'status', counts: ['SatisfactionSurvey'] },
  { key: 'quality', title: 'Quality & Improvement', entity: 'QualityItem', groupBy: 'status' },
  { key: 'analytics', title: 'Business Analytics', entity: 'KPI', groupBy: null },
  { key: 'documents', title: 'Document Vault', entity: 'CompanyDocument', groupBy: null, counts: ['BusinessDocument'] },
  { key: 'communications', title: 'Communication Centre', entity: 'CommunicationEntry', groupBy: 'status' },
  { key: 'projects', title: 'Projects', entity: 'BusinessProject', groupBy: 'status' },
  { key: 'crm', title: 'CRM & Leads', entity: 'Lead', groupBy: 'status' },
  { key: 'procurement', title: 'Procurement', entity: 'PurchaseOrder', groupBy: 'status', counts: ['Supplier'] },
  { key: 'emergency', title: 'Emergency Response', entity: 'EmergencyDrill', groupBy: 'outcome', counts: ['SafetyCheck', 'EmergencyDocument'] },
  { key: 'assets', title: 'Asset Management', entity: 'Asset', groupBy: 'status' },
  { key: 'incidents', title: 'Incident Analytics', entity: 'Incident', groupBy: 'status' },
  { key: 'volunteers', title: 'Volunteering & Placements', entity: 'Volunteer', groupBy: 'status', counts: ['VolunteerPlacement'] },
  { key: 'hr', title: 'HR Hub', entity: 'LeaveRequest', groupBy: 'status', counts: ['PerformanceReview'] },
];

// Business-local date (YYYY-MM-DD) for the snapshot key.
const localDate = (timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export default async function reqHandler(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const body: any = await req.json().catch(() => ({}));
    // Audit CRIT-02: one server-derived business context with the canonical active/approved check.
    const ctx = await resolveTenantContext(base44, body?.tenantId || null);
    if (!ctx.ok) return denied(ctx);
    const user = ctx.user;
    if (!ALLOWED_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const tenantId = ctx.tenantId;
    const q = (query: any = {}) => scopeQuery(query, tenantId);

    const jobs = [];
    SPECS.forEach((spec, index) => {
      if (spec.groupBy) {
        jobs.push({
          index,
          kind: 'agg',
          field: spec.groupBy,
          run: () => base44.asServiceRole.entities[spec.entity].aggregate({ query: q(), groupBy: spec.groupBy }),
        });
      } else {
        jobs.push({ index, kind: 'count', run: () => base44.asServiceRole.entities[spec.entity].count(q()) });
      }
      (spec.counts || []).forEach((entityName) => {
        jobs.push({ index, kind: 'count2', entity: entityName, run: () => base44.asServiceRole.entities[entityName].count(q()) });
      });
    });

    const acc = SPECS.map(() => ({ total: 0, breakdown: [], counts: {} }));
    const CHUNK = 6;
    for (let start = 0; start < jobs.length; start += CHUNK) {
      const slice = jobs.slice(start, start + CHUNK);
      const settled = await Promise.allSettled(slice.map((job) => job.run()));
      settled.forEach((result, idx) => {
        const job = slice[idx];
        const bucket = acc[job.index];
        if (result.status !== 'fulfilled') return;
        const value = result.value;
        if (job.kind === 'agg') {
          const rows = (value && value.rows) || [];
          bucket.breakdown = rows.map((row) => ({ label: String(row[job.field] ?? 'Unspecified'), count: row.count || 0 }));
          bucket.total = bucket.breakdown.reduce((sum, item) => sum + item.count, 0);
        } else if (job.kind === 'count') {
          bucket.total = typeof value === 'number' ? value : 0;
        } else {
          bucket.counts[job.entity] = typeof value === 'number' ? value : 0;
        }
      });
    }

    // Daily live status snapshot — one row per module per day (the exportable log)
    // Snapshot date in the business's own time zone; one row per business per module per day.
    const today = localDate('Australia/Brisbane');
    const capturedAt = new Date().toISOString();
    const snapshotRows = SPECS.map((spec, index) => stampTenant({
      module: spec.title,
      snapshot_date: today,
      total: acc[index].total,
      breakdown_json: JSON.stringify(acc[index].breakdown),
      captured_at: capturedAt,
    }, tenantId));
    let snapshotError = null;
    try {
      await base44.asServiceRole.entities.ModuleDailyStatus.upsert(snapshotRows, { key: ['tenant_id', 'module', 'snapshot_date'] });
    } catch (error) {
      snapshotError = error.message;
    }

    return Response.json({
      generated_at: capturedAt,
      tenant_id: tenantId,
      business_scoped: TENANT_ENFORCEMENT_ON,
      snapshot_error: snapshotError,
      modules: SPECS.map((spec, index) => ({
        key: spec.key,
        title: spec.title,
        total: acc[index].total,
        breakdown: acc[index].breakdown,
        counts: acc[index].counts,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}