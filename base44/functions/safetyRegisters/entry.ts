import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import * as XLSX from 'npm:xlsx@0.18.5';

const ALLOWED_ROLES = new Set(['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader']);
const ADMIN_ROLES = new Set(['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader']);
const SHEETS = {
  Incidents: { entity: 'Incident', columns: ['record_id','title','incident_id','date_occurred','time_occurred','date_reported','reported_by','received_by','participant_id','participant_name','staff_id','staff_name','location','category','severity','status','description','immediate_actions','hazards_identified','risk_assessment','control_measures','requires_ndis_report','requires_police'] },
  Investigations: { entity: 'Investigation', columns: ['record_id','title','investigation_id','incident_id','investigator','received_by','start_date','time','target_completion','status','incident_summary','evidence_reviewed','persons_interviewed','root_cause','findings','hazards_identified','risk_assessment','control_measures','recommendations','corrective_actions'] },
  Risks: { entity: 'Risk', columns: ['record_id','title','risk_id','report_type','description','hazards_identified','risk_assessment','control_measures','category','likelihood','consequence','rating','status','owner','mitigation_plan','control_measure_category','elimination_actions','minimise_actions','isolate_actions','staff_training_controls','compliance_controls','identified_date','review_date'] },
  TakeFive: { entity: 'TakeFive', columns: ['record_id','assessment_id','task','worker_name','supervisor','location','assessment_date','assessment_time','hazards_identified','potential_harm','likelihood','consequence','risk_rating','control_measures','residual_risk','safe_to_proceed','status'] },
  SafetyDocuments: { entity: 'SafetyDocument', columns: ['record_id','document_type','title','file_url','uploaded_date','uploaded_by','linked_entity_type','linked_entity_id','status','notes'] },
};

const clean = (value) => value === null || value === undefined ? '' : String(value).trim();
const booleanValue = (value) => value === true || ['true','yes','1'].includes(clean(value).toLowerCase());
const pageItems = (page) => page?.items || page || [];

function toBase64(bytes) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}

async function appendDocumentIdentity(base44, workbook, title) {
  const providers = pageItems(await base44.asServiceRole.entities.Provider.filter({}, { sort: '-created_date', limit: 500 }));
  const provider = providers.find((item) => item.document_branding_active) || providers[0];
  const companyName = provider?.provider_name || 'ComplianceHR';
  const slogan = provider?.document_slogan || 'ComplianceHR | Governance. Assurance. Better Outcomes.';
  const logoUrl = provider?.logo_url || '';
  workbook.Props = { ...(workbook.Props || {}), Title: title, Subject: slogan, Author: companyName, Company: companyName };
  const identity = XLSX.utils.aoa_to_sheet([
    [companyName],
    [slogan],
    [],
    ['Document', title],
    ['Company logo', logoUrl || 'Not configured'],
    ['Generated', new Date().toISOString()],
  ]);
  identity['!cols'] = [{ wch: 22 }, { wch: 90 }];
  if (logoUrl) identity.B5 = { t: 's', v: 'Open company logo', l: { Target: logoUrl } };
  XLSX.utils.book_append_sheet(workbook, identity, 'Document Identity');
}

function registerType(entityType, record) {
  if (entityType === 'Incident') return 'Incident Register';
  if (entityType === 'Investigation') return 'Investigation Register';
  if (entityType === 'TakeFive') return 'Take Five Register';
  if (entityType === 'Risk') return record.report_type === 'Hazard' ? 'Hazard Register' : record.report_type === 'Near Miss' ? 'Near Miss Register' : 'Risk Register';
  const type = String(record.document_type || '');
  if (type === 'Incident Report') return 'Incident Register';
  if (type === 'Investigation Report') return 'Investigation Register';
  if (type === 'Near Miss Report') return 'Near Miss Register';
  if (type === 'Hazard Report' || type === 'Daily Vehicle Check') return 'Hazard Register';
  if (type === 'Take Five Assessment') return 'Take Five Register';
  return 'Risk Register';
}

function summary(entityType, record) {
  return {
    title: String(record.title || record.task || record.document_type || entityType),
    entryId: String(record.incident_id || record.investigation_id || record.risk_id || record.assessment_id || record.id || ''),
    description: String(record.description || record.findings || record.hazards_identified || record.notes || ''),
    status: String(record.status || record.rating || record.risk_rating || 'Recorded'),
    date: String(record.date_occurred || record.start_date || record.identified_date || record.assessment_date || record.uploaded_date || new Date().toISOString().slice(0, 10)),
    owner: String(record.reported_by || record.investigator || record.owner || record.worker_name || record.uploaded_by || ''),
  };
}

async function syncRegister(base44, entityType, record) {
  const data = summary(entityType, record);
  const payload = {
    register_type: registerType(entityType, record), entry_title: data.title, entry_id: data.entryId,
    description: data.description, linked_entity_type: entityType, linked_entity_id: record.id,
    status: data.status, recorded_date: data.date, owner: data.owner,
  };
  const existing = pageItems(await base44.asServiceRole.entities.Register.filter({ linked_entity_type: entityType, linked_entity_id: record.id }));
  if (existing[0]) await base44.asServiceRole.entities.Register.update(existing[0].id, payload);
  else await base44.asServiceRole.entities.Register.create(payload);
}

async function notifyAdministrators(base44, entityType, record) {
  const users = await base44.asServiceRole.entities.User.list();
  const administrators = users.filter((user) => ADMIN_ROLES.has(user.role));
  const data = summary(entityType, record);
  const message = `${entityType} imported: ${data.title}. Status: ${data.status}.`;
  const failures = [];
  for (const administrator of administrators) {
    await base44.asServiceRole.entities.Notification.create({
      type: entityType === 'Incident' ? 'Incident Escalation' : 'General',
      recipient: administrator.email || administrator.full_name || administrator.role,
      recipient_id: administrator.id,
      message,
      read: false,
      linked_entity_type: entityType,
      linked_entity_id: record.id,
    });
    if (administrator.email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: administrator.email,
          subject: `[ComplianceHR] Imported ${entityType}: ${data.title}`,
          body: `${message}\n\nOpen ComplianceHR to review the complete record.`,
          from_name: 'ComplianceHR',
        });
      } catch (error) {
        failures.push(`${administrator.email}: ${error instanceof Error ? error.message : 'email failed'}`);
      }
    }
  }
  return failures;
}

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED_ROLES.has(user.role)) return Response.json({ error: 'Administrator access required' }, { status: 403 });
    const body = await req.json();

    if (body.action === 'export' || body.action === 'template') {
      const workbook = XLSX.utils.book_new();
      let count = 0;
      for (const [sheetName, config] of Object.entries(SHEETS)) {
        const records = body.action === 'template'
          ? []
          : pageItems(await base44.asServiceRole.entities[config.entity].filter({}, { sort: '-created_date', limit: 5000 }));
        count += records.length;
        const rows = records.map((record) => Object.fromEntries(config.columns.map((column) => [column, column === 'record_id' ? record.id : record[column] ?? ''])));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.length ? rows : [{}], { header: config.columns }), sheetName);
      }
      await appendDocumentIdentity(
        base44,
        workbook,
        body.action === 'template' ? 'Safety Register Template' : 'Safety Registers',
      );
      const output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      return Response.json({
        success: true,
        filename: `${body.action === 'template' ? 'ComplianceHR_Safety_Register_Template' : 'ComplianceHR_Safety_Registers'}_${new Date().toISOString().slice(0, 10)}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data: toBase64(new Uint8Array(output)),
        count,
      });
    }

    // Only private app-uploaded files (resolved server-side via a signed URL)
    // are accepted; caller-supplied URLs are refused to prevent SSRF.
    if (body.action !== 'import' || !body.file_uri) {
      return Response.json({ error: 'Unsupported action or missing file' }, { status: 400 });
    }
    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: body.file_uri, expires_in: 600 });
    const fileRef = signed.signed_url;
    const response = await fetch(fileRef, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Spreadsheet download failed (${response.status}).`);
    const workbook = XLSX.read(await response.arrayBuffer(), { type: 'array' });
    let created = 0;
    let updated = 0;
    const errors = [];
    const emailFailures = [];

    for (const [sheetName, config] of Object.entries(SHEETS)) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const payload = Object.fromEntries(config.columns.filter((column) => column !== 'record_id').map((column) => {
          const isBoolean = ['requires_ndis_report','requires_police','safe_to_proceed'].includes(column);
          return [column, isBoolean ? booleanValue(row[column]) : clean(row[column])];
        }));
        const requiredValue = config.entity === 'TakeFive' ? payload.task : payload.title;
        if (!requiredValue) continue;
        try {
          const recordId = clean(row.record_id);
          let record;
          if (recordId) {
            await base44.asServiceRole.entities[config.entity].update(recordId, payload);
            record = { ...payload, id: recordId };
            updated += 1;
          } else {
            record = await base44.asServiceRole.entities[config.entity].create(payload);
            created += 1;
          }
          await syncRegister(base44, config.entity, record);
          if (!recordId) emailFailures.push(...await notifyAdministrators(base44, config.entity, record));
        } catch (error) {
          errors.push(`${sheetName} row ${index + 2}: ${error instanceof Error ? error.message : 'record could not be saved'}`);
        }
      }
    }
    return Response.json({ success: true, created, updated, errors, email_failures: emailFailures });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Safety register operation failed' }, { status: 500 });
  }
});