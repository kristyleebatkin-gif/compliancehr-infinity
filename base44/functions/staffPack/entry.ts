import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

const APP_URL = 'https://polite-safe-hire-flow.base44.app';

const ONBOARDING_PACK = [
  { title: 'Send employment contract for signature', module: 'HR', how_to_complete: 'Generate the contract from the HR paperwork templates and email it for signature.', offset: 0 },
  { title: 'Collect national police check', module: 'HR', how_to_complete: 'Issue the consent form (Forms Library) and file the certificate when returned.', offset: 3 },
  { title: 'Apply for NDIS Worker Screening', module: 'HR', how_to_complete: 'Lodge the NDIS Worker Screening application and record the clearance in the staff file.', offset: 5 },
  { title: 'Verify Blue Card / WWCC if applicable', module: 'HR', how_to_complete: 'Check the card via the online portal and record the number and expiry.', offset: 5 },
  { title: 'Book First Aid and CPR training', module: 'Training', how_to_complete: 'Book a ProTraining Services session within 30 days of start; log the certificate on completion.', offset: 7 },
  { title: 'Complete staff induction', module: 'HR', how_to_complete: 'Deliver the induction pack, walk through policies, and record the induction date on the staff profile.', offset: 2 },
  { title: 'Create staff badge and profile photo', module: 'Company Safe', how_to_complete: 'Use the Staff Badge Creator and upload the photo to the staff profile.', offset: 2 },
  { title: 'Set up IT accounts and email', module: 'IT', how_to_complete: 'Request accounts from TechAssist; grant app role via the Users & Permissions hub.', offset: 1 },
  { title: 'Add staff to rostering team lists', module: 'Rostering', how_to_complete: 'Add availability, join roster teams, and schedule first buddy shift.', offset: 7 },
  { title: 'Schedule 6-month probation review', module: 'HR', how_to_complete: 'Create a scheduled Probation performance review with 6-month due date.', offset: 168 },
];

const OFFBOARDING_PACK = [
  { title: 'Confirm last day and final shift roster', module: 'Rostering', how_to_complete: 'Remove upcoming shifts and confirm final worked shifts with the team leader.', offset: 0 },
  { title: 'Conduct exit interview', module: 'HR', how_to_complete: 'Complete the exit interview and record the exit reason on the staff profile.', offset: 0 },
  { title: 'Collect company property', module: 'Assets', how_to_complete: 'Retrieve keys, badge, devices and record asset returns in the asset register.', offset: 0 },
  { title: 'Revoke app access and archive account', module: 'IT', how_to_complete: 'Set the app role to archived, revoke IT accounts, and archive the user account.', offset: 1 },
  { title: 'Final pay and entitlements calculation', module: 'Finance', how_to_complete: 'Calculate final pay, leave balances and superannuation; confirm with Finance.', offset: 3 },
  { title: 'File exit documents in staff file', module: 'HR', how_to_complete: 'Upload the exit form, signed exit checklist and any settlement documents.', offset: 3 },
  { title: 'Handover of caseload and documents', module: 'HR', how_to_complete: 'Transfer active participant supports, shift notes and pending tasks to a named colleague.', offset: 2 },
];

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const kind = body.kind === 'offboarding' ? 'offboarding' : 'onboarding';
    const profileId = String(body.entity_id || '').trim();

    let profile = null;
    if (profileId) {
      profile = await service.entities.StaffProfile.get(profileId).catch(() => null);
    }
    const staffName = String((profile && profile.full_name) || body.staff_name || 'New staff member').trim();

    // Skip if this pack was already generated for the same staff member.
    const packTag = `${kind === 'onboarding' ? 'Onboarding' : 'Offboarding'} pack - ${staffName}`;
    const existing = await service.entities.TodoTask.filter(
      { title: { $regex: `^${packTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
      { limit: 1 },
    );
    if ((existing.items || []).length) {
      return Response.json({ ok: true, skipped: true, reason: 'pack already exists' });
    }

    const pack = kind === 'onboarding' ? ONBOARDING_PACK : OFFBOARDING_PACK;
    const startDate = String((profile && profile.start_date) || new Date().toISOString().slice(0, 10));
    const records = pack.map((item) => {
      const base = new Date(`${startDate}T00:00:00Z`);
      base.setUTCDate(base.getUTCDate() + item.offset);
      const dueDate = base.toISOString().slice(0, 10);
      return {
        title: `${packTag} - ${item.title}`,
        module: item.module,
        task_date: dueDate,
        due_date: dueDate,
        responsible: profile ? [profile.full_name] : [],
        how_to_complete: item.how_to_complete,
        important_info: `Auto-generated ${kind} step for ${staffName}. Open the staff file: ${APP_URL}/staff`,
        status: 'Pending',
      };
    });

    const created = await service.entities.TodoTask.bulkCreate(records);

    await service.entities.CommunicationEntry.create({
      entry_kind: 'Message',
      person_type: 'Employee',
      attention: 'HR / Manager',
      subject: `[Automation] ${kind === 'onboarding' ? 'Onboarding' : 'Offboarding'} task pack created for ${staffName}`,
      body: `${created.length} automated ${kind} tasks were generated for ${staffName} in the Communication Centre task board.\n\nView the task board: ${APP_URL}/communications`,
      entry_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' }),
      entry_time: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5),
      sender_name: 'Automated HR Pack',
      sender_email: 'system@compliancehr-portal',
      module: 'HR',
    });

    return Response.json({ ok: true, kind, staff: staffName, tasks_created: created.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});