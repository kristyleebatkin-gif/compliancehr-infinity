import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

// Spreadsheet column headers -> IntakeCase fields (mirrors the downloadable template)
const COLUMN_MAP = {
  'Full Name': 'applicant_name',
  'Preferred Name': 'preferred_name',
  'Date of Birth': 'date_of_birth',
  'Email': 'email',
  'Phone': 'phone',
  'Address': 'address',
  'NDIS Number': 'ndis_number',
  'NDIS Reference Number': 'ndis_reference_number',
  'Primary Contact / Nominee': 'primary_contact',
  'Communication and Accessibility Needs': 'communication_needs',
  'Requested Supports': 'requested_supports',
  'Reason for Referral': 'reason_for_referral',
  'Emergency Contact': 'emergency_contact',
  'Medical Diagnosis': 'medical_diagnosis',
  'Medications and Dosage': 'medications_dosage',
  'Plan Type': 'plan_type',
  'Plan Start Date': 'plan_start_date',
  'Plan End Date': 'plan_end_date',
  'Support Coordinator': 'support_coordinator',
  'Referral Date': 'referral_date',
  'Proposed Start Date': 'target_start_date',
  'Status': 'status',
  'Intake Owner': 'assigned_to',
  'Notes': 'notes',
};

const ALLOWED_ROLES = [
  'admin', 'Provider Administrator', 'Compliance Manager',
  'Administration', 'Team Leader', 'Support Worker', 'Intake Officer',
];
const STATUSES = ['Draft', 'Information Required', 'Ready for Review', 'Approved', 'Converted to Profile', 'Declined', 'Withdrawn'];
const PLAN_TYPES = ['Plan Managed', 'Self Managed', 'NDIA Managed'];
const MAX_ROWS = 200;

const normHeader = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const HEADER_FIELDS = {};
Object.entries(COLUMN_MAP).forEach(([label, field]) => {
  HEADER_FIELDS[normHeader(label)] = field;
  HEADER_FIELDS[normHeader(field)] = field;
});

function excelSerialToIso(value) {
  if (typeof value === 'number' && value >= 20000 && value <= 60000) {
    const ms = Math.round((value - 25569) * 86400000);
    return new Date(ms).toISOString().slice(0, 10);
  }
  return '';
}

function normalizeDate(value) {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}([T ]|$)/.test(raw)) return raw.slice(0, 10);
  return excelSerialToIso(value) || raw;
}

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role)) return Response.json({ error: 'Not permitted to import intake records' }, { status: 403 });

    const body = await req.json();
    const intakeType = body.intake_type === 'Employee' ? 'Employee' : 'Participant';
    const fileUrl = String(body.file_url || '');
    if (!fileUrl) return Response.json({ error: 'No spreadsheet provided' }, { status: 400 });

    const jsonSchema = {
      type: 'object',
      properties: Object.fromEntries(Object.keys(COLUMN_MAP).map((label) => [label, { type: 'string' }])),
    };
    const extract = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: jsonSchema,
    });
    if (extract.status !== 'success' || !Array.isArray(extract.output)) {
      return Response.json({ error: extract.details || 'Could not read the spreadsheet' }, { status: 400 });
    }

    const rawRows = extract.output.slice(0, MAX_ROWS);
    const fieldPages = await Promise.all([
      base44.entities.IntakeCase.filter({ intake_type: intakeType }, { limit: 500, fields: ['applicant_name', 'date_of_birth', 'email'] }),
      base44.entities.IntakeCase.filter({ intake_type: intakeType, case_number: { $regex: `^${intakeType === 'Participant' ? 'PIC' : 'EIC'}-` } }, { limit: 500, fields: ['case_number'] }),
    ]);
    const existingPeople = fieldPages[0].items;
    const existingNumbers = fieldPages[1].items;
    const prefix = intakeType === 'Participant' ? 'PIC' : 'EIC';
    const maxExisting = existingNumbers.reduce((acc, record) => {
      const match = new RegExp(`^${prefix}-(\\d+)$`).exec(String(record.case_number || ''));
      return match ? Math.max(acc, parseInt(match[1], 10)) : acc;
    }, 0);

    const normalizeName = (value) => String(value || '').trim().toLowerCase();
    const skipped = [];
    const records = [];
    let nextNumber = maxExisting + 1;

    for (let i = 0; i < rawRows.length; i += 1) {
      const raw = rawRows[i] || {};
      const mapped = {};
      Object.entries(raw).forEach(([header, value]) => {
        const field = HEADER_FIELDS[normHeader(header)];
        if (field) mapped[field] = String(value || '').trim();
      });

      const rowNumber = i + 2;
      if (!mapped.applicant_name && !mapped.email) continue; // blank row
      if (!mapped.applicant_name) {
        skipped.push({ row: rowNumber, reason: 'Missing Full Name' });
        continue;
      }

      const email = normalizeName(mapped.email);
      const dob = normalizeDate(mapped.date_of_birth);
      const duplicate = existingPeople.some((record) => (
        (email && String(record.email || '').toLowerCase() === email)
        || (normalizeName(record.applicant_name) === normalizeName(mapped.applicant_name)
          && dob && record.date_of_birth === dob)
      ));
      if (duplicate) {
        skipped.push({ row: rowNumber, reason: `${mapped.applicant_name} already has an intake case` });
        continue;
      }

      const status = STATUSES.includes(mapped.status) ? mapped.status : 'Draft';
      const planType = PLAN_TYPES.includes(mapped.plan_type) ? mapped.plan_type : '';
      const record = { intake_type: intakeType, status, case_number: `${prefix}-${String(nextNumber).padStart(4, '0')}`, applicant_name: mapped.applicant_name };
      nextNumber += 1;
      Object.entries(COLUMN_MAP).forEach(([label, field]) => {
        if (field === 'status' || field === 'applicant_name') return;
        const value = field.endsWith('_date') ? normalizeDate(mapped[field]) : mapped[field];
        if (value) record[field] = value;
      });
      if (planType) record.plan_type = planType;
      record.email = mapped.email || '';
      records.push(record);
    }

    if (records.length > 0) {
      await base44.entities.IntakeCase.bulkCreate(records);
    }
    return Response.json({ created: records.length, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});