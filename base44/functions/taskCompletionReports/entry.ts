import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { jsPDF } from 'npm:jspdf@4.2.1';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    const fields = ['task_id', 'title', 'module', 'status', 'task_date', 'task_time', 'due_date', 'responsible', 'assigned_to', 'completed_by', 'completed_date', 'time_taken_minutes', 'signed_off_by', 'signed_off_date', 'signature', 'shared_by', 'how_to_complete', 'resources_needed', 'important_info', 'notes'];
    if (body.mode === 'record') {
      if (typeof body.task_id !== 'string' || !/^[a-f0-9]{24}$/i.test(body.task_id)) return Response.json({ error: 'Valid task_id required' }, { status: 400 });
      const existing = await base44.entities.TaskCompletionRecord.filter({ task_id: body.task_id }, { limit: 1 });
      if (existing.items.length) return Response.json({ completion_id: existing.items[0].id, existing: true });
      const task = await base44.entities.TodoTask.get(body.task_id);
      if (!task || !['Completed', 'Finalised', 'Pending Approval'].includes(task.status)) return Response.json({ skipped: true });
      const snapshot = Object.fromEntries(fields.map((field) => [field, String(field === 'task_id' ? task.id : Array.isArray(task[field]) ? task[field].join('; ') : task[field] ?? '').slice(0, 1200)]));
      if (body.dry_run === true) return Response.json({ dry_run: true, task_id: task.id, status: snapshot.status, fields: fields.length });
      // One immutable completion per task: approval and reopening never count it twice.
      const duplicate = await base44.entities.TaskCompletionRecord.filter({ task_id: task.id }, { limit: 1 });
      if (duplicate.items.length) return Response.json({ completion_id: duplicate.items[0].id, existing: true });
      const record = await base44.entities.TaskCompletionRecord.create({ task_id: task.id, completed_at: new Date().toISOString(), snapshot });
      return Response.json({ completion_id: record.id });
    }
    if (body.mode !== 'report') return Response.json({ error: 'Use record or report mode' }, { status: 400 });
    if (!body.completion_id) return Response.json({ skipped: true });
    if (typeof body.completion_id !== 'string' || !/^[a-f0-9]{24}$/i.test(body.completion_id)) return Response.json({ error: 'Valid completion_id required' }, { status: 400 });
    const anchor = await base44.entities.TaskCompletionRecord.get(body.completion_id);
    if (!anchor) return Response.json({ error: 'Completion not found' }, { status: 404 });
    const query = { id: { $lte: anchor.id } };
    const count = await base44.entities.TaskCompletionRecord.count(query);
    if (!count || count % 30 !== 0) return Response.json({ skipped: true, completed_count: count, until_next_report: 30 - count % 30 });
    const batchKey = `tasks-through-${anchor.id}`;
    const existing = await base44.entities.TaskCompletionReport.filter({ batch_key: batchKey }, { limit: 1 });
    if (existing.items.length) return Response.json({ existing: true, report_id: existing.items[0].id });
    const page = await base44.entities.TaskCompletionRecord.filter(query, { sort: '-id', limit: 30 });
    if (page.items.length !== 30) throw new Error('A report requires exactly 30 completed tasks');
    const records = [...page.items].reverse();
    const cell = (value) => {
      let text = String(value ?? '');
      if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const csv = '\uFEFF' + [fields.map(cell).join(','), ...records.map((record) => fields.map((field) => cell(record.snapshot[field])).join(','))].join('\r\n');
    const title = `Completed task report ${count / 30} (${count - 29}-${count})`;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 80;
    const heading = () => {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.text(title, 40, 40);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
      pdf.text('30 completed tasks | Recorded at completion, before manager approval where applicable', 40, 57); y = 80;
    };
    heading();
    for (let index = 0; index < records.length; index++) {
      const task = records[index].snapshot;
      const text = `${count - 29 + index}. ${task.title}\n` + fields.filter((field) => field !== 'title' && task[field]).map((field) => `${field.replace(/_/g, ' ')}: ${task[field]}`).join('\n');
      for (const line of pdf.splitTextToSize(text, 510)) {
        if (y > 785) { pdf.addPage(); heading(); }
        pdf.text(line, 40, y); y += 12;
      }
      y += 12;
    }
    if (body.dry_run === true) return Response.json({ dry_run: true, title, task_count: records.length, pdf_bytes: pdf.output('arraybuffer').byteLength, csv_bytes: new TextEncoder().encode(csv).length });
    const filename = `Completed-Tasks-${count / 30}`;
    const [csvFile, pdfFile] = await Promise.all([
      base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: new File([csv], `${filename}.csv`, { type: 'text/csv' }) }),
      base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: new File([pdf.output('arraybuffer')], `${filename}.pdf`, { type: 'application/pdf' }) }),
    ]);
    const duplicate = await base44.entities.TaskCompletionReport.filter({ batch_key: batchKey }, { limit: 1 });
    if (duplicate.items.length) return Response.json({ existing: true, report_id: duplicate.items[0].id });
    const report = await base44.entities.TaskCompletionReport.create({ title, batch_key: batchKey, task_count: 30, first_completed_at: records[0].completed_at, last_completed_at: records[29].completed_at, csv_file_uri: csvFile.file_uri, pdf_file_uri: pdfFile.file_uri });
    return Response.json({ success: true, report_id: report.id, task_count: 30 });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to save completed task report' }, { status: 500 });
  }
}