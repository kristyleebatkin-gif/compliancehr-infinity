import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id || !user.email) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    if (['Pending Approval', 'Archived'].includes(user.role) || ['Pending Approval', 'Rejected', 'Archived'].includes(user.account_status)) {
      return Response.json({ error: 'Your account is not active.' }, { status: 403 });
    }
    // Only the authenticated account's verified email is used. No caller-selected IDs or names.
    const [staff, participants] = await Promise.all([
      user.role === 'Participant' ? Promise.resolve({ items: [] }) : base44.asServiceRole.entities.StaffProfile.filter({ email: user.email }, { limit: 2, fields: ['id'] }),
      base44.asServiceRole.entities.ParticipantProfile.filter({ email: user.email }, { limit: 2, fields: ['id'] }),
    ]);
    if (staff.items.length > 1 || participants.items.length > 1) {
      return Response.json({ error: 'More than one profile is linked to your email. Ask your administrator to correct the duplicate profiles.' }, { status: 409 });
    }
    const staffId = staff.items[0]?.id || '__unlinked__';
    const participantId = participants.items[0]?.id || '__unlinked__';
    const links = {
      personal_staff_profile_id: staffId,
      personal_participant_profile_id: participantId,
      personal_staff_library: staffId === '__unlinked__' ? '__unlinked__' : `staff-${staffId}`,
      personal_participant_library: participantId === '__unlinked__' ? '__unlinked__' : `participant-${participantId}`,
      personal_staff_checklist: staffId === '__unlinked__' ? '__unlinked__' : `staff-file-checklist-${staffId}`,
    };
    if (Object.entries(links).some(([key, value]) => user[key] !== value)) {
      // These fields are write-locked against auth.updateMe; only this verified lookup assigns them.
      await base44.asServiceRole.entities.User.update(user.id, links);
    }
    return Response.json({ staffId: staffId === '__unlinked__' ? null : staffId, participantId: participantId === '__unlinked__' ? null : participantId });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to link your personal profile.' }, { status: 500 });
  }
}