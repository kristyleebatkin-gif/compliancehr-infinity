import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { HR_ROLES, hasAnyRole } from '../../shared/systemAuth.ts';
import { buildStaffBadgePdfBytes, bytesToBase64 } from '../../shared/staffBadge.ts';

// Emails a staff member their name tag. The badge is generated here from the
// staff profile and the organisation's stored branding, so no caller-supplied
// file reference is ever accepted or emailed.
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasAnyRole(user, HR_ROLES)) return Response.json({ error: 'Management access required' }, { status: 403 });

    const { staff_id } = await req.json();
    if (!staff_id) return Response.json({ error: 'staff_id is required' }, { status: 400 });

    const staff = await base44.entities.StaffProfile.get(staff_id);
    if (!staff) return Response.json({ error: 'Staff member not found' }, { status: 404 });
    if (!staff.email) return Response.json({ error: 'This staff member has no email address on their profile.' }, { status: 400 });

    const [providerPage, businessPage] = await Promise.all([
      base44.asServiceRole.entities.Provider.filter({ document_branding_active: true }, { sort: '-created_date', limit: 1 }),
      base44.asServiceRole.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
    ]);
    const provider = (providerPage.items || [])[0] || null;
    const business = (businessPage.items || [])[0] || null;
    const companyName = String(provider?.provider_name || business?.business_name || 'ComplianceHR');
    const slogan = String(provider?.document_slogan || 'Complete Control. Greater Confidence. Brighter Success.');
    const logoUrl = String(provider?.logo_url || '');

    const pdfBytes = await buildStaffBadgePdfBytes({
      companyName,
      slogan,
      logoUrl,
      staffName: staff.full_name,
      position: staff.position,
      employeeNumber: staff.employee_number,
      colour: [124, 58, 237],
    });

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: staff.email,
        subject: `Your name tag - ${staff.full_name}`,
        html: `<p>Hi ${staff.full_name},</p><p>Your personalised name tag is attached. It shows your employee ID number (${staff.employee_number || 'pending'}) and carries the company branding.</p><p>If any details on the tag are wrong, please contact your supervisor so we can update your profile.</p>`,
        attachments: [{ filename: `Name Tag - ${staff.full_name}.pdf`, content: bytesToBase64(pdfBytes) }],
      });
    } catch (error) {
      return Response.json({ success: false, error: `Email could not be sent to ${staff.email}: ${error.message}` }, { status: 200 });
    }

    return Response.json({ success: true, sent_to: staff.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});