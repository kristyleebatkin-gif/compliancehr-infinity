/**
 * PMM — Product Model Management core (Phase 1 of the PMM plan).
 *
 * What this really does:
 *   - loads a metadata bundle (platform, security, domains, entities, workflows, reports, AI skills,
 *     capabilities) and validates each record against the PMM specification
 *   - resolves every declared reference and reports the ones that do not resolve
 *   - builds the canonical AST, then the MetadataGraph, the ValidatedGraph and the CompiledGraph
 *   - generates reference-only database, API, screen and test artefacts from one entity's metadata
 *
 * What it deliberately refuses:
 *   - writing anything: this module is pure, has no clock and no I/O, so the same metadata always
 *     compiles to the same hash and a test can assert it
 *   - claiming that reference artefacts are deployed, migrated or tested. Everything it generates is
 *     labelled reference output, and the live app stays on the Base44 runtime
 *   - inventing registers, modules, workflows or capabilities: the repository is reconciled against
 *     the app's real files and a Deno test fails when a declaration drifts from them
 */

export const PMM_VERSION = '1.0.0';
export const PMM_ENGINE = 'pmm-core';

export const CAPABILITY_STATUSES = ['present', 'partial', 'planned', 'blocked', 'unverified'];
export const FACTORY_STATES = ['reused', 'generated-reference', 'not-generated'];
export const ENTITY_SOURCES = ['existing', 'planned'];
export const TENANCY_MODES = ['tenant-scoped', 'shared', 'platform'];
export const FIELD_TYPES = ['string', 'text', 'integer', 'number', 'boolean', 'date', 'datetime', 'enum', 'json', 'reference'];
export const RELATION_KINDS = ['many-to-one', 'one-to-many'];
export const TRIGGER_KINDS = [
  'entity', 'scheduled', 'webhook', 'connector', 'hook', 'app_user_auth',
  'app_publish', 'app_payment', 'in_app_agent', 'media_generation', 'production_issue',
];
export const REFERENCE_KINDS = ['prisma', 'sql', 'openapi', 'screen', 'test'];

const text = (value: any) => (typeof value === 'string' ? value.trim() : '');
const list = (value: any) => (Array.isArray(value) ? value : []);
const issue = (path: string, message: string) => ({ path, message });
const unique = (items: any[]) => [...new Set(items)];

/** Stable 32-bit FNV-1a hash. Used so compiled output can be compared without a timestamp. */
export function stableHash(input: string): string {
  let hash = 0x811c9dc5;
  const value = typeof input === 'string' ? input : '';
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function emptyBundle() {
  return {
    platform: {}, security: {}, domains: [], entities: [], workflows: [], reports: [], ai: [], capabilities: [],
  };
}

// ---------------------------------------------------------------------------------------------
// Specification validators. Each returns a list of issues; an empty list means the record is valid.
// ---------------------------------------------------------------------------------------------

export function validatePlatform(platform: any = {}) {
  const errors: any[] = [];
  if (!text(platform.key)) errors.push(issue('platform.key', 'The platform needs a key.'));
  if (!text(platform.name)) errors.push(issue('platform.name', 'The platform needs a name.'));
  if (!text(platform.runtime)) errors.push(issue('platform.runtime', 'Record the runtime the app actually runs on.'));
  if (!text(platform.version)) errors.push(issue('platform.version', 'The platform metadata needs a version.'));
  if (!list(platform.targetStack).length) errors.push(issue('platform.targetStack', 'Record the target stack for generated outputs.'));
  if (!list(platform.migrationRules).length) errors.push(issue('platform.migrationRules', 'The migration rules must be stated, not implied.'));
  list(platform.compatibility).forEach((entry: any, index: number) => {
    if (!text(entry?.area)) errors.push(issue(`platform.compatibility[${index}].area`, 'A compatibility entry needs an area.'));
    if (!text(entry?.current)) errors.push(issue(`platform.compatibility[${index}].current`, 'Record what the app uses today.'));
    if (!text(entry?.target)) errors.push(issue(`platform.compatibility[${index}].target`, 'Record the target architecture.'));
    if (!text(entry?.approach)) errors.push(issue(`platform.compatibility[${index}].approach`, 'Record how the two are reconciled.'));
  });
  return errors;
}

export function validateSecurity(security: any = {}) {
  const errors: any[] = [];
  if (!list(security.roles).length) errors.push(issue('security.roles', 'At least one role must be declared.'));
  if (!text(security.tenancy)) errors.push(issue('security.tenancy', 'State the tenancy model.'));
  if (!text(security.permissionModel)) errors.push(issue('security.permissionModel', 'State the permission model.'));
  if (!text(security.rls)) errors.push(issue('security.rls', 'State how row-level security is applied.'));
  return errors;
}

export function validateDomain(domain: any = {}, index = 0) {
  const errors: any[] = [];
  const path = `domains[${index}]`;
  if (!text(domain.key)) errors.push(issue(`${path}.key`, 'A domain needs a key.'));
  if (!text(domain.label)) errors.push(issue(`${path}.label`, 'A domain needs a label.'));
  if (!list(domain.modules).length) errors.push(issue(`${path}.modules`, 'A domain must name the modules that serve it.'));
  if (!list(domain.entities).length) errors.push(issue(`${path}.entities`, 'A domain must name at least one register.'));
  if (list(domain.dependsOn).includes(domain.key)) errors.push(issue(`${path}.dependsOn`, 'A domain cannot depend on itself.'));
  return errors;
}

export function validateEntity(entity: any = {}, index = 0) {
  const errors: any[] = [];
  const path = `entities[${index}]`;
  if (!text(entity.key)) errors.push(issue(`${path}.key`, 'An entity needs a key.'));
  if (!text(entity.domain)) errors.push(issue(`${path}.domain`, 'An entity must belong to a domain.'));
  if (!ENTITY_SOURCES.includes(entity.source)) errors.push(issue(`${path}.source`, `Entity source must be one of ${ENTITY_SOURCES.join(', ')}.`));
  if (!TENANCY_MODES.includes(entity.tenancy)) errors.push(issue(`${path}.tenancy`, `Entity tenancy must be one of ${TENANCY_MODES.join(', ')}.`));
  if (!text(entity.ownerRule)) errors.push(issue(`${path}.ownerRule`, 'State who owns the record and who may change it.'));
  if (entity.source === 'existing' && !text(entity.base44Entity)) {
    errors.push(issue(`${path}.base44Entity`, 'An existing register must name the Base44 entity it lives in.'));
  }
  const fields = list(entity.fields);
  if (!fields.length) errors.push(issue(`${path}.fields`, 'An entity needs at least one declared field.'));
  const seen: string[] = [];
  fields.forEach((field: any, fieldIndex: number) => {
    const fieldPath = `${path}.fields[${fieldIndex}]`;
    if (!text(field?.name)) errors.push(issue(`${fieldPath}.name`, 'A field needs a name.'));
    if (!FIELD_TYPES.includes(field?.type)) errors.push(issue(`${fieldPath}.type`, `Field type must be one of ${FIELD_TYPES.join(', ')}.`));
    if (seen.includes(field?.name)) errors.push(issue(`${fieldPath}.name`, `Field "${field?.name}" is declared twice.`));
    seen.push(field?.name);
  });
  if (text(entity.keyField) && seen.length && !seen.includes(entity.keyField)) {
    errors.push(issue(`${path}.keyField`, `The key field "${entity.keyField}" is not declared on the entity.`));
  }
  if (text(entity.statusField) && seen.length && !seen.includes(entity.statusField)) {
    errors.push(issue(`${path}.statusField`, `The status field "${entity.statusField}" is not declared on the entity.`));
  }
  list(entity.relations).forEach((relation: any, relationIndex: number) => {
    const relationPath = `${path}.relations[${relationIndex}]`;
    if (!RELATION_KINDS.includes(relation?.kind)) errors.push(issue(`${relationPath}.kind`, `Relation kind must be one of ${RELATION_KINDS.join(', ')}.`));
    if (!text(relation?.target)) errors.push(issue(`${relationPath}.target`, 'A relation must name its target entity.'));
    if (!text(relation?.via)) errors.push(issue(`${relationPath}.via`, 'A relation must name the field that carries it.'));
  });
  return errors;
}

export function validateWorkflow(workflow: any = {}, index = 0) {
  const errors: any[] = [];
  const path = `workflows[${index}]`;
  if (!text(workflow.key)) errors.push(issue(`${path}.key`, 'A workflow needs a key.'));
  if (!text(workflow.name)) errors.push(issue(`${path}.name`, 'A workflow needs a name.'));
  if (!text(workflow.domain)) errors.push(issue(`${path}.domain`, 'A workflow must belong to a domain.'));
  if (!TRIGGER_KINDS.includes(workflow.trigger)) errors.push(issue(`${path}.trigger`, `Trigger must be one of ${TRIGGER_KINDS.join(', ')}.`));
  if (!text(workflow.file)) errors.push(issue(`${path}.file`, 'Name the workflow file that implements it.'));
  return errors;
}

export function validateReport(report: any = {}, index = 0) {
  const errors: any[] = [];
  const path = `reports[${index}]`;
  if (!text(report.key)) errors.push(issue(`${path}.key`, 'A report needs a key.'));
  if (!text(report.name)) errors.push(issue(`${path}.name`, 'A report needs a name.'));
  if (!text(report.domain)) errors.push(issue(`${path}.domain`, 'A report must belong to a domain.'));
  if (!text(report.surface)) errors.push(issue(`${path}.surface`, 'Name the page or function that produces the report today.'));
  return errors;
}

export function validateAi(ai: any = {}, index = 0) {
  const errors: any[] = [];
  const path = `ai[${index}]`;
  if (!text(ai.key)) errors.push(issue(`${path}.key`, 'An AI skill needs a key.'));
  if (!text(ai.name)) errors.push(issue(`${path}.name`, 'An AI skill needs a name.'));
  if (!text(ai.domain)) errors.push(issue(`${path}.domain`, 'An AI skill must belong to a domain.'));
  if (!text(ai.surface)) errors.push(issue(`${path}.surface`, 'Name the agent, function or page that delivers it.'));
  if (typeof ai.humanReview !== 'boolean') errors.push(issue(`${path}.humanReview`, 'State whether a person reviews the output before it is acted on.'));
  return errors;
}

export function validateCapability(capability: any = {}, index = 0) {
  const errors: any[] = [];
  const path = `capabilities[${index}]`;
  if (!text(capability.key)) errors.push(issue(`${path}.key`, 'A capability needs a key.'));
  if (!text(capability.name)) errors.push(issue(`${path}.name`, 'A capability needs a name.'));
  if (!Number.isInteger(capability.phase) || capability.phase < 0) errors.push(issue(`${path}.phase`, 'A capability needs a non-negative phase number.'));
  if (!CAPABILITY_STATUSES.includes(capability.status)) errors.push(issue(`${path}.status`, `Status must be one of ${CAPABILITY_STATUSES.join(', ')}.`));
  if (!FACTORY_STATES.includes(capability.factory)) errors.push(issue(`${path}.factory`, `Factory state must be one of ${FACTORY_STATES.join(', ')}.`));
  if (!list(capability.domains).length) errors.push(issue(`${path}.domains`, 'A capability must name the domains it covers.'));
  if ((capability.status === 'present' || capability.status === 'partial') && !list(capability.evidence).length) {
    errors.push(issue(`${path}.evidence`, 'A capability that is present or partial must cite the evidence behind that claim.'));
  }
  if (capability.status === 'blocked' && !text(capability.reason)) {
    errors.push(issue(`${path}.reason`, 'A blocked capability must say what blocks it.'));
  }
  if (capability.status === 'planned' && list(capability.evidence).length) {
    errors.push(issue(`${path}.evidence`, 'A planned capability cannot cite delivered evidence.'));
  }
  return errors;
}

// ---------------------------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------------------------

export function loadMetadata(bundle: any = emptyBundle()) {
  const source = { ...emptyBundle(), ...(bundle || {}) };
  const errors: any[] = [];
  const warnings: any[] = [];

  errors.push(...validatePlatform(source.platform));
  errors.push(...validateSecurity(source.security));
  list(source.domains).forEach((domain: any, index: number) => errors.push(...validateDomain(domain, index)));
  list(source.entities).forEach((entity: any, index: number) => errors.push(...validateEntity(entity, index)));
  list(source.workflows).forEach((workflow: any, index: number) => errors.push(...validateWorkflow(workflow, index)));
  list(source.reports).forEach((report: any, index: number) => errors.push(...validateReport(report, index)));
  list(source.ai).forEach((ai: any, index: number) => errors.push(...validateAi(ai, index)));
  list(source.capabilities).forEach((capability: any, index: number) => errors.push(...validateCapability(capability, index)));

  const duplicate = (items: any[], path: string) => {
    const seen = new Set<string>();
    list(items).forEach((item: any) => {
      const key = text(item?.key);
      if (!key) return;
      if (seen.has(key)) errors.push(issue(path, `"${key}" is declared more than once.`));
      seen.add(key);
    });
  };
  duplicate(source.domains, 'domains');
  duplicate(source.entities, 'entities');
  duplicate(source.workflows, 'workflows');
  duplicate(source.reports, 'reports');
  duplicate(source.ai, 'ai');
  duplicate(source.capabilities, 'capabilities');

  list(source.entities).forEach((entity: any) => {
    if (entity?.source === 'planned') {
      warnings.push(issue(`entities.${entity.key}`, 'Planned register: it has no live entity yet, so its generated artefacts are a design target.'));
    }
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    version: PMM_VERSION,
    counts: {
      domains: list(source.domains).length,
      entities: list(source.entities).length,
      existingEntities: list(source.entities).filter((entity: any) => entity?.source === 'existing').length,
      plannedEntities: list(source.entities).filter((entity: any) => entity?.source === 'planned').length,
      workflows: list(source.workflows).length,
      reports: list(source.reports).length,
      ai: list(source.ai).length,
      capabilities: list(source.capabilities).length,
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Reference resolution
// ---------------------------------------------------------------------------------------------

export function resolveReferences(bundle: any = emptyBundle()) {
  const source = { ...emptyBundle(), ...(bundle || {}) };
  const domains = list(source.domains);
  const entities = list(source.entities);
  const domainKeys = new Set(domains.map((domain: any) => text(domain?.key)).filter(Boolean));
  const entityKeys = new Set(entities.map((entity: any) => text(entity?.key)).filter(Boolean));
  const unresolved: any[] = [];
  const edges: any[] = [];

  domains.forEach((domain: any) => {
    const from = `domain:${text(domain?.key)}`;
    list(domain?.modules).forEach((moduleKey: string) => edges.push({ from, to: `module:${text(moduleKey)}`, kind: 'served_by' }));
    list(domain?.entities).forEach((entityKey: string) => {
      if (!entityKeys.has(text(entityKey))) unresolved.push({ from: text(domain?.key), to: text(entityKey), kind: 'domain-entity' });
      else edges.push({ from, to: `entity:${text(entityKey)}`, kind: 'contains' });
    });
    list(domain?.dependsOn).forEach((dependency: string) => {
      if (!domainKeys.has(text(dependency))) unresolved.push({ from: text(domain?.key), to: text(dependency), kind: 'domain-dependency' });
      else edges.push({ from, to: `domain:${text(dependency)}`, kind: 'depends_on' });
    });
  });

  entities.forEach((entity: any) => {
    const key = text(entity?.key);
    if (text(entity?.domain) && !domainKeys.has(text(entity?.domain))) {
      unresolved.push({ from: key, to: text(entity?.domain), kind: 'entity-domain' });
    } else if (text(entity?.domain)) {
      edges.push({ from: `entity:${key}`, to: `domain:${text(entity?.domain)}`, kind: 'belongs_to' });
    }
    list(entity?.relations).forEach((relation: any) => {
      const target = text(relation?.target);
      if (!entityKeys.has(target)) unresolved.push({ from: key, to: target, kind: 'entity-relation' });
      else edges.push({ from: `entity:${key}`, to: `entity:${target}`, kind: `relation:${text(relation?.kind)}` });
    });
  });

  const belongs = (item: any, label: string) => {
    if (!text(item?.domain)) return;
    if (!domainKeys.has(text(item.domain))) unresolved.push({ from: text(item?.key) || label, to: text(item.domain), kind: `${label}-domain` });
    else edges.push({ from: `${label}:${text(item?.key)}`, to: `domain:${text(item.domain)}`, kind: 'belongs_to' });
  };
  list(source.workflows).forEach((workflow: any) => belongs(workflow, 'workflow'));
  list(source.reports).forEach((report: any) => belongs(report, 'report'));
  list(source.ai).forEach((ai: any) => belongs(ai, 'ai'));

  list(source.capabilities).forEach((capability: any) => {
    list(capability?.domains).forEach((domainKey: string) => {
      if (!domainKeys.has(text(domainKey))) unresolved.push({ from: text(capability?.key), to: text(domainKey), kind: 'capability-domain' });
      else edges.push({ from: `capability:${text(capability?.key)}`, to: `domain:${text(domainKey)}`, kind: 'covers' });
    });
  });

  return { ok: unresolved.length === 0, unresolved, edges, counts: { edges: edges.length, unresolved: unresolved.length } };
}

// ---------------------------------------------------------------------------------------------
// Canonical AST
// ---------------------------------------------------------------------------------------------

export function buildAst(bundle: any = emptyBundle()) {
  const source = { ...emptyBundle(), ...(bundle || {}) };
  const nodes: any[] = [];
  const platform = source.platform || {};
  nodes.push({
    id: `platform:${text(platform.key) || 'unknown'}`,
    kind: 'platform',
    name: text(platform.name) || 'Unnamed platform',
    props: { runtime: text(platform.runtime), version: text(platform.version), targetStack: list(platform.targetStack) },
  });
  list(source.domains).forEach((domain: any) => nodes.push({
    id: `domain:${text(domain?.key)}`,
    kind: 'domain',
    name: text(domain?.label) || text(domain?.key),
    props: { modules: list(domain?.modules), dependsOn: list(domain?.dependsOn), purpose: text(domain?.purpose) },
  }));
  list(source.entities).forEach((entity: any) => nodes.push({
    id: `entity:${text(entity?.key)}`,
    kind: 'entity',
    name: text(entity?.key),
    props: {
      base44Entity: entity?.base44Entity || null,
      source: entity?.source,
      tenancy: entity?.tenancy,
      fields: list(entity?.fields).map((field: any) => text(field?.name)),
    },
  }));
  const modules = unique(list(source.domains).flatMap((domain: any) => list(domain?.modules).map((key: string) => text(key))));
  modules.filter(Boolean).forEach((moduleKey: string) => nodes.push({ id: `module:${moduleKey}`, kind: 'module', name: moduleKey, props: {} }));
  list(source.workflows).forEach((workflow: any) => nodes.push({
    id: `workflow:${text(workflow?.key)}`,
    kind: 'workflow',
    name: text(workflow?.name),
    props: { trigger: text(workflow?.trigger), file: text(workflow?.file) },
  }));
  list(source.reports).forEach((report: any) => nodes.push({
    id: `report:${text(report?.key)}`,
    kind: 'report',
    name: text(report?.name),
    props: { surface: text(report?.surface) },
  }));
  list(source.ai).forEach((ai: any) => nodes.push({
    id: `ai:${text(ai?.key)}`,
    kind: 'ai',
    name: text(ai?.name),
    props: { surface: text(ai?.surface), humanReview: ai?.humanReview === true },
  }));
  list(source.capabilities).forEach((capability: any) => nodes.push({
    id: `capability:${text(capability?.key)}`,
    kind: 'capability',
    name: text(capability?.name),
    props: { phase: capability?.phase, status: capability?.status, factory: capability?.factory },
  }));
  list(source.security?.roles).forEach((role: string) => nodes.push({ id: `role:${text(role)}`, kind: 'role', name: text(role), props: {} }));
  return nodes;
}

// ---------------------------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------------------------

export function buildMetadataGraph(bundle: any = emptyBundle()) {
  const nodes = buildAst(bundle);
  const resolved = resolveReferences(bundle);
  const edges = resolved.edges.slice();
  const known = new Set(nodes.map((node) => node.id));
  const stats: any = {};
  nodes.forEach((node) => { stats[node.kind] = (stats[node.kind] || 0) + 1; });
  return {
    nodes,
    edges,
    stats,
    orphans: nodes.filter((node) => !edges.some((edge) => edge.from === node.id || edge.to === node.id)).map((node) => node.id),
    dangling: edges.filter((edge) => !known.has(edge.from) || !known.has(edge.to)),
    version: PMM_VERSION,
  };
}

export function validateGraph(graph: any = {}) {
  const findings: any[] = [];
  const nodes = list(graph.nodes);
  const edges = list(graph.edges);
  const seen = new Set<string>();
  nodes.forEach((node: any) => {
    if (seen.has(node.id)) findings.push(issue(node.id, 'Duplicate node id in the graph.'));
    seen.add(node.id);
  });
  edges.forEach((edge: any) => {
    if (!seen.has(edge.from)) findings.push(issue(edge.from, `Edge starts at a node that does not exist (${edge.kind}).`));
    if (!seen.has(edge.to)) findings.push(issue(edge.to, `Edge ends at a node that does not exist (${edge.kind}).`));
  });

  // Domain dependency cycles would make the compile order impossible to honour.
  const dependencies: Record<string, string[]> = {};
  nodes.filter((node: any) => node.kind === 'domain').forEach((node: any) => { dependencies[node.id] = []; });
  edges.filter((edge: any) => edge.kind === 'depends_on').forEach((edge: any) => {
    if (dependencies[edge.from]) dependencies[edge.from].push(edge.to);
  });
  const state: Record<string, number> = {};
  const visit = (id: string, trail: string[]) => {
    if (state[id] === 2) return;
    if (state[id] === 1) {
      findings.push(issue(id, `Dependency cycle: ${[...trail, id].map((item) => item.replace('domain:', '')).join(' → ')}.`));
      return;
    }
    state[id] = 1;
    (dependencies[id] || []).forEach((next) => visit(next, [...trail, id]));
    state[id] = 2;
  };
  Object.keys(dependencies).forEach((id) => visit(id, []));

  return { ok: findings.length === 0, findings };
}

export function compileGraph(bundle: any = emptyBundle()) {
  const graph = buildMetadataGraph(bundle);
  const validated = validateGraph(graph);
  const domains = graph.nodes.filter((node: any) => node.kind === 'domain');
  const order: string[] = [];
  const placed = new Set<string>();
  const dependencies: Record<string, string[]> = {};
  domains.forEach((node: any) => {
    dependencies[node.id] = graph.edges.filter((edge: any) => edge.from === node.id && edge.kind === 'depends_on').map((edge: any) => edge.to);
  });
  // Deterministic topological order: dependencies first, ties broken by node id.
  let guard = 0;
  while (order.length < domains.length && guard <= domains.length * domains.length + 1) {
    guard += 1;
    domains
      .filter((node: any) => !placed.has(node.id) && dependencies[node.id].every((dependency: string) => placed.has(dependency) || !dependencies[dependency]))
      .sort((a: any, b: any) => a.id.localeCompare(b.id))
      .forEach((node: any) => {
        if (placed.has(node.id)) return;
        placed.add(node.id);
        order.push(node.id.replace('domain:', ''));
      });
  }
  domains.filter((node: any) => !placed.has(node.id)).forEach((node: any) => order.push(node.id.replace('domain:', '')));

  const signature = graph.nodes.map((node: any) => node.id).sort().join('|') + '::' + graph.edges.map((edge: any) => `${edge.from}>${edge.to}>${edge.kind}`).sort().join('|');

  return {
    version: PMM_VERSION,
    ok: validated.ok,
    findings: validated.findings,
    domainOrder: order,
    stats: graph.stats,
    coverage: {
      domains: domains.length,
      entities: graph.nodes.filter((node: any) => node.kind === 'entity').length,
      modules: graph.nodes.filter((node: any) => node.kind === 'module').length,
      workflows: graph.nodes.filter((node: any) => node.kind === 'workflow').length,
      reports: graph.nodes.filter((node: any) => node.kind === 'report').length,
      ai: graph.nodes.filter((node: any) => node.kind === 'ai').length,
      capabilities: graph.nodes.filter((node: any) => node.kind === 'capability').length,
      roles: graph.nodes.filter((node: any) => node.kind === 'role').length,
    },
    graphHash: stableHash(signature),
    orphans: graph.orphans,
  };
}

export function capabilitySummary(capabilities: any = []) {
  const rows = list(capabilities);
  const byStatus: any = {};
  CAPABILITY_STATUSES.forEach((status) => { byStatus[status] = 0; });
  rows.forEach((row: any) => { byStatus[row?.status] = (byStatus[row?.status] || 0) + 1; });
  return {
    total: rows.length,
    byStatus,
    gates: rows.filter((row: any) => row?.gate === true).map((row: any) => ({
      key: row.key, name: row.name, status: row.status, reason: row.reason || '',
    })),
  };
}

// ---------------------------------------------------------------------------------------------
// Reference artefacts (Phase 2–4 output, generated as reference only)
// ---------------------------------------------------------------------------------------------

const PRISMA_TYPES: Record<string, string> = {
  string: 'String', text: 'String', integer: 'Int', number: 'Float', boolean: 'Boolean',
  date: 'DateTime', datetime: 'DateTime', enum: 'String', json: 'Json', reference: 'String',
};
const SQL_TYPES: Record<string, string> = {
  string: 'text', text: 'text', integer: 'integer', number: 'numeric', boolean: 'boolean',
  date: 'date', datetime: 'timestamptz', enum: 'text', json: 'jsonb', reference: 'text',
};

const snake = (value: string) => text(value).replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const camel = (value: string) => text(value).replace(/_([a-z0-9])/g, (_, character) => character.toUpperCase());

function prismaArtefact(entity: any, domain: any) {
  const table = snake(entity.key);
  const lines = [
    `// Reference output only. Generated by PMM ${PMM_VERSION} from the ${entity.key} metadata.`,
    `// Not deployed and not migrated: the live register is ${entity.base44Entity || 'not created yet'}.`,
    `model ${entity.key} {`,
    '  id        String   @id @default(cuid())',
    ...(entity.tenancy === 'tenant-scoped' ? ['  tenantId  String   @map("tenant_id")'] : []),
    ...list(entity.fields).map((field: any) => {
      const type = PRISMA_TYPES[field.type] || 'String';
      const optional = field.required === true ? '' : '?';
      const mapped = snake(field.name) !== field.name ? ` @map("${snake(field.name)}")` : '';
      return `  ${field.name.padEnd(22)} ${type}${optional}${mapped}`;
    }),
    '  createdAt DateTime @default(now()) @map("created_at")',
    '  updatedAt DateTime @updatedAt @map("updated_at")',
    '',
    ...(entity.tenancy === 'tenant-scoped' ? ['  @@index([tenantId])'] : []),
    ...list(entity.relations).map((relation: any) => `  // ${relation.kind} → ${relation.target} via ${relation.via}`),
    `  @@map("${table}")`,
    '}',
  ];
  return lines.join('\n');
}

function sqlArtefact(entity: any, domain: any) {
  const table = snake(entity.key);
  const columns = list(entity.fields).map((field: any) => {
    const nullable = field.required === true ? ' NOT NULL' : '';
    return `  "${snake(field.name)}" ${SQL_TYPES[field.type] || 'text'}${nullable}`;
  });
  const statements = [
    `-- Reference output only. Generated by PMM ${PMM_VERSION} for the ${entity.key} register in the ${domain?.label || entity.domain} domain.`,
    '-- Nothing here has been executed against the live database.',
    `CREATE TABLE IF NOT EXISTS "${table}" (`,
    '  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),',
    ...(entity.tenancy === 'tenant-scoped' ? ['  "tenant_id" text NOT NULL,'] : []),
    ...columns.map((column: string) => `${column},`),
    '  "created_at" timestamptz NOT NULL DEFAULT now(),',
    '  "updated_at" timestamptz NOT NULL DEFAULT now()',
    ');',
  ];
  if (entity.tenancy === 'tenant-scoped') {
    statements.push(
      '',
      `CREATE INDEX IF NOT EXISTS "${table}_tenant_idx" ON "${table}" ("tenant_id");`,
      `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`,
      `CREATE POLICY "${table}_tenant_isolation" ON "${table}"`,
      `  USING ("tenant_id" = current_setting('app.tenant_id', true))`,
      `  WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));`,
      '',
      `CREATE TRIGGER "${table}_touch" BEFORE UPDATE ON "${table}"`,
      '  FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
    );
  } else {
    statements.push('', `-- ${entity.tenancy} register: no tenant policy is generated, so access must be closed at the API layer.`);
  }
  return statements.join('\n');
}

function openApiArtefact(entity: any, domain: any) {
  const path = `/${snake(entity.key)}s`;
  const properties: any = {};
  list(entity.fields).forEach((field: any) => {
    properties[field.name] = {
      type: field.type === 'integer' || field.type === 'number' ? 'number' : field.type === 'boolean' ? 'boolean' : 'string',
      ...(field.type === 'date' ? { format: 'date' } : {}),
      ...(field.type === 'datetime' ? { format: 'date-time' } : {}),
    };
  });
  const required = list(entity.fields).filter((field: any) => field.required === true).map((field: any) => field.name);
  const document = {
    openapi: '3.1.0',
    info: {
      title: `${entity.key} API`,
      version: PMM_VERSION,
      description: `Reference output only, generated from PMM metadata for the ${domain?.label || entity.domain} domain. Not deployed.`,
    },
    paths: {
      [path]: {
        get: {
          summary: `List ${entity.key} records for the acting business`,
          responses: { 200: { description: 'A page of records' }, 403: { description: 'Not permitted for this role or business' } },
        },
        post: {
          summary: `Create a ${entity.key} record`,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${entity.key}Input` } } } },
          responses: { 201: { description: 'Created' }, 400: { description: 'Validation refused' } },
        },
      },
      [`${path}/{id}`]: {
        get: { summary: `Read one ${entity.key} record`, responses: { 200: { description: 'The record' }, 404: { description: 'Not in this business' } } },
        patch: {
          summary: `Update one ${entity.key} record`,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${entity.key}Input` } } } },
          responses: { 200: { description: 'Updated' }, 409: { description: 'Version conflict' } },
        },
        delete: { summary: `Delete one ${entity.key} record`, responses: { 204: { description: 'Deleted' }, 403: { description: 'Not permitted' } } },
      },
    },
    components: {
      schemas: {
        [entity.key]: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ...(entity.tenancy === 'tenant-scoped' ? { tenant_id: { type: 'string' } } : {}),
            ...properties,
          },
          required,
        },
        [`${entity.key}Input`]: {
          type: 'object',
          properties,
          required,
        },
      },
    },
  };
  return JSON.stringify(document, null, 2);
}

function screenArtefact(entity: any, domain: any) {
  const fields = list(entity.fields);
  const columns = fields.slice(0, 5).map((field: any) => field.name);
  return [
    `# ${entity.key} — generated screen specification`,
    '',
    `Reference output only, generated from PMM metadata. The live module for this domain is ${list(domain?.modules)[0] || 'not yet assigned'}; its existing route and screen are preserved and are not replaced by this specification.`,
    '',
    `- Domain: ${domain?.label || entity.domain}`,
    `- Register: ${entity.base44Entity || 'planned, no live entity yet'}`,
    `- Tenancy: ${entity.tenancy}`,
    `- Key field: ${entity.keyField || 'not set'}`,
    `- Status field: ${entity.statusField || 'not set'}`,
    '',
    '## Register screen',
    `- Columns: ${columns.join(', ')}`,
    `- Filters: ${[entity.statusField, entity.ownerField].filter(Boolean).join(', ') || 'status'}`,
    '- Search: the key field and the title',
    '- Actions: open record, create record, export the current filtered page',
    '',
    '## Detail screen',
    ...fields.map((field: any) => `- ${field.name} (${field.type}${field.required ? ', required' : ''})`),
    '',
    '## States',
    '- Loading: skeleton rows, never a blank screen',
    '- Empty: states what is missing and who can add it',
    '- Error: shows the refusal message returned by the service',
    '- Permission denied: explains the role that would open it',
    '- Read-only: shown when the person may read but not change records',
    '- Success: the saved record is visible without a reload',
    '',
    '## Ownership',
    entity.ownerRule,
  ].join('\n');
}

function testArtefact(entity: any) {
  const required = list(entity.fields).filter((field: any) => field.required === true).map((field: any) => field.name);
  return [
    `# ${entity.key} — generated test specification`,
    '',
    'Reference output only. These are the tests the factory would emit; the app’s own suites remain the executed evidence.',
    '',
    '## Validation',
    ...(required.length ? required.map((name: string) => `- refuses a record without ${name}`) : ['- refuses an empty record']),
    '- refuses a status outside the declared set',
    '',
    '## Tenant isolation',
    ...(entity.tenancy === 'tenant-scoped'
      ? [
        '- a record from another business is not returned by list or get',
        '- a create carrying another business’s tenant id is refused',
        '- an update to another business’s record is refused',
        '- a delete of another business’s record is refused',
        '- a call with no business context is refused',
      ]
      : ['- a shared register is readable by approved users only', '- a write from a browser session is refused']),
    '',
    '## Audit',
    '- every write and every refusal leaves an audit record',
  ].join('\n');
}

export function generateReference(bundle: any = emptyBundle(), entityKey = '') {
  const source = { ...emptyBundle(), ...(bundle || {}) };
  const key = text(entityKey);
  const entity = list(source.entities).find((candidate: any) => text(candidate?.key).toLowerCase() === key.toLowerCase());
  if (!entity) return { ok: false, error: `"${key}" is not a register in the PMM metadata.` };
  const domain = list(source.domains).find((candidate: any) => text(candidate?.key) === text(entity.domain)) || {};
  const artefacts = [
    { kind: 'prisma', title: `${snake(entity.key)}.prisma`, language: 'prisma', body: prismaArtefact(entity, domain) },
    { kind: 'sql', title: `${snake(entity.key)}.sql`, language: 'sql', body: sqlArtefact(entity, domain) },
    { kind: 'openapi', title: `${snake(entity.key)}.openapi.json`, language: 'json', body: openApiArtefact(entity, domain) },
    { kind: 'screen', title: `${snake(entity.key)}.screen.md`, language: 'markdown', body: screenArtefact(entity, domain) },
    { kind: 'test', title: `${snake(entity.key)}.test.md`, language: 'markdown', body: testArtefact(entity) },
  ];
  const notes = [
    'Reference output only: nothing generated here has been deployed, migrated or executed.',
    `The live application remains on ${text(source.platform?.runtime) || 'its current runtime'}.`,
  ];
  if (entity.source === 'planned') notes.push('This register is planned: the artefacts describe the design target, not a record the app holds today.');
  return {
    ok: true,
    entity: {
      key: entity.key, domain: entity.domain, domainLabel: domain.label || entity.domain,
      base44Entity: entity.base44Entity || null, source: entity.source, tenancy: entity.tenancy,
    },
    artefacts,
    notes,
  };
}

/** One payload for the workspace: validation, resolution, compile and capability position. */
export function describeFactory(bundle: any = emptyBundle()) {
  const loaded = loadMetadata(bundle);
  const resolved = resolveReferences(bundle);
  const compiled = compileGraph(bundle);
  const capabilities = capabilitySummary(bundle?.capabilities);
  return {
    version: PMM_VERSION,
    engine: PMM_ENGINE,
    platform: bundle?.platform || {},
    security: bundle?.security || {},
    registers: list(bundle?.entities).map((entity: any) => ({
      key: text(entity?.key),
      domain: text(entity?.domain),
      source: entity?.source,
      base44Entity: entity?.base44Entity || null,
      tenancy: entity?.tenancy,
    })),
    loaded,
    resolved,
    compiled,
    capabilities,
  };
}