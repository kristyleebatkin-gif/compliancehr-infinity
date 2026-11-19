import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { fetchNdisItems, cleanNdisItems, fetchAgedCareItems, cleanAgedCareItems } from '../../shared/ndisNews.ts';

// User-triggered refresh. body.sector: 'NDIS' (default, as before), 'Aged Care' or 'all'.
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const sector = ['NDIS', 'Aged Care', 'all'].includes(body.sector) ? body.sector : 'NDIS';
    const service = base44.asServiceRole;
    const ctx = { feature: 'ndisNewsFetch', user };

    const items: any[] = [];
    if (sector === 'NDIS' || sector === 'all') items.push(...cleanNdisItems((await fetchNdisItems(service, ctx))?.items));
    if (sector === 'Aged Care' || sector === 'all') items.push(...cleanAgedCareItems((await fetchAgedCareItems(service, ctx))?.items));
    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: (error as Error).message || 'News fetch failed.' }, { status: 500 });
  }
});
