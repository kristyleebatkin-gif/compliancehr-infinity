import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId, COMPLIANCE_REVIEW_ROLES } from '../../shared/roleMatrix.ts';
import { str, nowIso } from '../../shared/registerCommon.ts';
import { indexGraph, NODE_TYPES, RELATIONSHIP_TYPES, HOUSE_ONTOLOGY_KEY, HOUSE_TAXONOMY_KEY } from '../../shared/graphRegistry.ts';

const canRead = (user: any) => COMPLIANCE_REVIEW_ROLES.includes(user.role);
const canWrite = (user: any) => COMPLIANCE_REVIEW_ROLES.includes(user.role);

const listAll = async (dao: any, query: any, limit: number) => {
  const page = await dao.filter(query, { limit });
  return { items: Array.isArray(page) ? page : page?.items || [], hasMore: Boolean(page?.has_more) };
};

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use the graph registry.' }, { status: 401 });
    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId || !canRead(user)) {
      return Response.json({ error: 'Approved compliance access to your assigned business is required.' }, { status: 403 });
    }
    const tenantId = base44.businessId;
    const entities = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';

    if (action === 'list') {
      const [nodesResult, edgesResult, taxonomiesResult, ontologiesResult] = await Promise.all([
        listAll(entities.GraphEntity, { tenant_id: tenantId }, 2000),
        listAll(entities.GraphRelationship, { tenant_id: tenantId, status: 'Active' }, 2000),
        listAll(entities.GraphTaxonomy, { tenant_id: tenantId }, 20),
        listAll(entities.GraphOntology, { tenant_id: tenantId }, 20),
      ]);
      const nodes = nodesResult.items;
      const edges = edgesResult.items;
      const typeFilter = str(body.type);
      const term = str(body.search).toLowerCase();
      const statusFilter = str(body.record_status);

      const visible = nodes.filter((row: any) => {
        if (typeFilter && row.entity_type !== typeFilter) return false;
        if (statusFilter && row.record_status !== statusFilter) return false;
        if (!term) return true;
        return `${row.display_label || ''} ${row.summary || ''} ${row.source_record_id || ''} ${row.entity_key || ''}`
          .toLowerCase().includes(term);
      });
      const linked = nodes.filter((row: any) => Number(row.relationship_count || 0) > 0);

      const byType = NODE_TYPES.map((type) => ({
        key: type.key,
        label: type.label,
        count: nodes.filter((row: any) => row.entity_type === type.key).length,
        linked: nodes.filter((row: any) => row.entity_type === type.key && Number(row.relationship_count || 0) > 0).length,
      }));

      return Response.json({
        saved: true,
        canRebuild: canWrite(user),
        role: user.role,
        nodes: visible.slice(0, 200),
        nodeTotal: visible.length,
        truncatedList: visible.length > 200,
        edges: edges.slice(0, 2000),
        typeCounts: byType,
        relationshipTypes: RELATIONSHIP_TYPES,
        taxonomies: taxonomiesResult.items,
        ontologies: ontologiesResult.items,
        ontologyKey: HOUSE_ONTOLOGY_KEY,
        taxonomyKey: HOUSE_TAXONOMY_KEY,
        counts: {
          nodes: nodes.length,
          nodesLinked: linked.length,
          nodesOrphan: nodes.length - linked.length,
          relationships: edges.length,
          relationshipTypesUsed: new Set(edges.map((row: any) => row.relationship)).size,
          recordedLinks: edges.filter((row: any) => row.provenance_type === 'Knowledge link').length,
          derivedEdges: edges.filter((row: any) => row.provenance_type !== 'Knowledge link').length,
          indexedTypes: byType.filter((row) => row.count > 0).length,
          ontologies: ontologiesResult.items.length,
        },
        lastIndexedAt: taxonomiesResult.items[0]?.generated_at
          || nodes.reduce((latest: string, row: any) => (row.last_indexed_at > latest ? row.last_indexed_at : latest), '')
          || '',
      });
    }

    if (action === 'node') {
      const id = str(body.node_id);
      const key = str(body.entity_key);
      if (!id && !key) return Response.json({ error: 'Choose a node to inspect.' }, { status: 400 });
      const node = id
        ? await entities.GraphEntity.get(id).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)))
        : (await listAll(entities.GraphEntity, { tenant_id: tenantId, entity_key: key }, 1)).items[0] || null;
      if (!node || node.tenant_id !== tenantId) return Response.json({ error: 'That node is not in your business.' }, { status: 404 });

      const edges = await listAll(entities.GraphRelationship, {
        tenant_id: tenantId,
        status: 'Active',
        $or: [{ from_entity_key: node.entity_key }, { to_entity_key: node.entity_key }],
      }, 200);

      const relationships = edges.items.map((row: any) => {
        const outgoing = row.from_entity_key === node.entity_key;
        return {
          id: row.id,
          direction: outgoing ? 'out' : 'in',
          relationship: row.relationship,
          confidence: Number(row.confidence ?? 100),
          weight: Number(row.weight ?? 100),
          provenance_type: row.provenance_type,
          provenance_detail: row.provenance_detail,
          source_field: row.source_field,
          derived_rule: row.derived_rule,
          knowledge_link_id: row.knowledge_link_id,
          valid_from: row.valid_from,
          valid_to: row.valid_to,
          other_key: outgoing ? row.to_entity_key : row.from_entity_key,
          other_label: outgoing ? row.to_label : row.from_label,
          other_type: outgoing ? row.to_type : row.from_type,
        };
      });

      // Trace the node back to the record it references, in this business only.
      let sourceRecord: any = null;
      const sourceEntity = str(node.source_entity);
      if (sourceEntity && NODE_TYPES.some((type) => type.sourceEntity === sourceEntity)) {
        const record = await entities[sourceEntity].get(node.source_record_id)
          .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
        if (record && record.tenant_id === tenantId) {
          sourceRecord = { id: record.id, exists: true, updated: record.updated_date || '' };
        } else {
          sourceRecord = { id: node.source_record_id, exists: false, updated: '' };
        }
      }

      return Response.json({
        saved: true,
        node,
        relationships,
        sourceRecord,
        counts: {
          relationships: relationships.length,
          outgoing: relationships.filter((row: any) => row.direction === 'out').length,
          incoming: relationships.filter((row: any) => row.direction === 'in').length,
          recorded: relationships.filter((row: any) => row.provenance_type === 'Knowledge link').length,
          minConfidence: relationships.length ? Math.min(...relationships.map((row: any) => row.confidence)) : null,
        },
      });
    }

    if (action === 'rebuild') {
      if (!canWrite(user)) return Response.json({ error: 'Your role cannot rebuild the graph index.' }, { status: 403 });
      const summary = await indexGraph(base44, user, tenantId);
      return Response.json({ saved: true, summary, rebuiltAt: nowIso() });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The graph registry is unavailable.' }, { status: 500 });
  }
});