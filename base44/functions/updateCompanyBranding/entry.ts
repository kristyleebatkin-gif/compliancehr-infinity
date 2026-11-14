// Saves a business's own document branding (audit CRIT-04).
// - The business comes from the signed-in account on the server; a provider_id from the browser
//   is only accepted if that record belongs to the same business.
// - Only that business's records are read, changed or deactivated (no "latest record anywhere").
// - Slogan is optional. The logo must be a file stored in this app.
// - Platform identity (ComplianceHR Infinity) is not stored here; it lives in code.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveTenantContext, stampTenant, denied, TENANT_ENFORCEMENT_ON } from '../../shared/tenantContext.ts';

const ADMIN_ROLES = new Set(['admin', 'Provider Administrator']);
const APP_ID = '6ac9f91f0d82b1f80ec6a25f';
const ALLOWED_LOGO = [
  new RegExp(`^https://base44\\.app/api/apps/${APP_ID}/files/`),
  new RegExp(`^https://media\\.base44\\.com/images/public/${APP_ID}/`),
];

// Before enforcement (release 1) existing records have no business tag yet and all belong to the
// one business in the app, so an untagged record counts as the caller's. After release 2 it must match.
const belongsTo = (record: any, tenantId: string) =>
  record && (record.tenant_id === tenantId || (!TENANT_ENFORCEMENT_ON && !record.tenant_id));

async function all(dao: any) {
  const out: any[] = [];
  let cursor: string | null = null;
  do {
    const page: any = await dao.filter({}, { sort: '-created_date', limit: 200, ...(cursor ? { cursor } : {}) });
    out.push(...(Array.isArray(page) ? page : page?.items || []));
    cursor = !Array.isArray(page) && page?.has_more ? page.next_cursor : null;
  } while (cursor);
  return out;
}

// Takes the Base44 client as a parameter so tests can run it against an in-memory fake.
export async function handleBranding(base44: any, req: Request) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const ctx = await resolveTenantContext(base44, body?.tenant_id || null);
    if (!ctx.ok) return denied(ctx);
    const actor = ctx.user;
    if (!ADMIN_ROLES.has(actor.role)) return Response.json({ error: 'Provider Administrator access required' }, { status: 403 });
    const tenantId = ctx.tenantId;
    const svc = base44.asServiceRole.entities;

    const companyName = String(body.company_name || '').trim().slice(0, 200);
    const logoUrl = String(body.logo_url || '').trim().slice(0, 3000);
    const slogan = String(body.company_slogan || '').trim().slice(0, 160);
    if (!companyName) return Response.json({ error: 'Business name is required' }, { status: 400 });
    if (logoUrl && !ALLOWED_LOGO.some((re) => re.test(logoUrl))) {
      return Response.json({ error: 'Upload the logo through the app; outside image links are not accepted.' }, { status: 400 });
    }

    const providers = (await all(svc.Provider)).filter((p) => belongsTo(p, tenantId));
    let provider = null;
    if (body.provider_id) {
      provider = providers.find((p) => p.id === String(body.provider_id)) || null;
      if (!provider) return Response.json({ error: 'That branding record does not belong to your business.' }, { status: 403 });
    } else {
      provider = providers.find((p) => p.document_branding_active) || providers[0] || null;
    }
    const before = provider ? { name: provider.provider_name, logo: provider.logo_url, slogan: provider.document_slogan } : null;
    const fields = stampTenant({ provider_name: companyName, logo_url: logoUrl, document_slogan: slogan, document_branding_active: true }, tenantId);
    if (provider) {
      await svc.Provider.update(provider.id, fields);
      provider = { ...provider, ...fields };
    } else {
      provider = await svc.Provider.create(fields);
    }

    // Only this business's other branding records are switched off.
    for (const other of providers) {
      if (other.id !== provider.id && other.document_branding_active) {
        await svc.Provider.update(other.id, { document_branding_active: false });
      }
    }

    const business = (await all(svc.BusinessDetails)).find((b) => belongsTo(b, tenantId)) || null;
    if (business) await svc.BusinessDetails.update(business.id, stampTenant({ business_name: companyName }, tenantId));
    else await svc.BusinessDetails.create(stampTenant({ business_name: companyName }, tenantId));

    await svc.AuditLog.create(stampTenant({
      organisation_id: tenantId,
      action: 'Update Company Branding',
      entity_type: 'Provider',
      record_id: provider.id,
      record_title: companyName,
      performed_by: actor.full_name || actor.email || 'Provider Administrator',
      performed_by_user_id: actor.id,
      performed_by_email: actor.email || '',
      performed_by_role: actor.role,
      details: JSON.stringify({ before, after: { name: companyName, logo: logoUrl, slogan } }).slice(0, 3000),
      timestamp: new Date().toISOString(),
    }, tenantId));

    return Response.json({ success: true, provider_id: provider.id, company_slogan: slogan, tenant_id: tenantId });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Branding update failed' }, { status: 500 });
  }
}

export default function reqHandler(req: Request) {
  return handleBranding(createClientFromRequest(req), req);
}
