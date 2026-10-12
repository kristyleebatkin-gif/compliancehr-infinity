import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { fetchNdisItems, cleanNdisItems } from '../../shared/ndisNews.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await fetchNdisItems(base44.asServiceRole.integrations.Core);
    return Response.json({ items: cleanNdisItems(result?.items) });
  } catch (error) {
    return Response.json({ error: error.message || 'NDIS news fetch failed.' }, { status: 500 });
  }
}