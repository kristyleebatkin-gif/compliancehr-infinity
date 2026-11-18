// PMM — Product Model Management factory service.
//
// What this function really does:
//   - serves the metadata repository, its validation findings, the resolved references and the
//     compiled graph to the PMM workspace
//   - generates reference-only database, API, screen and test artefacts for one register
//
// What it deliberately refuses:
//   - writing anything: there is no create, update or delete path here, and no entity is touched
//   - deploying or migrating: every generated artefact is labelled reference output
//   - opening to roles that do not review compliance: approved access plus a compliance or
//     management role is required, and an auditor may read
import { PMM_METADATA } from '../../shared/pmmMetadata.ts';
import {
  PMM_VERSION,
  buildMetadataGraph,
  capabilitySummary,
  compileGraph,
  describeFactory,
  generateReference,
  loadMetadata,
  resolveReferences,
  validateGraph,
} from '../../shared/pmm.ts';
import { hasApprovedAccess, hasAnyRole, COMPLIANCE_REVIEW_ROLES } from '../../shared/roleMatrix.ts';
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

const ACTIONS = ['overview', 'validate', 'graph', 'compile', 'capabilities', 'entity'];

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to open the PMM factory.' }, { status: 401 });
    if (!hasApprovedAccess(user)) {
      return Response.json({ error: 'An active account with approved access is required.' }, { status: 403 });
    }

    const readOnly = user.role === 'Auditor';
    if (!readOnly && !hasAnyRole(user, COMPLIANCE_REVIEW_ROLES)) {
      return Response.json({ error: 'The PMM factory is open to compliance and management roles. Auditors may read it.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = typeof body?.action === 'string' && body.action.trim() ? body.action.trim() : 'overview';
    if (!ACTIONS.includes(action)) {
      return Response.json({ error: `Unknown action. Use one of: ${ACTIONS.join(', ')}.` }, { status: 400 });
    }

    if (action === 'overview') {
      return Response.json({ ...describeFactory(PMM_METADATA), readOnly, actions: ACTIONS });
    }

    if (action === 'validate') {
      const loaded = loadMetadata(PMM_METADATA);
      const resolved = resolveReferences(PMM_METADATA);
      return Response.json({ version: PMM_VERSION, loaded, resolved });
    }

    if (action === 'graph') {
      const graph = buildMetadataGraph(PMM_METADATA);
      const validated = validateGraph(graph);
      return Response.json({
        version: PMM_VERSION,
        stats: graph.stats,
        orphans: graph.orphans,
        dangling: graph.dangling.map((edge: any) => ({ from: edge.from, to: edge.to, kind: edge.kind })),
        validated,
        nodes: graph.nodes.map((node: any) => ({ id: node.id, kind: node.kind, name: node.name })),
        edges: graph.edges.map((edge: any) => ({ from: edge.from, to: edge.to, kind: edge.kind })),
      });
    }

    if (action === 'compile') {
      return Response.json({ version: PMM_VERSION, compiled: compileGraph(PMM_METADATA) });
    }

    if (action === 'capabilities') {
      const summary = capabilitySummary(PMM_METADATA.capabilities);
      const rows = PMM_METADATA.capabilities.map((capability: any) => ({
        key: capability.key,
        phase: capability.phase,
        name: capability.name,
        status: capability.status,
        factory: capability.factory,
        gate: capability.gate === true,
        domains: capability.domains,
        evidence: capability.evidence,
        reason: capability.reason || '',
        note: capability.note || '',
      }));
      return Response.json({ version: PMM_VERSION, summary, rows });
    }

    // action === 'entity'
    const entityKey = typeof body?.entity_key === 'string' ? body.entity_key.trim() : '';
    if (!entityKey) return Response.json({ error: 'Name the register to generate reference output for.' }, { status: 400 });
    const reference = generateReference(PMM_METADATA, entityKey);
    if (!reference.ok) return Response.json({ error: reference.error }, { status: 404 });
    return Response.json({ version: PMM_VERSION, ...reference, readOnly });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The PMM factory could not complete that request.' }, { status: 500 });
  }
});