import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const ADMIN_ROLES = new Set(['admin', 'Provider Administrator']);

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const actor = await base44.auth.me();
    if (!actor) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ADMIN_ROLES.has(actor.role)) return Response.json({ error: 'Provider Administrator access required' }, { status: 403 });

    const body = await req.json();
    const companyName = String(body.company_name || '').trim().slice(0, 200);
    const logoUrl = String(body.logo_url || '').trim().slice(0, 3000);
    const slogan = String(body.company_slogan || '').trim().slice(0, 160);
    if (!companyName) return Response.json({ error: 'Company name is required' }, { status: 400 });
    if (!slogan) return Response.json({ error: 'Company slogan is required' }, { status: 400 });

    const existing = body.provider_id
      ? await base44.asServiceRole.entities.Provider.get(String(body.provider_id))
      : null;
    const provider = existing
      ? await base44.asServiceRole.entities.Provider.update(existing.id, {
        provider_name: companyName,
        logo_url: logoUrl,
        document_slogan: slogan,
        document_branding_active: true,
      })
      : await base44.asServiceRole.entities.Provider.create({
        provider_name: companyName,
        logo_url: logoUrl,
        document_slogan: slogan,
        document_branding_active: true,
      });

    const providersPage = await base44.asServiceRole.entities.Provider.filter({}, { sort: '-created_date', limit: 500 });
    for (const candidate of (providersPage.items || [])) {
      if (candidate.id !== provider.id && candidate.document_branding_active) {
        await base44.asServiceRole.entities.Provider.update(candidate.id, { document_branding_active: false });
      }
    }

    await base44.asServiceRole.entities.AuditLog.create({
      action: 'Update Company Branding',
      entity_type: 'Provider',
      record_id: provider.id,
      record_title: companyName,
      performed_by: actor.full_name || actor.email || 'Provider Administrator',
      performed_by_user_id: actor.id,
      performed_by_email: actor.email || '',
      performed_by_role: actor.role,
      details: `Selected document branding for ${companyName} and updated the name, logo and slogan used across downloadable forms.`,
      timestamp: new Date().toISOString(),
    });
    return Response.json({
      success: true,
      provider_id: provider.id,
      company_slogan: slogan,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Branding update failed' }, { status: 500 });
  }
}