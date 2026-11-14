import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { jsPDF } from 'npm:jspdf@4.2.1';
import { BUSINESS_TIME_ZONE } from '../../shared/businessTime.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Shared by the workflow and the management-only Generate latest report control.
    // These are the AuditLog management roles; all entity reads remain caller-scoped.
    if (!['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'].includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    let actionId = body.action_id;
    if (body.latest === true) {
      const total = await base44.entities.AuditLog.count({});
      if (total < 30) return Response.json({ skipped: true, until_next_report: 30 - total });
      const latest = await base44.entities.AuditLog.list({ sort: '-id', limit: 30 });
      actionId = latest.items[total % 30]?.id;
    }
    if (typeof actionId !== 'string' || !/^[a-f0-9]{24}$/i.test(actionId)) return Response.json({ error: 'A valid action_id is required' }, { status: 400 });
    const anchor = await base44.entities.AuditLog.get(actionId);
    if (!anchor) return Response.json({ error: 'Action not found' }, { status: 404 });
    // AuditLog is append-only. Its ordered record IDs define non-overlapping batches,
    // even when several workflows run while newer actions are arriving.
    const query = { id: { $lte: anchor.id } };
    const count = await base44.entities.AuditLog.count(query);
    if (!count || count % 30 !== 0) return Response.json({ skipped: true, action_count: count, until_next_report: 30 - (count % 30) });
    const batchKey = `actions-through-${anchor.id}`;
    const existing = await base44.entities.ActionReport.filter({ batch_key: batchKey }, { limit: 1 });
    if (existing.items.length) return Response.json({ existing: true, report_id: existing.items[0].id });
    const page = await base44.entities.AuditLog.filter(query, { sort: '-id', limit: 30 });
    if (page.items.length !== 30) throw new Error('The report requires exactly 30 actions');
    const actions = [...page.items].reverse();
    const fields = ['timestamp', 'action', 'entity_type', 'record_title', 'performed_by', 'performed_by_role', 'route', 'details'];
    const cell = (value) => {
      let text = String(value ?? '').slice(0, 1200);
      if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const csv = '\uFEFF' + [fields.map(cell).join(','), ...actions.map((action) => fields.map((field) => cell(action[field])).join(','))].join('\r\n');
    const title = `Action report ${Math.floor(count / 30)} (${count - 29}-${count})`;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 44;
    const heading = () => {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.text(title, 40, 40);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
      pdf.text('30 logged app actions | Times shown in Australia/Sydney', 40, 57); y = 80;
    };
    heading();
    for (let index = 0; index < actions.length; index++) {
      const action = actions[index];
      const when = new Date(action.timestamp || action.created_date).toLocaleString('en-AU', { timeZone: BUSINESS_TIME_ZONE });
      const text = `${count - 29 + index}. ${when} | ${action.action || ''}\n${action.entity_type || ''}: ${action.record_title || action.record_id || '-'}\nBy ${action.performed_by || '-'} (${action.performed_by_role || '-'}) | ${action.route || ''}\n${String(action.details || '').slice(0, 1200)}`;
      for (const line of pdf.splitTextToSize(text, 510)) {
        if (y > 785) { pdf.addPage(); heading(); }
        pdf.text(line, 40, y); y += 12;
      }
      y += 12;
    }
    if (body.dry_run === true) return Response.json({ dry_run: true, title, action_count: actions.length, through_count: count, pdf_bytes: pdf.output('arraybuffer').byteLength, csv_bytes: new TextEncoder().encode(csv).length });
    const filename = `Action-Report-${Math.floor(count / 30)}`;
    const [csvFile, pdfFile] = await Promise.all([
      base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: new File([csv], `${filename}.csv`, { type: 'text/csv' }) }),
      base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: new File([pdf.output('arraybuffer')], `${filename}.pdf`, { type: 'application/pdf' }) }),
    ]);
    // A retried workflow reuses the saved report rather than exporting it again.
    const duplicate = await base44.entities.ActionReport.filter({ batch_key: batchKey }, { limit: 1 });
    if (duplicate.items.length) return Response.json({ existing: true, report_id: duplicate.items[0].id });
    const report = await base44.entities.ActionReport.create({ title, batch_key: batchKey, action_count: 30, first_action_at: actions[0].timestamp || actions[0].created_date, last_action_at: actions[29].timestamp || actions[29].created_date, csv_file_uri: csvFile.file_uri, pdf_file_uri: pdfFile.file_uri });
    return Response.json({ success: true, report_id: report.id, action_count: 30 });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to generate action report' }, { status: 500 });
  }
}