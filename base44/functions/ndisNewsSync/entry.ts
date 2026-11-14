import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { fetchNdisItems, cleanNdisItems } from '../../shared/ndisNews.ts';

// Fetches the latest NDIS news and upserts it into the NdisUpdate library.
// Called daily by the "NDIS News Updates" scheduled workflow, which runs as
// the app's admin. Only management users may also trigger it manually.
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const service = base44.asServiceRole;
    const core = service.integrations.Core;

    const result = await fetchNdisItems(core);
    const cleaned = cleanNdisItems(result?.items);
    if (!cleaned.length) return Response.json({ created: 0, updated: 0, items: 0 });

    const upsert = await service.entities.NdisUpdate.upsert(cleaned, { key: 'url' });
    return Response.json({
      created: upsert.created || 0,
      updated: upsert.updated || 0,
      items: cleaned.length,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'NDIS news sync failed.' }, { status: 500 });
  }
});