import { assertEquals, assert } from 'jsr:@std/assert@1';
import { PMM_METADATA } from '../../base44/shared/pmmMetadata.ts';
import {
  PMM_VERSION,
  buildMetadataGraph,
  capabilitySummary,
  compileGraph,
  generateReference,
  loadMetadata,
  resolveReferences,
  stableHash,
  validateGraph,
} from '../../base44/shared/pmm.ts';

const ROOT = new URL('../../', import.meta.url);

async function exists(path: string) {
  try {
    await Deno.stat(new URL(path, ROOT));
    return true;
  } catch {
    return false;
  }
}

async function readText(path: string) {
  return Deno.readTextFile(new URL(path, ROOT));
}

async function readJsonc(path: string) {
  const raw = await readText(path);
  return JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ''));
}

Deno.test('the metadata repository loads and satisfies the specification', () => {
  const loaded = loadMetadata(PMM_METADATA);
  assertEquals(loaded.ok, true, JSON.stringify(loaded.errors.slice(0, 5)));
  assertEquals(loaded.version, PMM_VERSION);
  assertEquals(loaded.counts.domains, PMM_METADATA.domains.length);
  assertEquals(loaded.counts.entities, PMM_METADATA.entities.length);
  assert(loaded.counts.existingEntities > 0);
  assert(loaded.counts.plannedEntities > 0);
});

Deno.test('every existing register names a real entity schema and only real fields', async () => {
  for (const entity of PMM_METADATA.entities.filter((row: any) => row.source === 'existing')) {
    const path = `base44/entities/${entity.base44Entity}.jsonc`;
    assert(await exists(path), `${entity.key} points at ${path}, which does not exist`);
    const schema = await readJsonc(path);
    const properties = schema.properties || {};
    for (const field of entity.fields) {
      assert(field.name in properties, `${entity.key}.${field.name} is not a field of ${entity.base44Entity}`);
    }
  }
});

Deno.test('planned registers are labelled and carry no live entity', () => {
  const planned = PMM_METADATA.entities.filter((row: any) => row.source === 'planned');
  assert(planned.length > 0);
  for (const entity of planned) {
    assertEquals(entity.base44Entity, null, `${entity.key} is planned, so it cannot name a live entity`);
  }
  const warnings = loadMetadata(PMM_METADATA).warnings.map((warning: any) => warning.path);
  for (const entity of planned) {
    assert(warnings.includes(`entities.${entity.key}`), `${entity.key} must warn that it is planned`);
  }
});

Deno.test('every workflow file and module key exists in the repository', async () => {
  const directory = await readText('src/lib/moduleDirectory.js');
  for (const domain of PMM_METADATA.domains) {
    for (const moduleKey of domain.modules) {
      assert(directory.includes(`key: '${moduleKey}'`), `module "${moduleKey}" is not in the module directory`);
    }
  }
  for (const workflow of PMM_METADATA.workflows) {
    assert(await exists(`base44/workflows/${workflow.file}`), `workflow file ${workflow.file} does not exist`);
  }
});

Deno.test('reports and AI skills name surfaces that exist', async () => {
  for (const report of PMM_METADATA.reports) {
    assert(await exists(report.surface), `report ${report.key} names ${report.surface}, which does not exist`);
  }
  for (const skill of PMM_METADATA.ai) {
    assert(await exists(skill.surface), `AI skill ${skill.key} names ${skill.surface}, which does not exist`);
  }
});

Deno.test('every capability claim is backed by evidence that exists', async () => {
  for (const capability of PMM_METADATA.capabilities) {
    if (capability.status === 'present' || capability.status === 'partial') {
      assert(capability.evidence.length > 0, `${capability.key} is ${capability.status} without evidence`);
    }
    if (capability.status === 'blocked') {
      assert(String(capability.reason || '').length > 20, `${capability.key} is blocked without a reason`);
    }
    for (const path of capability.evidence) {
      assert(await exists(path), `${capability.key} cites ${path}, which does not exist`);
    }
  }
});

Deno.test('every declared reference resolves', () => {
  const resolved = resolveReferences(PMM_METADATA);
  assertEquals(resolved.ok, true, JSON.stringify(resolved.unresolved.slice(0, 5)));
  assert(resolved.edges.length > 0);
});

Deno.test('the metadata graph is complete and valid', () => {
  const graph = buildMetadataGraph(PMM_METADATA);
  assertEquals(graph.stats.entity, PMM_METADATA.entities.length);
  assertEquals(graph.stats.domain, PMM_METADATA.domains.length);
  const validated = validateGraph(graph);
  assertEquals(validated.ok, true, JSON.stringify(validated.findings.slice(0, 5)));
  for (const orphan of graph.orphans) {
    assert(orphan.startsWith('platform:') || orphan.startsWith('role:'), `${orphan} is an unexpected orphan`);
  }
});

Deno.test('compilation is deterministic and covers every domain', () => {
  const first = compileGraph(PMM_METADATA);
  const second = compileGraph(PMM_METADATA);
  assertEquals(first.graphHash, second.graphHash);
  assertEquals(/^[0-9a-f]{8}$/.test(first.graphHash), true, 'the graph hash must be a stable 8-character hash');
  assertEquals(first.domainOrder.length, PMM_METADATA.domains.length);
  for (const domain of PMM_METADATA.domains) {
    assert(first.domainOrder.includes(domain.key), `${domain.key} is missing from the compile order`);
  }
  assertEquals(first.coverage.entities, PMM_METADATA.entities.length);
  assertEquals(first.findings.length, 0);
});

Deno.test('a dependency cycle is reported rather than compiled silently', () => {
  const cyclic = {
    ...PMM_METADATA,
    domains: [
      { ...PMM_METADATA.domains[0], dependsOn: ['compliance'] },
      { ...PMM_METADATA.domains[1], dependsOn: ['governance'] },
    ],
  };
  const graph = buildMetadataGraph(cyclic);
  const validated = validateGraph(graph);
  assertEquals(validated.ok, false);
  assert(validated.findings.some((finding: any) => finding.message.includes('cycle')));
});

Deno.test('reference output is generated for a live register and labelled', () => {
  const reference = generateReference(PMM_METADATA, 'Risk');
  assertEquals(reference.ok, true);
  assertEquals(reference.artefacts.length, 5);
  const byKind = Object.fromEntries(reference.artefacts.map((artefact: any) => [artefact.kind, artefact.body]));
  assert(byKind.prisma.includes('model Risk'));
  assert(byKind.prisma.includes('@@map("risk")'));
  assert(byKind.sql.includes('FORCE ROW LEVEL SECURITY'));
  assert(byKind.sql.includes('CREATE POLICY "risk_tenant_isolation"'));
  assert(byKind.screen.includes('Ownership'));
  assert(byKind.test.includes('another business'));
  const openapi = JSON.parse(byKind.openapi);
  assert('/risks' in openapi.paths);
  assertEquals(openapi.info.description.includes('Reference output only'), true);
  assert(reference.notes[0].includes('Reference output only'));
});

Deno.test('a planned register generates design-target output, and an unknown one is refused', () => {
  const planned = generateReference(PMM_METADATA, 'RiskReview');
  assertEquals(planned.ok, true);
  assert(planned.notes.some((note: string) => note.includes('planned')));
  const unknown = generateReference(PMM_METADATA, 'NotARegister');
  assertEquals(unknown.ok, false);
});

Deno.test('the capability summary counts every status and keeps the MVP gate blocked', () => {
  const summary = capabilitySummary(PMM_METADATA.capabilities);
  assertEquals(summary.total, PMM_METADATA.capabilities.length);
  const counted = Object.values(summary.byStatus).reduce((total: number, value: any) => total + value, 0);
  assertEquals(counted, summary.total);
  const gate = summary.gates.find((row: any) => row.key === 'mvp-release');
  assert(gate, 'the MVP release gate must be declared');
  assertEquals(gate.status, 'blocked');
  assert(gate.reason.length > 20);
});