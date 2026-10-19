import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';

const pageItems = (page) => page?.items || page || [];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);

    const [staffPage, participantPage] = await Promise.all([
      service.entities.StaffProfile.filter({}, { limit: 1000 }),
      service.entities.ParticipantProfile.filter({}, { limit: 1000 }),
    ]);
    const staffList = pageItems(staffPage);
    const participantList = pageItems(participantPage);

    const daysSince = (d) => (d ? Math.floor((now - new Date(d)) / 86400000) : Infinity);
    let emailed = 0;
    let failed = 0;
    const failures = [];

    const remind = async (profile, kind) => {
      if (!profile.email) return;
      const since = daysSince(profile.last_details_check_date);
      if (since < 90) return;
      const first_name = String(profile.full_name || '').split(' ')[0];
      try {
        await service.integrations.Core.SendEmail({
          to: profile.email,
          template_name: 'DetailsCheck',
          variables: { first_name, kind },
        });
        emailed++;
      } catch (error) {
        failed++;
        failures.push({ name: profile.full_name, email: profile.email, reason: error.message });
      }
      const entry = `${today} ${time} | Details check requested via email to ${profile.email}${failures.some((f) => f.name === profile.full_name) ? ' (delivery failed)' : ''}`;
      await service.entities[kind === 'Staff' ? 'StaffProfile' : 'ParticipantProfile'].update(profile.id, {
        last_details_check_date: today,
        change_log: [entry, profile.change_log].filter(Boolean).join('\n'),
      });
    };

    for (const profile of staffList) await remind(profile, 'Staff');
    for (const profile of participantList) await remind(profile, 'Participant');

    return Response.json({ success: true, emailed, failed, failures, checked: staffList.length + participantList.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}