// NDIS price guide: import a Support Catalogue release, preview its impact, and apply it on approval.
//   action 'import'  { title, effective_from, source_url?, rows[] }  -> new release (status Imported) + items
//   action 'preview' { release_id }                                     -> price changes + shifts that would re-price
//   action 'apply'   { release_id, confirm: true }                      -> release Active, old one Superseded,
//                                                                          future un-invoiced shifts re-priced, audit logged
//   action 'list'                                                        -> releases, newest first
// Management roles only. Invoiced shifts and sent or claimed invoices are never changed.
import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { hasAnyRole, MANAGEMENT_ROLES } from '../../shared/roleMatrix.ts';
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { normaliseCatalogueRow, diffCatalogues, shiftsToReprice } from '../../shared/priceGuide.ts';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const items = (page: any) => page?.items || page || [];

async function all(entity: any, query: any, sort = 'created_date') {
  const out: any[] = [];
  let cursor: string | null = null;
  do {
    const page: any = await entity.filter(query, { sort, limit: 500, ...(cursor ? { cursor } : {}) });
    out.push(...items(page));
    cursor = page?.has_more ? page.next_cursor : null;
  } while (cursor);
  return out;
}

function dayBefore(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user) || !hasAnyRole(user, MANAGEMENT_ROLES)) {
      return Response.json({ error: 'Only management can import or approve the NDIS price guide.' }, { status: 403 });
    }
    const service = base44.asServiceRole;
    const Release = service.entities.NDISPriceGuideRelease;
    const Item = service.entities.NDISPriceGuideItem;
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'list');

    const activeRelease = async () => items(await Release.filter({ status: 'Active' }, { sort: '-effective_from', limit: 1 }))[0] || null;

    if (action === 'list') {
      const releases = items(await Release.filter({}, { sort: '-created_date', limit: 50 }));
      return Response.json({ releases });
    }

    if (action === 'import') {
      const effectiveFrom = String(body.effective_from || '');
      if (!ISO.test(effectiveFrom)) return Response.json({ error: 'Enter the date the new prices start (YYYY-MM-DD).' }, { status: 400 });
      const rows = Array.isArray(body.rows) ? body.rows : [];
      const parsed = rows.map((r: any) => normaliseCatalogueRow(r)).filter(Boolean) as any[];
      if (parsed.length < 10) {
        return Response.json({ error: `Only ${parsed.length} support items were recognised. Check this is the NDIS Support Catalogue with its normal column headings.` }, { status: 400 });
      }
      const release = await Release.create({
        title: String(body.title || `NDIS Support Catalogue from ${effectiveFrom}`).slice(0, 200),
        effective_from: effectiveFrom,
        source_url: body.source_url ? String(body.source_url).slice(0, 500) : undefined,
        status: 'Imported',
        item_count: parsed.length,
        imported_by: user.email,
        imported_at: new Date().toISOString(),
      });
      for (let i = 0; i < parsed.length; i += 250) {
        await Item.bulkCreate(parsed.slice(i, i + 250).map((p) => ({
          ...p,
          release_id: release.id,
          effective_from: p.effective_from || effectiveFrom,
          active: false,
        })));
      }
      await service.entities.AuditLog.create({
        action: 'NDIS Price Guide Imported',
        entity_type: 'NDISPriceGuideRelease',
        record_id: release.id,
        record_title: release.title,
        performed_by: user.full_name || user.email,
        performed_by_user_id: user.id,
        performed_by_email: user.email,
        performed_by_role: user.role,
        details: `${parsed.length} support items imported, effective ${effectiveFrom}. Not yet applied.`,
        timestamp: new Date().toISOString(),
      });
      return Response.json({ release, item_count: parsed.length });
    }

    if (action === 'preview' || action === 'apply') {
      const release = await Release.get(String(body.release_id || '')).catch(() => null);
      if (!release) return Response.json({ error: 'Price guide release not found.' }, { status: 404 });
      if (action === 'apply' && release.status !== 'Imported') {
        return Response.json({ error: `This release is ${release.status} and cannot be applied again.` }, { status: 409 });
      }
      const current = await activeRelease();
      const nextItems = await all(Item, { release_id: release.id });
      const currentItems = current ? await all(Item, { release_id: current.id }) : [];
      const changes = diffCatalogues(currentItems, nextItems);
      const changedNumbers = changes.filter((c) => c.change === 'increase' || c.change === 'decrease').map((c) => c.support_item_number);
      // Shifts are read through the signed-in business's own client, so only this business's shifts are re-priced.
      const shifts = changedNumbers.length
        ? await all(base44.entities.Shift, { support_item_number: { $in: changedNumbers }, date: { $gte: release.effective_from } }, 'date')
        : [];
      const reprice = shiftsToReprice(shifts, changes, release.effective_from);
      const summary = {
        increases: changes.filter((c) => c.change === 'increase').length,
        decreases: changes.filter((c) => c.change === 'decrease').length,
        new_items: changes.filter((c) => c.change === 'new').length,
        removed_items: changes.filter((c) => c.change === 'removed').length,
        shifts_to_reprice: reprice.length,
        first_release: !current,
      };

      if (action === 'preview') {
        return Response.json({ release, current_release: current, summary, changes: changes.slice(0, 500), shifts: reprice.slice(0, 200) });
      }

      if (body.confirm !== true) return Response.json({ error: 'Approval must be confirmed.' }, { status: 400 });
      for (const r of reprice) await base44.entities.Shift.update(r.shift_id, { billable_rate: r.new_rate });
      if (current) {
        await Release.update(current.id, { status: 'Superseded', effective_to: dayBefore(release.effective_from) });
        await Item.updateMany({ release_id: current.id }, { $set: { active: false, effective_to: dayBefore(release.effective_from) } }).catch(() => null);
      }
      await Release.update(release.id, { status: 'Active' });
      await Item.updateMany({ release_id: release.id }, { $set: { active: true } }).catch(() => null);
      await service.entities.AuditLog.create({
        action: 'NDIS Price Guide Applied',
        entity_type: 'NDISPriceGuideRelease',
        record_id: release.id,
        record_title: release.title,
        performed_by: user.full_name || user.email,
        performed_by_user_id: user.id,
        performed_by_email: user.email,
        performed_by_role: user.role,
        details: `Approved and applied from ${release.effective_from}. ${summary.increases} price increases, ${summary.decreases} decreases, ${summary.new_items} new and ${summary.removed_items} removed items. ${reprice.length} future un-invoiced shifts re-priced: ${reprice.slice(0, 40).map((r) => `${r.shift_id} ${r.old_rate}->${r.new_rate}`).join('; ')}. Invoiced shifts and sent or claimed invoices unchanged.`.slice(0, 2000),
        timestamp: new Date().toISOString(),
      });
      return Response.json({ applied: true, summary });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: (error as Error)?.message || 'Price guide request failed.' }, { status: 500 });
  }
});
