import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Pulls payroll details (bank, super, TFN) from completed employee intake cases
// and fills them into the HR payroll register for each staff member.
// Never overwrites details that are already set - it only fills gaps.
const PAYROLL_ROLES = ['admin', 'Provider Administrator', 'Administration', 'Finance & Accounts Officer', 'Human Resources Manager'];

function parseBanking(text) {
  const out = { bsb: '', account_number: '', account_name: '' };
  const s = String(text || '');
  const bsbM = s.match(/\b(\d{3})[-\s]?(\d{3})\b/);
  if (bsbM) out.bsb = `${bsbM[1]}-${bsbM[2]}`;
  const rest = s.replace(/\b(\d{3})[-\s]?(\d{3})\b/, '');
  const acctM = rest.match(/\b(\d{6,10})\b/);
  if (acctM) out.account_number = acctM[1];
  const nameM = s.match(/(?:account name|acc name|name)[:\s]+([^,\n;]+)/i);
  if (nameM) out.account_name = nameM[1].trim().slice(0, 60);
  return out;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me || !PAYROLL_ROLES.includes(me.role)) {
      return Response.json({ error: 'Not authorised to import payroll details.' }, { status: 403 });
    }
    const service = base44.asServiceRole;

    const [intakePage, staffPage, users] = await Promise.all([
      service.entities.IntakeCase.filter({ intake_type: 'Employee' }, { limit: 500 }),
      service.entities.StaffProfile.list(),
      service.entities.User.list(),
    ]);

    const staffByEmail = new Map();
    const staffByName = new Map();
    for (const p of staffPage.items || []) {
      if (p.email) staffByEmail.set(String(p.email).trim().toLowerCase(), p);
      staffByName.set(String(p.full_name || '').trim().toLowerCase(), p);
    }
    const userByEmail = new Map();
    for (const u of users || []) userByEmail.set(String(u.email || '').trim().toLowerCase(), u);

    const existingPage = await service.entities.StaffPayrollDetail.filter({}, { limit: 500 });
    const existingByProfile = new Map((existingPage.items || []).map((d) => [d.staff_profile_id, d]));

    let created = 0, updated = 0;
    const extracted = [];

    for (const c of intakePage.items || []) {
      const key = String(c.email || '').trim().toLowerCase();
      const profile = staffByEmail.get(key) || staffByName.get(String(c.applicant_name || '').trim().toLowerCase());
      if (!profile) continue;

      const bank = parseBanking(c.banking_details);
      const superText = String(c.superannuation_details || '').trim();
      const memberM = superText.match(/\b(\d{6,10})\b/);
      const parsed = {
        bsb: bank.bsb,
        account_number: bank.account_number,
        account_name: bank.account_name,
        super_fund_name: superText.replace(memberM ? memberM[0] : '', '').replace(/[,;]+$/, '').trim(),
        super_member_number: memberM ? memberM[1] : '',
        tfn_number: String(c.tax_file_number || '').trim(),
        hourly_rate: Number(c.hourly_rate ?? profile.hourly_rate) || undefined,
        employment_type: c.employee_role || c.position || profile.position || '',
      };
      const filled = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined && v !== null && v !== ''));

      const existing = existingByProfile.get(profile.id);
      let record;
      if (existing) {
        // Fill gaps only - never overwrite values already held.
        const patch = {};
        for (const [k, v] of Object.entries(filled)) {
          if (existing[k] === undefined || existing[k] === null || existing[k] === '') patch[k] = v;
        }
        if (!Object.keys(patch).length) continue;
        record = await service.entities.StaffPayrollDetail.update(existing.id, patch);
        updated++;
      } else {
        const staffUser = userByEmail.get(key);
        record = await service.entities.StaffPayrollDetail.create({
          staff_profile_id: profile.id,
          employee_user_id: staffUser ? staffUser.id : '',
          employee_name: profile.full_name,
          employee_email: profile.email || '',
          employee_id: profile.employee_number || '',
          employment_type: parsed.employment_type || 'Casual',
          pay_cycle: 'Fortnightly',
          super_rate: 11.5,
          source_intake_case_id: c.id,
          extracted_from_intake: true,
          ...filled,
        });
        existingByProfile.set(profile.id, record);
        created++;
      }
      extracted.push({ employee: profile.full_name, bsb: record.bsb || '', super_fund: record.super_fund_name || '', tfn: record.tfn_number ? 'recorded' : 'missing' });
    }

    return Response.json({ created, updated, extracted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}