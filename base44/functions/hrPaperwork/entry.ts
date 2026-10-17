import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * Saves HR paperwork records (employment contracts and position descriptions).
 * The underlying entities are service-role-write only, so this narrowly scoped
 * function performs the create/update on behalf of an authenticated app user.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;
    const kind = body.kind;
    const data = body.data || {};
    const id = body.id;

    if (action !== 'create' && action !== 'update') {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
    if (kind !== 'contract' && kind !== 'position') {
      return Response.json({ error: 'kind must be contract or position' }, { status: 400 });
    }
    const entityName = kind === 'contract' ? 'EmployeeEmploymentContract' : 'EmployeePositionDescription';
    const entity = base44.asServiceRole.entities[entityName];

    if (action === 'create') {
      const record = await entity.create(data);
      return Response.json({ record });
    }
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });
    const record = await entity.update(id, data);
    return Response.json({ record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}