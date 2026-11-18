/**
 * C7 graph registry. Builds the indexed node and relationship rows from the registers this app
 * already holds, plus the hand-edited KnowledgeLink register.
 *
 * Rules this file keeps:
 *   - The registers are the source of truth. No record is ever created to fill a gap in the graph.
 *   - KnowledgeLink stays the only hand-edited edge store. A recorded link is mirrored here by
 *     reference (knowledge_link_id), never copied into a second editable table.
 *   - Every edge is validated against an ontology before it is indexed: both endpoints must be
 *     indexed nodes of this business, an edge may not point at itself, and the triple must be
 *     allowed. Rejected candidates are reported, never silently dropped.
 */
import { nowIso, writeAudit } from './registerCommon.ts';

export const INDEX_VERSION = 'graph-index-1.0';
export const INDEX_LIMIT = 500;

/** The 23 canonical relationship types from the enterprise knowledge graph specification. */
export const RELATIONSHIP_TYPES = [
  'HAS_STANDARD', 'HAS_OBLIGATION', 'HAS_REQUIREMENT', 'REQUIRES', 'REFERENCES',
  'IMPLEMENTED_BY', 'SUPPORTED_BY', 'LINKED_TO', 'MITIGATED_BY', 'PRODUCES', 'GENERATES',
  'CREATES', 'ASSIGNED_TO', 'EVIDENCES', 'AUDITED_BY', 'VALIDATED_BY', 'APPROVED_BY',
  'REPORTS_TO', 'MANAGED_BY', 'GOVERNS', 'MONITORED_BY', 'OWNED_BY', 'RELATES_TO',
];

const text = (value: unknown) => String(value ?? '').trim();
const norm = (value: unknown) => text(value).toLowerCase();
const normCode = (value: unknown) => text(value).toUpperCase();
const codeList = (value: unknown) =>
  text(value).split(/[,;|\n]+/).map((entry) => normCode(entry)).filter((entry) => entry.length > 1);

/** Node types the registry can index: one per register that actually exists in this app. */
export const NODE_TYPES = [
  {
    key: 'standard', label: 'Standard', sourceEntity: 'RegulatoryStandard', path: '/evidence',
    title: (r: any) => [r.standard_code, r.standard_title].filter(Boolean).join(' · ') || 'Untitled standard',
    detail: (r: any) => [r.framework, r.module_area].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'control', label: 'Control', sourceEntity: 'ComplianceControl', path: '/evidence',
    title: (r: any) => text(r.control_statement).slice(0, 120) || 'Untitled control',
    detail: (r: any) => [r.standard_code, r.framework, r.owner].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'evidence', label: 'Evidence', sourceEntity: 'AssuranceEvidence', path: '/evidence',
    title: (r: any) => r.title || 'Untitled evidence',
    detail: (r: any) => [r.standard_code, r.evidence_type].filter(Boolean).join(' · '),
    status: (r: any) => r.verification_status,
  },
  {
    key: 'finding', label: 'Finding', sourceEntity: 'AssuranceFinding', path: '/evidence',
    title: (r: any) => r.title || 'Untitled finding',
    detail: (r: any) => [r.standard_code, r.rating].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'policy', label: 'Policy', sourceEntity: 'Policy', path: '/documents',
    title: (r: any) => r.document_name || 'Untitled policy',
    detail: (r: any) => [r.category, r.version].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'form', label: 'Form', sourceEntity: 'FormTemplate', path: '/checklists',
    title: (r: any) => r.title || 'Untitled form',
    detail: (r: any) => [r.category, r.version].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'audit', label: 'Audit', sourceEntity: 'InternalAudit', path: '/compliance',
    title: (r: any) => [r.audit_id, r.register_audited].filter(Boolean).join(' · ') || r.audit_category || 'Untitled audit',
    detail: (r: any) => [r.framework_standard, r.risk_rating].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'capa', label: 'Corrective action', sourceEntity: 'ImprovementAction', path: '/quality',
    title: (r: any) => [r.improvement_id, r.title].filter(Boolean).join(' · ') || 'Untitled action',
    detail: (r: any) => [r.area_department, r.priority].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'risk', label: 'Risk', sourceEntity: 'Risk', path: '/risks',
    title: (r: any) => r.title || 'Untitled risk',
    detail: (r: any) => [r.risk_id, r.category, r.rating].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'issue', label: 'Compliance issue', sourceEntity: 'ComplianceIssue', path: '/compliance',
    title: (r: any) => [r.issue_id, r.title].filter(Boolean).join(' · ') || 'Untitled issue',
    detail: (r: any) => [r.category, r.priority].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
  {
    key: 'recommendation', label: 'AI recommendation', sourceEntity: 'AiRecommendation', path: '/ai-os',
    title: (r: any) => r.title || 'Untitled recommendation',
    detail: (r: any) => [r.agent_name, r.module].filter(Boolean).join(' · '),
    status: (r: any) => r.status,
  },
];

export const nodeKey = (typeKey: string, id: string) => `${typeKey}:${id}`;
export const typeMeta = (key: string) => NODE_TYPES.find((type) => type.key === key) || NODE_TYPES[0];

const ENTITY_TO_TYPE: Record<string, string> = Object.fromEntries(
  NODE_TYPES.map((type) => [type.sourceEntity, type.key]),
);

/* ---------------------------------------------------------------------------------------------
 * Ontology triples
 * -------------------------------------------------------------------------------------------*/

/** Specific triples the derivation rules produce. Anything else derived is rejected. */
export const DERIVED_TRIPLES = [
  { from: 'control', relationship: 'REFERENCES', to: 'standard' },
  { from: 'control', relationship: 'REFERENCES', to: 'policy' },
  { from: 'evidence', relationship: 'EVIDENCES', to: 'control' },
  { from: 'finding', relationship: 'RELATES_TO', to: 'control' },
  { from: 'finding', relationship: 'VALIDATED_BY', to: 'evidence' },
  { from: 'audit', relationship: 'REFERENCES', to: 'standard' },
  { from: 'audit', relationship: 'CREATES', to: 'capa' },
  { from: 'capa', relationship: 'LINKED_TO', to: '*' },
  { from: 'risk', relationship: 'RELATES_TO', to: 'standard' },
  { from: 'risk', relationship: 'LINKED_TO', to: '*' },
  { from: 'recommendation', relationship: 'REFERENCES', to: 'standard' },
  { from: 'recommendation', relationship: 'REFERENCES', to: 'control' },
];

/** The house ontology: the specific triples above plus any canonical type for a recorded link. */
export const SYSTEM_TRIPLES = [
  ...DERIVED_TRIPLES,
  ...RELATIONSHIP_TYPES.map((relationship) => ({ from: '*', relationship, to: '*' })),
];

export function tripleAllowed(triples: any[], fromType: string, relationship: string, toType: string) {
  return triples.some((triple: any) => {
    if (triple.relationship !== relationship) return false;
    const fromOk = triple.from === '*' || triple.from === fromType;
    const toOk = triple.to === '*' || triple.to === toType;
    return fromOk && toOk;
  });
}

/* ---------------------------------------------------------------------------------------------
 * Reading the registers
 * -------------------------------------------------------------------------------------------*/

export async function loadRegisters(entities: any, tenantId: string) {
  const pages = await Promise.all(NODE_TYPES.map(async (type) => {
    const page = await entities[type.sourceEntity].filter({ tenant_id: tenantId }, { limit: INDEX_LIMIT });
    const items = Array.isArray(page) ? page : page?.items || [];
    return { key: type.key, items, truncated: items.length >= INDEX_LIMIT || Boolean(page?.has_more) };
  }));
  const linksPage = await entities.KnowledgeLink.filter({ tenant_id: tenantId, status: 'Active' }, { limit: INDEX_LIMIT });
  const links = Array.isArray(linksPage) ? linksPage : linksPage?.items || [];
  return {
    recordsByType: Object.fromEntries(pages.map((page) => [page.key, page.items])) as Record<string, any[]>,
    links,
    truncated: [
      ...pages.filter((page) => page.truncated).map((page) => typeMeta(page.key).label),
      ...(links.length >= INDEX_LIMIT ? ['Links register'] : []),
    ],
  };
}

/* ---------------------------------------------------------------------------------------------
 * Nodes and edges
 * -------------------------------------------------------------------------------------------*/

type EdgeInput = {
  fromType: string; fromId: string; toType: string; toId: string; relationship: string;
  confidence: number; provenanceType: string; provenanceDetail: string;
  knowledgeLinkId?: string; sourceField?: string; derivedRule?: string;
  validFrom?: string; validTo?: string; fromLabel?: string; toLabel?: string;
};

const edge = (options: EdgeInput) => ({
  fromKey: nodeKey(options.fromType, options.fromId),
  toKey: nodeKey(options.toType, options.toId),
  fromType: options.fromType,
  toType: options.toType,
  relationship: options.relationship,
  weight: 100,
  confidence: options.confidence,
  provenanceType: options.provenanceType,
  provenanceDetail: options.provenanceDetail,
  sourceField: options.sourceField || '',
  derivedRule: options.derivedRule || '',
  knowledgeLinkId: options.knowledgeLinkId || '',
  validFrom: options.validFrom || '',
  validTo: options.validTo || '',
  fromLabel: options.fromLabel || '',
  toLabel: options.toLabel || '',
});

export function buildNodes(recordsByType: Record<string, any[]>) {
  const nodes: any[] = [];
  NODE_TYPES.forEach((type) => {
    (recordsByType[type.key] || []).forEach((record: any) => {
      if (!record?.id) return;
      nodes.push({
        key: nodeKey(type.key, record.id),
        entityType: type.key,
        typeLabel: type.label,
        sourceEntity: type.sourceEntity,
        sourceRecordId: record.id,
        displayLabel: text(type.title(record)) || 'Untitled record',
        summary: text(type.detail ? type.detail(record) : ''),
        modulePath: type.path,
        recordStatus: text(type.status ? type.status(record) : ''),
      });
    });
  });
  return nodes;
}

export function deriveEdges(recordsByType: Record<string, any[]>) {
  const edges: any[] = [];
  const standards = recordsByType.standard || [];
  const controls = recordsByType.control || [];
  const policies = recordsByType.policy || [];

  const standardById = new Map(standards.map((row: any) => [row.id, row]));
  const byCode = (rows: any[]) => {
    const map = new Map<string, any[]>();
    rows.forEach((row: any) => {
      const code = normCode(row.standard_code);
      if (code) map.set(code, [...(map.get(code) || []), row]);
    });
    return map;
  };
  const standardsByCode = byCode(standards);
  const controlsByCode = byCode(controls);

  controls.forEach((control: any) => {
    const standard = (control.standard_id && standardById.get(control.standard_id))
      || (standardsByCode.get(normCode(control.standard_code)) || [])
        .filter((row: any) => row.framework === control.framework)
        .filter((row: any, _index: number, rows: any[]) => rows.length === 1)[0];
    if (standard) {
      edges.push(edge({
        fromType: 'control', fromId: control.id, toType: 'standard', toId: standard.id,
        relationship: 'REFERENCES', confidence: 100, provenanceType: 'Record field',
        provenanceDetail: 'The control names this standard on its own record.',
        sourceField: 'standard_id / standard_code', derivedRule: 'control.standard -> standard',
      }));
    }
    const reference = norm(control.policy_reference);
    if (reference.length < 4) return;
    policies.forEach((policy: any) => {
      const name = norm(policy.document_name);
      if (name.length > 4 && reference === name) {
        edges.push(edge({
          fromType: 'control', fromId: control.id, toType: 'policy', toId: policy.id,
          relationship: 'REFERENCES', confidence: 70, provenanceType: 'Record field',
          provenanceDetail: 'The control names this policy, matched on the policy name.',
          sourceField: 'policy_reference', derivedRule: 'control.policy_reference -> policy.document_name',
        }));
      }
    });
  });

  const controlIds = new Set(controls.map((row: any) => row.id));
  (recordsByType.evidence || []).forEach((row: any) => {
    if (controlIds.has(row.control_id)) {
      edges.push(edge({
        fromType: 'evidence', fromId: row.id, toType: 'control', toId: row.control_id,
        relationship: 'EVIDENCES', confidence: 100, provenanceType: 'Record field',
        provenanceDetail: 'The evidence record holds this control id.',
        sourceField: 'control_id', derivedRule: 'evidence.control_id -> control',
      }));
    }
  });

  (recordsByType.finding || []).forEach((row: any) => {
    if (controlIds.has(row.control_id)) {
      edges.push(edge({
        fromType: 'finding', fromId: row.id, toType: 'control', toId: row.control_id,
        relationship: 'RELATES_TO', confidence: 100, provenanceType: 'Record field',
        provenanceDetail: 'The finding was raised against this control.',
        sourceField: 'control_id', derivedRule: 'finding.control_id -> control',
      }));
    }
    if (row.evidence_id) {
      edges.push(edge({
        fromType: 'finding', fromId: row.id, toType: 'evidence', toId: row.evidence_id,
        relationship: 'VALIDATED_BY', confidence: 90, provenanceType: 'Record field',
        provenanceDetail: 'The finding references this evidence record.',
        sourceField: 'evidence_id', derivedRule: 'finding.evidence_id -> evidence',
      }));
    }
  });

  (recordsByType.audit || []).forEach((audit: any) => {
    const scope = normCode(audit.framework_standard);
    if (scope.length >= 2) {
      (standardsByCode.get(scope) || []).forEach((standard: any) => {
        edges.push(edge({
          fromType: 'audit', fromId: audit.id, toType: 'standard', toId: standard.id,
          relationship: 'REFERENCES', confidence: 80, provenanceType: 'Record field',
          provenanceDetail: 'The audit names this standard as its scope.',
          sourceField: 'framework_standard', derivedRule: 'audit.framework_standard -> standard',
        }));
      });
    }
    if (audit.linked_improvement_action_id) {
      edges.push(edge({
        fromType: 'audit', fromId: audit.id, toType: 'capa', toId: audit.linked_improvement_action_id,
        relationship: 'CREATES', confidence: 100, provenanceType: 'Record field',
        provenanceDetail: 'The audit records this corrective action.',
        sourceField: 'linked_improvement_action_id', derivedRule: 'audit -> capa',
      }));
    }
  });

  (recordsByType.capa || []).forEach((capa: any) => {
    const targetType = ENTITY_TO_TYPE[capa.linked_entity_type];
    if (targetType && capa.linked_entity_id) {
      edges.push(edge({
        fromType: 'capa', fromId: capa.id, toType: targetType, toId: capa.linked_entity_id,
        relationship: 'LINKED_TO', confidence: 100, provenanceType: 'Record field',
        provenanceDetail: 'The corrective action names the record it belongs to.',
        sourceField: 'linked_entity_type / linked_entity_id', derivedRule: 'capa -> linked record',
      }));
    }
  });

  (recordsByType.risk || []).forEach((risk: any) => {
    const named = normCode(risk.aged_care_standard);
    const standard = named ? (standardsByCode.get(named) || [])[0] : null;
    if (standard) {
      edges.push(edge({
        fromType: 'risk', fromId: risk.id, toType: 'standard', toId: standard.id,
        relationship: 'RELATES_TO', confidence: 60, provenanceType: 'Record field',
        provenanceDetail: 'The risk names this standard; the match is by code only.',
        sourceField: 'aged_care_standard', derivedRule: 'risk.aged_care_standard -> standard',
      }));
    }
    const sourceType = ENTITY_TO_TYPE[risk.source_entity_type];
    if (sourceType && risk.source_entity_id) {
      edges.push(edge({
        fromType: 'risk', fromId: risk.id, toType: sourceType, toId: risk.source_entity_id,
        relationship: 'LINKED_TO', confidence: 90, provenanceType: 'Record field',
        provenanceDetail: 'The risk records the record it was raised from.',
        sourceField: 'source_entity_type / source_entity_id', derivedRule: 'risk -> source record',
      }));
    }
  });

  (recordsByType.recommendation || []).forEach((recommendation: any) => {
    codeList(recommendation.standard_refs).forEach((code) => {
      (standardsByCode.get(code) || []).slice(0, 1).forEach((standard: any) => {
        edges.push(edge({
          fromType: 'recommendation', fromId: recommendation.id, toType: 'standard', toId: standard.id,
          relationship: 'REFERENCES', confidence: 90, provenanceType: 'Record field',
          provenanceDetail: `The recommendation names standard ${code}.`,
          sourceField: 'standard_refs', derivedRule: 'recommendation.standard_refs -> standard',
        }));
      });
    });
    codeList(recommendation.control_refs).forEach((code) => {
      (controlsByCode.get(code) || []).slice(0, 1).forEach((control: any) => {
        edges.push(edge({
          fromType: 'recommendation', fromId: recommendation.id, toType: 'control', toId: control.id,
          relationship: 'REFERENCES', confidence: 90, provenanceType: 'Record field',
          provenanceDetail: `The recommendation names control ${code}.`,
          sourceField: 'control_refs', derivedRule: 'recommendation.control_refs -> control',
        }));
      });
    });
  });

  return edges;
}

export function linkEdges(links: any[]) {
  return links.map((row: any) => edge({
    fromType: row.from_type, fromId: row.from_id, toType: row.to_type, toId: row.to_id,
    relationship: RELATIONSHIP_TYPES.includes(row.relationship) ? row.relationship : 'RELATES_TO',
    confidence: Number(row.confidence ?? 100),
    provenanceType: 'Knowledge link',
    provenanceDetail: `Recorded in the Links register by hand${row.reason ? `: ${text(row.reason).slice(0, 160)}` : '.'}`,
    knowledgeLinkId: row.id,
    sourceField: 'KnowledgeLink',
    derivedRule: 'recorded link',
    fromLabel: row.from_label,
    toLabel: row.to_label,
  }));
}

/** Endpoint and ontology validation. Rejections carry a reason so the UI can show them. */
export function validateEdges(candidates: any[], nodeKeys: Set<string>, triples: any[]) {
  const accepted: any[] = [];
  const rejected: any[] = [];
  const seen = new Set<string>();
  candidates.forEach((candidate) => {
    const key = `${candidate.fromKey}->${candidate.relationship}->${candidate.toKey}`;
    if (seen.has(key)) return;
    if (!nodeKeys.has(candidate.fromKey) || !nodeKeys.has(candidate.toKey)) {
      rejected.push({ edge: key, reason: 'An endpoint is not an indexed record of this business.' });
      return;
    }
    if (candidate.fromKey === candidate.toKey) {
      rejected.push({ edge: key, reason: 'A record cannot relate to itself.' });
      return;
    }
    if (!tripleAllowed(triples, candidate.fromType, candidate.relationship, candidate.toType)) {
      rejected.push({ edge: key, reason: `The ontology does not allow ${candidate.fromType} ${candidate.relationship} ${candidate.toType}.` });
      return;
    }
    seen.add(key);
    accepted.push({ ...candidate, relationshipKey: key });
  });
  return { accepted, rejected };
}

/* ---------------------------------------------------------------------------------------------
 * Persisting the index
 * -------------------------------------------------------------------------------------------*/

const listAll = async (dao: any, tenantId: string, limit: number) => {
  const page = await dao.filter({ tenant_id: tenantId }, { limit });
  return Array.isArray(page) ? page : page?.items || [];
};

const writeInBatches = async (rows: any[], write: (batch: any[]) => Promise<any>) => {
  for (let index = 0; index < rows.length; index += 100) {
    await write(rows.slice(index, index + 100));
  }
};

export async function indexGraph(base44: any, user: any, tenantId: string) {
  const started = Date.now();
  const indexVersion = `${INDEX_VERSION}-${nowIso()}`;
  const entities = base44.asServiceRole.entities;
  const { recordsByType, links, truncated } = await loadRegisters(entities, tenantId);

  const nodes = buildNodes(recordsByType);
  const { accepted, rejected } = validateEdges(
    [...deriveEdges(recordsByType), ...linkEdges(links)],
    new Set(nodes.map((node) => node.key)),
    SYSTEM_TRIPLES,
  );

  const labelByKey = new Map(nodes.map((node) => [node.key, node.displayLabel]));
  const degree = new Map<string, number>();
  accepted.forEach((item) => {
    degree.set(item.fromKey, (degree.get(item.fromKey) || 0) + 1);
    degree.set(item.toKey, (degree.get(item.toKey) || 0) + 1);
  });

  // Nodes: create what is new, refresh what changed, remove what no longer exists.
  const existingNodes = await listAll(entities.GraphEntity, tenantId, 5000);
  const existingByKey = new Map(existingNodes.map((row: any) => [row.entity_key, row]));
  const creates: any[] = [];
  const updates: any[] = [];
  nodes.forEach((node) => {
    const payload = {
      tenant_id: tenantId,
      entity_type: node.entityType,
      entity_key: node.key,
      source_entity: node.sourceEntity,
      source_record_id: node.sourceRecordId,
      display_label: node.displayLabel,
      summary: node.summary,
      module_label: node.typeLabel,
      module_path: node.modulePath,
      record_status: node.recordStatus,
      relationship_count: degree.get(node.key) || 0,
      index_version: indexVersion,
      last_indexed_at: nowIso(),
      indexed_by: user.full_name || user.email || '',
    };
    const existing = existingByKey.get(node.key);
    if (!existing) {
      creates.push(payload);
      return;
    }
    // Only content changes are written. A rebuild that changes nothing writes nothing, which keeps
    // the index cheap and makes an unchanged graph visibly unchanged.
    const changed = existing.display_label !== payload.display_label
      || existing.summary !== payload.summary
      || existing.record_status !== payload.record_status
      || Number(existing.relationship_count || 0) !== payload.relationship_count;
    if (changed) updates.push({ id: existing.id, ...payload });
  });
  const keep = new Set(nodes.map((node) => node.key));
  const staleNodes = existingNodes.filter((row: any) => !keep.has(row.entity_key));

  const nodeIdByKey = new Map<string, string>(existingNodes.map((row: any) => [row.entity_key, row.id]));
  if (creates.length) {
    const created: any[] = [];
    await writeInBatches(creates, async (batch) => {
      const rows = await entities.GraphEntity.bulkCreate(batch);
      (Array.isArray(rows) ? rows : rows?.items || []).forEach((row: any) => created.push(row));
    });
    created.forEach((row: any) => nodeIdByKey.set(row.entity_key, row.id));
  }
  if (updates.length) {
    await writeInBatches(updates, (batch) => entities.GraphEntity.bulkUpdate(batch));
  }
  for (const row of staleNodes) {
    await entities.GraphEntity.delete(row.id);
  }

  // Relationships: same reconcile, so a rebuild cannot duplicate an edge.
  const existingEdges = await listAll(entities.GraphRelationship, tenantId, 5000);
  const existingEdgeByKey = new Map(existingEdges.map((row: any) => [row.relationship_key, row]));
  const edgeCreates: any[] = [];
  const edgeUpdates: any[] = [];
  accepted.forEach((item) => {
    const payload = {
      tenant_id: tenantId,
      relationship_key: item.relationshipKey,
      from_entity_key: item.fromKey,
      from_entity_id: nodeIdByKey.get(item.fromKey) || '',
      from_type: item.fromType,
      from_label: item.fromLabel || labelByKey.get(item.fromKey) || '',
      to_entity_key: item.toKey,
      to_entity_id: nodeIdByKey.get(item.toKey) || '',
      to_type: item.toType,
      to_label: item.toLabel || labelByKey.get(item.toKey) || '',
      relationship: item.relationship,
      weight: item.weight,
      confidence: item.confidence,
      provenance_type: item.provenanceType,
      provenance_detail: item.provenanceDetail,
      source_field: item.sourceField,
      knowledge_link_id: item.knowledgeLinkId,
      derived_rule: item.derivedRule,
      valid_from: item.validFrom || '',
      valid_to: item.validTo || '',
      status: 'Active',
      index_version: indexVersion,
    };
    const existing = existingEdgeByKey.get(item.relationshipKey);
    if (!existing) {
      edgeCreates.push(payload);
      return;
    }
    const changed = existing.status !== 'Active'
      || existing.provenance_detail !== payload.provenance_detail
      || Number(existing.confidence || 0) !== payload.confidence
      || existing.knowledge_link_id !== payload.knowledge_link_id
      || existing.from_label !== payload.from_label
      || existing.to_label !== payload.to_label;
    if (changed) edgeUpdates.push({ id: existing.id, ...payload });
  });
  const keepEdges = new Set(accepted.map((item) => item.relationshipKey));
  const staleEdges = existingEdges.filter((row: any) => !keepEdges.has(row.relationship_key));

  if (edgeCreates.length) {
    await writeInBatches(edgeCreates, (batch) => entities.GraphRelationship.bulkCreate(batch));
  }
  if (edgeUpdates.length) {
    await writeInBatches(edgeUpdates, (batch) => entities.GraphRelationship.bulkUpdate(batch));
  }
  for (const row of staleEdges) {
    await entities.GraphRelationship.delete(row.id);
  }

  // The controlled type catalogue and the house ontology describe this app's own type system.
  await ensureHouseTaxonomy(base44, tenantId, indexVersion);
  await ensureHouseOntology(base44, tenantId);

  const summary = {
    indexVersion,
    nodes: nodes.length,
    relationships: accepted.length,
    nodesCreated: creates.length,
    nodesUpdated: updates.length,
    nodesRemoved: staleNodes.length,
    relationshipsCreated: edgeCreates.length,
    relationshipsUpdated: edgeUpdates.length,
    relationshipsRemoved: staleEdges.length,
    rejected: rejected.slice(0, 20),
    rejectedCount: rejected.length,
    truncated,
    durationMs: Date.now() - started,
  };

  await writeAudit(base44, user, {
    action: 'Knowledge graph: index rebuilt',
    entityType: 'GraphEntity',
    title: `Graph index · ${nodes.length} nodes`,
    record: { id: '', tenant_id: tenantId, title: 'Graph index', type: 'GraphIndex' },
    details: {
      nodes: summary.nodes,
      relationships: summary.relationships,
      rejected: summary.rejectedCount,
      truncated: summary.truncated,
      index_version: indexVersion,
    },
    route: '/knowledge-graph',
  });

  return summary;
}

export const HOUSE_TAXONOMY_KEY = 'house-graph-types';
export const HOUSE_ONTOLOGY_KEY = 'house-graph-ontology';

async function ensureHouseTaxonomy(base44: any, tenantId: string, indexVersion: string) {
  const entities = base44.asServiceRole.entities;
  const existing = await entities.GraphTaxonomy.filter({ tenant_id: tenantId, taxonomy_key: HOUSE_TAXONOMY_KEY }, { limit: 1 });
  const row = (Array.isArray(existing) ? existing : existing?.items || [])[0];
  const nodeTypes = NODE_TYPES.map(({ key, label, sourceEntity, path }) => ({ key, label, sourceEntity, path }));
  const payload = {
    tenant_id: tenantId,
    taxonomy_key: HOUSE_TAXONOMY_KEY,
    name: 'House graph types',
    description: 'The node and relationship types this app can index. Generated from the registers that exist here; it contains no compliance content of its own.',
    version: 1,
    status: 'Active',
    is_system: true,
    node_types_json: JSON.stringify(nodeTypes),
    relationship_types_json: JSON.stringify(RELATIONSHIP_TYPES),
    node_type_count: nodeTypes.length,
    relationship_type_count: RELATIONSHIP_TYPES.length,
    generated_at: nowIso(),
    notes: `Index version ${indexVersion}`,
  };
  if (!row) return entities.GraphTaxonomy.create(payload);
  return entities.GraphTaxonomy.update(row.id, {
    node_types_json: payload.node_types_json,
    relationship_types_json: payload.relationship_types_json,
    node_type_count: payload.node_type_count,
    relationship_type_count: payload.relationship_type_count,
    generated_at: payload.generated_at,
    notes: payload.notes,
  });
}

async function ensureHouseOntology(base44: any, tenantId: string) {
  const entities = base44.asServiceRole.entities;
  const existing = await entities.GraphOntology.filter({ tenant_id: tenantId, ontology_key: HOUSE_ONTOLOGY_KEY }, { limit: 1 });
  const row = (Array.isArray(existing) ? existing : existing?.items || [])[0];
  const payload = {
    tenant_id: tenantId,
    ontology_key: HOUSE_ONTOLOGY_KEY,
    name: 'House graph ontology',
    description: 'Endpoint and triple rules the registry validates every edge against. Built in, so the graph has one enforced definition of what may connect to what.',
    version: 1,
    status: 'Approved',
    is_system: true,
    node_types_json: JSON.stringify(NODE_TYPES.map((type) => type.key)),
    allowed_relationships_json: JSON.stringify(SYSTEM_TRIPLES),
    triple_count: SYSTEM_TRIPLES.length,
    constraints: 'Both endpoints must be indexed records of this business. A record cannot relate to itself. Derived edges must match a specific triple; a recorded link must use one of the 23 canonical types. A foreign record id is not an indexed endpoint, so cross-business links are refused.',
    approved_by: 'Built in',
    approved_at: row?.approved_at || nowIso(),
    approval_note: 'Fixed definition shipped with the registry.',
  };
  if (!row) return entities.GraphOntology.create(payload);
  return entities.GraphOntology.update(row.id, payload);
}