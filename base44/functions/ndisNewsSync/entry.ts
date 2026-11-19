import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { fetchNdisItems, cleanNdisItems, fetchAgedCareItems, cleanAgedCareItems } from '../../shared/ndisNews.ts';

// Fetches the latest NDIS and aged care news and upserts it into the shared update library.
// Called daily by the "NDIS News Updates" scheduled workflow, which runs as the app's admin.
// Only management users may also trigger it manually. One sector failing does not stop the other.
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const service = base44.asServiceRole;
    const ctx = { feature: 'ndisNewsSync' };

    const [ndis, aged] = await Promise.allSettled([fetchNdisItems(service, ctx), fetchAgedCareItems(service, ctx)]);
    const cleaned = [
      ...(ndis.status === 'fulfilled' ? cleanNdisItems(ndis.value?.items) : []),
      ...(aged.status === 'fulfilled' ? cleanAgedCareItems(aged.value?.items) : []),
    ];
    const errors = [
      ...(ndis.status === 'rejected' ? [`NDIS: ${ndis.reason?.message || 'failed'}`] : []),
      ...(aged.status === 'rejected' ? [`Aged care: ${aged.reason?.message || 'failed'}`] : []),
    ];
    if (!cleaned.length) return Response.json({ created: 0, updated: 0, items: 0, errors });

    const upsert = await service.entities.NdisUpdate.upsert(cleaned, { key: 'url' });
    return Response.json({
      created: upsert.created || 0,
      updated: upsert.updated || 0,
      items: cleaned.length,
      ndis_items: cleaned.filter((c) => c.sector === 'NDIS').length,
      aged_care_items: cleaned.filter((c) => c.sector === 'Aged Care').length,
      errors,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message || 'News sync failed.' }, { status: 500 });
  }
});
