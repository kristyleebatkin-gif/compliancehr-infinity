import { base44 } from '@/api/base44Client';

const PAGE_LIMIT = 500;

/** The 23 relationship types from the enterprise knowledge graph specification. */
export const RELATIONSHIPS = [
  'HAS_STANDARD', 'HAS_OBLIGATION', 'HAS_REQUIREMENT', 'REQUIRES', 'REFERENCES',
  'IMPLEMENTED_BY', 'SUPPORTED_BY', 'LINKED_TO', 'MITIGATED_BY', 'PRODUCES', 'GENERATES',
  'CREATES', 'ASSIGNED_TO', 'EVIDENCES', 'AUDITED_BY', 'VALIDATED_BY', 'APPROVED_BY',
  'REPORTS_TO', 'MANAGED_BY', 'GOVERNS', 'MONITORED_BY', 'OWNED_BY', 'RELATES_TO',
];

/** The canonical compliance traceability chain. */
export const DNA_STAGES = [
  { key: 'regulation', label: 'Regulation' },
  { key: 'standard', label: 'Standard' },
  { key: 'obligation', label: 'Obligation' },
  { key: 'requirement', label: 'Requirement' },
  { key: 'control', label: 'Control' },
  { key: 'policy', label: 'Policy' },
  { key: 'procedure', label: 'Procedure' },
  { key: 'form', label: 'Form' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'audit', label: 'Audit' },
  { key: 'finding', label: 'Finding' },
  { key: 'capa', label: 'Corrective action' },
  { key: 'risk', label: 'Risk' },
  { key: 'outcome', label: 'Outcome' },
];

const text = (value) => String(value ?? '').trim();

/**
 * Every object type the graph can hold. Only registers that exist in this app are
 * listed — a type that is not here has no records to trace yet.
 */
export const NODE_TYPES = [
  {
    key: 'standard', label: 'Standard', entity: 'RegulatoryStandard', path: '/evidence',
    title: (r) => [r.standard_code, r.standard_title].filter(Boolean).join(' · ') || 'Untitled standard',
    detail: (r) => [r.framework, r.module_area].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'control', label: 'Control', entity: 'ComplianceControl', path: '/evidence',
    title: (r) => text(r.control_statement).slice(0, 120) || 'Untitled control',
    detail: (r) => [r.standard_code, r.framework, r.owner].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'evidence', label: 'Evidence', entity: 'AssuranceEvidence', path: '/evidence',
    title: (r) => r.title || 'Untitled evidence',
    detail: (r) => [r.standard_code, r.evidence_type].filter(Boolean).join(' · '),
    status: (r) => r.verification_status,
  },
  {
    key: 'finding', label: 'Finding', entity: 'AssuranceFinding', path: '/evidence',
    title: (r) => r.title || 'Untitled finding',
    detail: (r) => [r.standard_code, r.rating].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'policy', label: 'Policy', entity: 'Policy', path: '/documents',
    title: (r) => r.document_name || 'Untitled policy',
    detail: (r) => [r.category, r.version].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'form', label: 'Form', entity: 'FormTemplate', path: '/checklists',
    title: (r) => r.title || 'Untitled form',
    detail: (r) => [r.category, r.version].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'audit', label: 'Audit', entity: 'InternalAudit', path: '/compliance',
    title: (r) => [r.audit_id, r.register_audited].filter(Boolean).join(' · ') || r.audit_category || 'Untitled audit',
    detail: (r) => [r.framework_standard, r.risk_rating].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'capa', label: 'Corrective action', entity: 'ImprovementAction', path: '/quality',
    title: (r) => [r.improvement_id, r.title].filter(Boolean).join(' · ') || 'Untitled action',
    detail: (r) => [r.area_department, r.priority].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'risk', label: 'Risk', entity: 'Risk', path: '/risks',
    title: (r) => r.title || 'Untitled risk',
    detail: (r) => [r.risk_id, r.category, r.rating].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'issue', label: 'Compliance issue', entity: 'ComplianceIssue', path: '/compliance',
    title: (r) => [r.issue_id, r.title].filter(Boolean).join(' · ') || 'Untitled issue',
    detail: (r) => [r.category, r.priority].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
  {
    key: 'recommendation', label: 'AI recommendation', entity: 'AiRecommendation', path: '/ai-os',
    title: (r) => r.title || 'Untitled recommendation',
    detail: (r) => [r.agent_name, r.module].filter(Boolean).join(' · '),
    status: (r) => r.status,
  },
];

export const typeMeta = (key) => NODE_TYPES.find((type) => type.key === key) || NODE_TYPES[0];
export const nodeKey = (typeKey, id) => `${typeKey}:${id}`;

const ENTITY_TO_TYPE = {
  RegulatoryStandard: 'standard', ComplianceControl: 'control', AssuranceEvidence: 'evidence',
  AssuranceFinding: 'finding', Policy: 'policy', FormTemplate: 'form', InternalAudit: 'audit',
  ImprovementAction: 'capa', Risk: 'risk', ComplianceIssue: 'issue', AiRecommendation: 'recommendation',
};

const norm = (value) => text(value).toLowerCase();
const normCode = (value) => text(value).toUpperCase();
const codeList = (value) =>
  text(value).split(/[,;|\n]+/).map((entry) => normCode(entry)).filter((entry) => entry.length > 1);

/** Load every register the graph covers, plus any recorded links. */
export async function loadGraphUniverse() {
  const [entries, links] = await Promise.all([
    Promise.all(
      NODE_TYPES.map(async (type) => {
        const page = await base44.entities[type.entity]
          .filter({}, { limit: PAGE_LIMIT })
          .catch(() => ({ items: [] }));
        return [type.key, page.items || []];
      })
    ),
    base44.entities.KnowledgeLink.filter({ status: 'Active' }, { limit: 500 }).catch(() => ({ items: [] })),
  ]);
  return {
    recordsByType: Object.fromEntries(entries),
    links: links.items || [],
    linkError: !Array.isArray(links.items),
  };
}

const edge = (fromType, fromId, toType, toId, relationship, label, confidence) => ({
  id: `${fromType}:${fromId}->${toType}:${toId}:${relationship}`,
  from: nodeKey(fromType, fromId),
  to: nodeKey(toType, toId),
  relationship,
  label,
  confidence,
  source: 'Derived',
});

function deriveEdges(recordsByType) {
  const edges = [];
  const standards = recordsByType.standard || [];
  const controls = recordsByType.control || [];
  const policies = recordsByType.policy || [];

  const standardById = new Map(standards.map((row) => [row.id, row]));
  const standardsByCode = new Map();
  standards.forEach((row) => {
    const code = normCode(row.standard_code);
    if (code) standardsByCode.set(code, [...(standardsByCode.get(code) || []), row]);
  });
  const controlsByCode = new Map();
  controls.forEach((row) => {
    const code = normCode(row.standard_code);
    if (code) controlsByCode.set(code, [...(controlsByCode.get(code) || []), row]);
  });

  controls.forEach((control) => {
    const standard = (control.standard_id && standardById.get(control.standard_id))
      || (standardsByCode.get(normCode(control.standard_code)) || [])[0];
    if (standard) {
      edges.push(edge('control', control.id, 'standard', standard.id, 'IMPLEMENTED_BY', 'Implements this standard', 100));
    }
    const reference = norm(control.policy_reference);
    if (reference.length < 4) return;
    policies.forEach((policy) => {
      const name = norm(policy.document_name);
      if (name.length > 4 && (reference.includes(name) || name.includes(reference))) {
        edges.push(edge('control', control.id, 'policy', policy.id, 'REFERENCES', 'Names this policy', 70));
      }
    });
  });

  const controlIds = new Set(controls.map((row) => row.id));
  (recordsByType.evidence || []).forEach((row) => {
    if (controlIds.has(row.control_id)) {
      edges.push(edge('evidence', row.id, 'control', row.control_id, 'EVIDENCES', 'Evidences this control', 100));
    }
  });
  (recordsByType.finding || []).forEach((row) => {
    if (controlIds.has(row.control_id)) {
      edges.push(edge('finding', row.id, 'control', row.control_id, 'RELATES_TO', 'Raised against this control', 100));
    }
    if (row.evidence_id) {
      edges.push(edge('finding', row.id, 'evidence', row.evidence_id, 'VALIDATED_BY', 'References this evidence', 90));
    }
  });

  (recordsByType.audit || []).forEach((audit) => {
    const scope = text(audit.framework_standard).toUpperCase();
    if (scope.length < 2) return;
    (standardsByCode.get(scope) || []).forEach((standard) => {
      edges.push(edge('audit', audit.id, 'standard', standard.id, 'AUDITED_BY', 'Audits this standard', 80));
    });
    if (audit.linked_improvement_action_id) {
      edges.push(edge('audit', audit.id, 'capa', audit.linked_improvement_action_id, 'CREATES', 'Creates this corrective action', 100));
    }
  });

  (recordsByType.capa || []).forEach((capa) => {
    const targetType = ENTITY_TO_TYPE[capa.linked_entity_type];
    if (targetType && capa.linked_entity_id) {
      edges.push(edge('capa', capa.id, targetType, capa.linked_entity_id, 'LINKED_TO', 'Linked to this record', 100));
    }
  });

  (recordsByType.risk || []).forEach((risk) => {
    const named = normCode(risk.aged_care_standard);
    const standard = named && (standardsByCode.get(named) || [])[0];
    if (standard) {
      edges.push(edge('risk', risk.id, 'standard', standard.id, 'RELATES_TO', 'Names this standard', 60));
    }
    const sourceType = ENTITY_TO_TYPE[risk.source_entity_type];
    if (sourceType && risk.source_entity_id) {
      edges.push(edge('risk', risk.id, sourceType, risk.source_entity_id, 'LINKED_TO', 'Raised from this record', 90));
    }
  });

  (recordsByType.recommendation || []).forEach((recommendation) => {
    codeList(recommendation.standard_refs).forEach((code) => {
      (standardsByCode.get(code) || []).slice(0, 1).forEach((standard) => {
        edges.push(edge('recommendation', recommendation.id, 'standard', standard.id, 'REFERENCES', 'References this standard', 90));
      });
    });
    codeList(recommendation.control_refs).forEach((code) => {
      (controlsByCode.get(code) || []).slice(0, 1).forEach((control) => {
        edges.push(edge('recommendation', recommendation.id, 'control', control.id, 'REFERENCES', 'References this control', 90));
      });
    });
  });

  return edges;
}

function recordedEdges(linkRows) {
  return linkRows.map((row) => ({
    id: `link:${row.id}`,
    from: nodeKey(row.from_type, row.from_id),
    to: nodeKey(row.to_type, row.to_id),
    relationship: row.relationship || 'RELATES_TO',
    label: row.relationship || 'RELATES_TO',
    confidence: Number(row.confidence ?? 100),
    source: row.source || 'Recorded by hand',
    record: row,
  }));
}

/** Build nodes, edges and an adjacency index from the loaded registers. */
export function buildGraph(recordsByType = {}, linkRows = []) {
  const nodes = new Map();
  NODE_TYPES.forEach((type) => {
    (recordsByType[type.key] || []).forEach((record) => {
      nodes.set(nodeKey(type.key, record.id), {
        id: nodeKey(type.key, record.id),
        typeKey: type.key,
        typeLabel: type.label,
        path: type.path,
        record,
        title: type.title(record) || 'Untitled record',
        detail: type.detail ? type.detail(record) : '',
        status: type.status ? type.status(record) : '',
      });
    });
  });

  const all = [...deriveEdges(recordsByType), ...recordedEdges(linkRows)]
    .filter((entry) => nodes.has(entry.from) && nodes.has(entry.to));

  const adjacency = new Map();
  all.forEach((entry) => {
    const push = (fromId, toId, direction) => {
      const list = adjacency.get(fromId) || [];
      list.push({ ...entry, node: toId, direction });
      adjacency.set(fromId, list);
    };
    push(entry.from, entry.to, 'out');
    push(entry.to, entry.from, 'in');
  });

  return { nodes, edges: all, adjacency };
}

export function neighbours(graph, id) {
  return (graph.adjacency.get(id) || [])
    .map((entry) => ({ ...(graph.nodes.get(entry.node) || {}), relationship: entry.relationship, relationshipLabel: entry.label, confidence: entry.confidence, direction: entry.direction, source: entry.source }))
    .filter((entry) => entry.id);
}

const neighboursOfType = (graph, id, typeKey) =>
  neighbours(graph, id).filter((entry) => entry.typeKey === typeKey);

const uniqueByType = (list) => {
  const seen = new Map();
  list.forEach((entry) => seen.set(entry.id, entry));
  return [...seen.values()];
};

const stage = (key, status, detail, count) => {
  const label = (DNA_STAGES.find((entry) => entry.key === key) || {}).label || key;
  return { key, label, status, detail, count: count || 0 };
};

/** Walk the 14-stage chain for one standard, using real links only. */
export function traceStandard(graph, standardNodeId) {
  const node = graph.nodes.get(standardNodeId);
  if (!node) return { stages: [], resolved: 0, total: DNA_STAGES.length, percent: 0, breaks: [] };
  const standard = node.record;

  const controls = neighboursOfType(graph, standardNodeId, 'control');
  const controlIds = controls.map((entry) => entry.id);
  const policies = uniqueByType(controlIds.flatMap((id) => neighboursOfType(graph, id, 'policy')));
  const forms = uniqueByType(controlIds.flatMap((id) => neighboursOfType(graph, id, 'form')));
  const evidence = uniqueByType(controlIds.flatMap((id) => neighboursOfType(graph, id, 'evidence')));
  const findings = uniqueByType(controlIds.flatMap((id) => neighboursOfType(graph, id, 'finding')));
  const audits = neighboursOfType(graph, standardNodeId, 'audit');
  const capas = uniqueByType([
    ...findings.flatMap((entry) => neighboursOfType(graph, entry.id, 'capa')),
    ...audits.flatMap((entry) => neighboursOfType(graph, entry.id, 'capa')),
  ]);
  const risks = neighboursOfType(graph, standardNodeId, 'risk');

  const controlRecords = controls.map((entry) => entry.record);
  const has = (field) => controlRecords.some((record) => text(record[field]));

  const stages = [
    stage('regulation', text(standard.legislation) ? 'declared' : 'break',
      text(standard.legislation) || 'No legislation is named on this standard.'),
    stage('standard', 'linked', `${text(standard.standard_code)} · ${text(standard.standard_title)}`, 1),
    stage('obligation', has('obligation') ? 'declared' : 'break',
      has('obligation') ? 'Stated on the control.' : 'No control states the obligation it carries.'),
    stage('requirement', has('requirement') ? 'declared' : 'break',
      has('requirement') ? 'Stated on the control.' : 'No control states the requirement.'),
    stage('control', controls.length ? 'linked' : 'break',
      controls.length ? `${controls.length} control${controls.length === 1 ? '' : 's'} linked` : 'No control is linked to this standard.', controls.length),
    stage('policy', policies.length ? 'linked' : has('policy_reference') ? 'declared' : 'break',
      policies.length ? `${policies.length} policy record${policies.length === 1 ? '' : 's'} linked`
        : has('policy_reference') ? 'A policy is named on the control but no policy record matched it.'
          : 'No policy is linked or named for these controls.', policies.length),
    stage('procedure', has('procedure_reference') ? 'declared' : 'break',
      has('procedure_reference') ? 'Declared on the control; there is no procedure register to link to.' : 'No procedure reference is declared.'),
    stage('form', forms.length ? 'linked' : 'break',
      forms.length ? `${forms.length} form${forms.length === 1 ? '' : 's'} linked` : 'No form is connected to these controls.', forms.length),
    stage('evidence', evidence.length ? 'linked' : 'break',
      evidence.length ? `${evidence.length} evidence record${evidence.length === 1 ? '' : 's'} collected` : 'No evidence supports these controls.', evidence.length),
    stage('audit', audits.length ? 'linked' : 'break',
      audits.length ? `${audits.length} audit${audits.length === 1 ? '' : 's'} covered this standard` : 'No audit has covered this standard.', audits.length),
    stage('finding', findings.length ? 'linked' : 'break',
      findings.length ? `${findings.length} finding${findings.length === 1 ? '' : 's'} raised` : 'No finding is recorded against these controls.', findings.length),
    stage('capa', capas.length ? 'linked' : 'break',
      capas.length ? `${capas.length} corrective action${capas.length === 1 ? '' : 's'} linked` : 'No corrective action traces back to this standard.', capas.length),
    stage('risk', risks.length ? 'linked' : 'break',
      risks.length ? `${risks.length} risk record${risks.length === 1 ? '' : 's'} linked` : 'No risk record names or links this standard.', risks.length),
    stage('outcome', text(standard.outcome) ? 'declared' : 'break',
      text(standard.outcome) || 'No outcome is stated for this standard.'),
  ];

  const resolved = stages.filter((entry) => entry.status !== 'break').length;
  return {
    stages,
    resolved,
    total: stages.length,
    percent: Math.round((resolved / stages.length) * 100),
    breaks: stages.filter((entry) => entry.status === 'break'),
  };
}

/** Per-stage coverage across the whole tenant. */
export function dnaCoverage(recordsByType = {}, graph) {
  const standards = recordsByType.standard || [];
  const controls = recordsByType.control || [];
  const linked = (typeKey) => {
    let count = 0;
    graph.nodes.forEach((node) => {
      if (node.typeKey === typeKey && (graph.adjacency.get(node.id) || []).length) count += 1;
    });
    return count;
  };
  const hasText = (field) => controls.filter((row) => text(row[field])).length;

  const rows = [
    { key: 'regulation', label: 'Regulation', kind: 'declared', total: standards.length, covered: standards.filter((row) => text(row.legislation)).length, note: 'Standards that name their legislation' },
    { key: 'standard', label: 'Standard', kind: 'live', total: standards.length, covered: standards.filter((row) => text(row.standard_code)).length, note: 'Standards in the register' },
    { key: 'obligation', label: 'Obligation', kind: 'declared', total: controls.length, covered: hasText('obligation'), note: 'Controls that state their obligation' },
    { key: 'requirement', label: 'Requirement', kind: 'declared', total: controls.length, covered: hasText('requirement'), note: 'Controls that state their requirement' },
    { key: 'control', label: 'Control', kind: 'live', total: controls.length, covered: linked('control'), note: 'Controls linked to a standard' },
    { key: 'policy', label: 'Policy', kind: 'live', total: (recordsByType.policy || []).length, covered: linked('policy'), note: 'Policies connected to a control' },
    { key: 'procedure', label: 'Procedure', kind: 'declared', total: controls.length, covered: hasText('procedure_reference'), note: 'Controls that declare a procedure' },
    { key: 'form', label: 'Form', kind: 'live', total: (recordsByType.form || []).length, covered: linked('form'), note: 'Forms connected to the chain' },
    { key: 'evidence', label: 'Evidence', kind: 'live', total: (recordsByType.evidence || []).length, covered: linked('evidence'), note: 'Evidence supporting a control' },
    { key: 'audit', label: 'Audit', kind: 'live', total: (recordsByType.audit || []).length, covered: linked('audit'), note: 'Audits tracing to a standard' },
    { key: 'finding', label: 'Finding', kind: 'live', total: (recordsByType.finding || []).length, covered: linked('finding'), note: 'Findings traced to a control' },
    { key: 'capa', label: 'Corrective action', kind: 'live', total: (recordsByType.capa || []).length, covered: linked('capa'), note: 'Corrective actions linked to their source' },
    { key: 'risk', label: 'Risk', kind: 'live', total: (recordsByType.risk || []).length, covered: linked('risk'), note: 'Risks traced to a standard' },
    { key: 'outcome', label: 'Outcome', kind: 'declared', total: standards.length, covered: standards.filter((row) => text(row.outcome)).length, note: 'Standards that state their outcome' },
  ];

  return rows.map((row) => ({
    ...row,
    percent: row.total ? Math.round((row.covered / row.total) * 100) : 0,
    status: row.total === 0 ? 'empty' : row.covered === 0 ? 'gap' : row.covered === row.total ? 'complete' : 'partial',
  }));
}

/** Headline numbers for the graph, all derived from what is actually stored. */
export function graphHealth(graph, recordsByType = {}, traces = []) {
  let orphanCount = 0;
  graph.nodes.forEach((node) => {
    if (!(graph.adjacency.get(node.id) || []).length) orphanCount += 1;
  });

  const byType = NODE_TYPES.map((type) => {
    const nodes = [...graph.nodes.values()].filter((node) => node.typeKey === type.key);
    return {
      key: type.key,
      label: type.label,
      path: type.path,
      count: nodes.length,
      linked: nodes.filter((node) => (graph.adjacency.get(node.id) || []).length > 0).length,
    };
  });

  const completeChains = traces.filter((entry) => entry.trace.breaks.length === 0).length;
  const averageChain = traces.length
    ? Math.round(traces.reduce((sum, entry) => sum + entry.trace.percent, 0) / traces.length)
    : 0;

  return {
    nodeCount: graph.nodes.size,
    edgeCount: graph.edges.length,
    derivedCount: graph.edges.filter((entry) => entry.source === 'Derived').length,
    recordedCount: graph.edges.filter((entry) => entry.source !== 'Derived').length,
    relationshipsUsed: [...new Set(graph.edges.map((entry) => entry.relationship))].length,
    orphanCount,
    byType,
    standardCount: (recordsByType.standard || []).length,
    completeChains,
    averageChain,
  };
}