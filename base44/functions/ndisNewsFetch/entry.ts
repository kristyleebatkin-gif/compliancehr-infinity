import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { fetchNdisItems, cleanNdisItems } from '../../shared/ndisNews.ts';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await fetchNdisItems(base44.asServiceRole.integrations.Core);
    return Response.json({ items: cleanNdisItems(result?.items) });
  } catch (error) {
    return Response.json({ error: error.message || 'NDIS news fetch failed.' }, { status: 500 });
  }
});