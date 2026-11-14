import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_URL = 'https://polite-safe-hire-flow.base44.app';
const MANAGER_EMAIL = 'kristyleebatkin@live.com.au';
const WARN_DAYS = 30;

function daysBetween(fromStr, toStr) {
  return Math.round((new Date(toStr + 'T00:00:00Z') - new Date(fromStr + 'T00:00:00Z')) / 86400000);
}

// Collect items that expire within the horizon (or are already expired).
function collectExpiring(items, today, horizon, labelFn) {
  const out = [];
  for (const item of items) {
    const expiry = item.expiry_date || item.end_date || item.police_check_expiry || item.ndis_screening_expiry || item.wwcc_expiry || '';
    if (!expiry) continue;
    const days = daysBetween(today, expiry);
    if (days > WARN_DAYS) continue;
    const state = days >= 0
      ? `expires in ${days} day${days === 1 ? '' : 's'}`
      : `EXPIRED ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
    out.push({ item, expiry, state, label: labelFn(item) });
  }
  return out;
}

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
    const horizon = new Date(Date.now() + WARN_DAYS * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const failures = [];

    // --- Employment contracts ending soon ---
    const contracts = (await service.entities.EmployeeEmploymentContract.filter(
      { contract_status: { $in: ['Draft', 'Sent', 'Signed', 'Active'] }, end_date: { $ne: null, $lte: horizon } },
      { limit: 100 },
    )).items || [];
    const expiringContracts = collectExpiring(
      contracts, today, horizon,
      (c) => `Employment contract: ${c.employee_name || 'Staff'} (${c.position_title || 'position'})`,
    );

    // --- Volunteer documents / training / placement clearance checks ---
    const volDocs = (await service.entities.VolunteerDocument.filter(
      { expiry_date: { $ne: null, $lte: horizon } }, { limit: 200 },
    )).items || [];
    const expiringVolDocs = collectExpiring(
      volDocs, today, horizon,
      (v) => `Volunteer document: ${v.document_type || 'Document'} - ${v.volunteer_name || ''}`,
    );

    const volTraining = (await service.entities.VolunteerTraining.filter(
      { expiry_date: { $ne: null, $lte: horizon } }, { limit: 200 },
    )).items || [];
    const expiringVolTraining = collectExpiring(
      volTraining, today, horizon,
      (v) => `Volunteer training: ${v.module_title || 'Module'} - ${v.volunteer_name || ''}`,
    );

    const placements = (await service.entities.VolunteerPlacement.filter(
      { status: { $in: ['Applicant', 'Onboarding', 'Active', 'On Hold'] } },
      { limit: 200 },
    )).items || [];
    const expiringPlacements = placements
      .flatMap((p) => {
        const rows = [];
        for (const [field, label] of [
          ['police_check_expiry', 'Police check'],
          ['ndis_screening_expiry', 'NDIS worker screening'],
          ['wwcc_expiry', 'Working with children check'],
        ]) {
          const expiry = p[field];
          if (!expiry) continue;
          const days = daysBetween(today, expiry);
          if (days > WARN_DAYS) continue;
          const state = days >= 0
            ? `expires in ${days} day${days === 1 ? '' : 's'}`
            : `EXPIRED ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
          rows.push({ label: `${label} - ${p.full_name || 'Placement'} (${p.engagement_type || 'Volunteer'})`, expiry, state });
        }
        return rows;
      });

    const allItems = [...expiringContracts, ...expiringVolDocs, ...expiringVolTraining, ...expiringPlacements];
    if (!allItems.length) return Response.json({ ok: true, checked: 0, due_items: 0, emailed: false });

    const lines = allItems.map((r) => `- ${r.label}: ${r.expiry} (${r.state})`).join('\n');
    const subject = `[Expiry alert] ${allItems.length} contract or volunteer item${allItems.length === 1 ? '' : 's'} need attention`;
    const emailBody = `Expiry alert for contracts and volunteer checks\n\n${lines}\n\nReview contracts in the HR Hub: ${APP_URL}/hr\nReview volunteers: ${APP_URL}/volunteers\n\nThis is an automated reminder from ComplianceHR Portal.`;

    // One digest per day.
    const alreadyLogged = await service.entities.CommunicationEntry.filter(
      { subject, entry_date: today }, { limit: 1 },
    );
    if (!(alreadyLogged.items || []).length) {
      if (EMAIL_RE.test(MANAGER_EMAIL)) {
        try {
          await service.integrations.Core.SendEmail({ to: MANAGER_EMAIL, from_name: 'ComplianceHR Portal', subject, body: emailBody });
        } catch (error) {
          failures.push(String(error?.message || error));
        }
      }
      await service.entities.CommunicationEntry.create({
        entry_kind: 'Message',
        person_type: 'Employee',
        attention: 'Manager',
        subject,
        body: emailBody,
        entry_date: today,
        entry_time: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5),
        recipients_json: JSON.stringify([{ name: 'Manager', email: MANAGER_EMAIL }]),
        sender_name: 'Automated Expiry Reminder',
        sender_email: 'system@compliancehr-portal',
        module: 'HR & Volunteers',
      });
    }

    return Response.json({ ok: true, checked: contracts.length + volDocs.length + volTraining.length + placements.length, due_items: allItems.length, emailed: true, failures });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});