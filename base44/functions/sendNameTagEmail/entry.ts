import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { staff_id, file_url } = await req.json();
    if (!staff_id || !file_url) return Response.json({ error: 'staff_id and file_url are required' }, { status: 400 });

    const staff = await base44.entities.StaffProfile.get(staff_id);
    if (!staff) return Response.json({ error: 'Staff member not found' }, { status: 404 });
    if (!staff.email) return Response.json({ error: 'This staff member has no email address on their profile.' }, { status: 400 });

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: staff.email,
        subject: `Your name tag - ${staff.full_name}`,
        html: `<p>Hi ${staff.full_name},</p><p>Your personalised name tag is attached. It shows your employee ID number (${staff.employee_number || 'pending'}) and carries the company branding.</p><p>If any details on the tag are wrong, please contact your supervisor so we can update your profile.</p>`,
        attachments: [{ filename: `Name Tag - ${staff.full_name}.pdf`, file_url }],
      });
    } catch (error) {
      return Response.json({ success: false, error: `Email could not be sent to ${staff.email}: ${error.message}` }, { status: 200 });
    }

    return Response.json({ success: true, sent_to: staff.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}