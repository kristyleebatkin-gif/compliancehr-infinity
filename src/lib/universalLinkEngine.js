import { base44 } from '@/api/base44Client';

// Every governance object type that must be linked, and the identifiers used to link it.
export const LINK_TYPES = [
  {
    key: 'policy',
    label: 'Policies',
    entity: 'Policy',
    query: {},
    path: '/documents',
    title: (r) => r.document_name || r.description,
    detail: (r) => r.category,
    date: (r) => r.review_date,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('document', r.document_name),
      idf('standard', r.category),
      ...topics(r.document_name, r.description),
    ],
  },
  {
    key: 'procedure',
    label: 'Procedures',
    entity: 'GovernanceObject',
    query: { lifecycle_stage: 'Procedure' },
    path: '/governance',
    title: (r) => r.title,
    detail: (r) => r.module,
    date: (r) => r.review_date,
    status: (r) => r.status,
    identifiers: (r) => [idf('document', r.object_code, r.title), ...topics(r.title)],
  },
  {
    key: 'record',
    label: 'Records',
    entity: 'GovernanceObject',
    query: { lifecycle_stage: 'Record' },
    path: '/governance',
    title: (r) => r.title,
    detail: (r) => r.module,
    date: (r) => r.review_date,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('document', r.object_code, r.title),
      idf('person', r.assigned_to_name),
      ...topics(r.title),
    ],
  },
  {
    key: 'controlled-document',
    label: 'Controlled documents',
    entity: 'DocumentControl',
    query: {},
    path: '/governance',
    title: (r) => r.title,
    detail: (r) => r.document_category,
    date: (r) => r.review_date,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('document', r.document_id, r.title),
      idf('standard', r.document_category),
      ...topics(r.title, r.change_summary),
    ],
  },
  {
    key: 'form',
    label: 'Forms',
    entity: 'FormTemplate',
    query: {},
    path: '/checklists',
    title: (r) => r.title,
    detail: (r) => r.category,
    date: () => null,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('document', r.title),
      idf('standard', r.category),
      ...topics(r.title, r.description),
    ],
  },
  {
    key: 'register',
    label: 'Register entries',
    entity: 'Register',
    query: {},
    path: '/registers',
    title: (r) => r.entry_title,
    detail: (r) => r.register_type,
    date: (r) => r.recorded_date,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('document', r.entry_id),
      idf('reference', r.linked_entity_id),
      idf('standard', r.register_type),
      ...topics(r.entry_title, r.description),
    ],
  },
  {
    key: 'risk',
    label: 'Risks',
    entity: 'Risk',
    query: {},
    path: '/risks',
    title: (r) => r.title,
    detail: (r) => r.category,
    date: (r) => r.review_date,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('participant', r.participant_id, r.participant_name),
      idf('document', r.risk_id),
      idf('document', r.document_number),
      idf('reference', r.source_entity_id),
      ...topics(r.title),
    ],
  },
  {
    key: 'incident',
    label: 'Incidents',
    entity: 'Incident',
    query: {},
    path: '/incidents',
    title: (r) => r.title,
    detail: (r) => r.category,
    date: (r) => r.date_occurred,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('participant', r.participant_id, r.participant_name),
      idf('person', r.staff_name),
      idf('document', r.incident_id),
      idf('document', r.document_number),
      idf('reference', r.source_entity_id),
      ...topics(r.title),
    ],
  },
  {
    key: 'complaint',
    label: 'Complaints',
    entity: 'Complaint',
    query: {},
    path: '/feedback',
    title: (r) => r.title,
    detail: (r) => r.category,
    date: (r) => r.date_received,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('participant', r.participant_id, r.complainant_name),
      idf('person', r.assigned_to),
      idf('document', r.complaint_id),
      idf('reference', r.source_entity_id),
      ...topics(r.title),
    ],
  },
  {
    key: 'training',
    label: 'Training items',
    entity: 'TrainingCompletion',
    query: {},
    path: '/training',
    title: (r) => r.module_title,
    detail: (r) => r.learner_name || r.employee_name,
    date: (r) => r.completed_date,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('person', r.employee_id, r.employee_name),
      idf('person', r.learner_id, r.learner_name),
      idf('document', r.certificate_number),
      ...topics(r.module_title),
    ],
  },
  {
    key: 'consent-participant',
    label: 'Participant consents',
    entity: 'InformationSharingConsent',
    query: {},
    path: '/our-participants',
    title: (r) => r.consent_type,
    detail: (r) => r.participant_name,
    date: (r) => r.consent_start_date,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('participant', r.participant_id, r.participant_name),
      idf('participant', r.participant_user_id, r.participant_name),
      idf('person', r.recipient_name),
    ],
  },
  {
    key: 'consent-employee',
    label: 'Employee consents',
    entity: 'EmployeeConsent',
    query: {},
    path: '/hr',
    title: (r) => r.consent_type,
    detail: (r) => r.employee_name,
    date: (r) => r.date_signed,
    status: (r) => r.status,
    identifiers: (r) => [
      idf('person', r.employee_id, r.employee_name),
      idf('person', r.employee_email, r.employee_name),
    ],
  },
  {
    key: 'acknowledgement',
    label: 'Acknowledgements',
    entity: 'DocumentAcknowledgement',
    query: {},
    path: '/documents',
    title: (r) => r.document_title,
    detail: (r) => r.acknowledged_by_name,
    date: (r) => r.acknowledged_at,
    status: () => 'Acknowledged',
    identifiers: (r) => [
      idf('document', r.document_id, r.document_title),
      idf('document', r.document_title),
      idf('person', r.acknowledged_by_user_id, r.acknowledged_by_name),
      idf('person', r.acknowledged_by_email, r.acknowledged_by_name),
    ],
  },
  {
    key: 'evidence',
    label: 'Audit evidence',
    entity: 'AuditEvidenceFile',
    query: {},
    path: '/compliance',
    title: (r) => r.title,
    detail: (r) => r.standard,
    date: (r) => r.uploaded_date,
    status: (r) => r.control,
    identifiers: (r) => [
      idf('standard', r.standard),
      idf('document', r.title),
      idf('person', r.uploaded_by),
      ...topics(r.title, r.control, r.notes),
    ],
  },
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'your', 'their', 'have', 'has', 'are', 'was',
  'were', 'will', 'shall', 'must', 'all', 'any', 'per', 'via', 'form', 'forms', 'policy', 'policies',
  'procedure', 'procedures', 'register', 'registers', 'record', 'records', 'template', 'document', 'documents',
  'plan', 'report', 'reports', 'review', 'management', 'other', 'none', 'not',
]);

function idf(kind, value, label) {
  if (value === null || value === undefined) return null;
  const clean = String(value).trim();
  if (!clean) return null;
  return { kind, value: clean.toLowerCase(), label: (label ? String(label).trim() : clean) };
}

// Topics are word pairs, so only a genuine shared subject links two objects.
function topics(...values) {
  const pairs = new Set();
  values.filter(Boolean).forEach((value) => {
    const words = String(value).toLowerCase().match(/[a-z0-9]{4,}/g) || [];
    const usable = words.filter((word) => !STOP_WORDS.has(word));
    for (let index = 0; index < usable.length - 1; index += 1) {
      pairs.add({ kind: 'topic', value: `${usable[index]} ${usable[index + 1]}`, label: `${usable[index]} ${usable[index + 1]}` });
    }
  });
  return [...pairs];
}

const KIND_PRIORITY = {
  reference: 6,
  participant: 5,
  person: 4,
  document: 3,
  standard: 2,
  topic: 1,
};

const KIND_REASON = {
  reference: () => 'Directly referenced record',
  participant: (label) => `Same participant: ${label}`,
  person: (label) => `Same person: ${label}`,
  document: (label) => `Same document reference: ${label}`,
  standard: (label) => `Same standard: ${label}`,
  topic: (label) => `Shared subject: ${label}`,
};

export function typeMeta(typeKey) {
  return LINK_TYPES.find((type) => type.key === typeKey) || LINK_TYPES[0];
}

export async function loadLinkUniverse(limit = 200) {
  const entries = await Promise.all(
    LINK_TYPES.map(async (type) => {
      const page = await base44.entities[type.entity]
        .filter(type.query || {}, { sort: '-updated_date', limit })
        .catch(() => ({ items: [] }));
      return [type.key, (page.items || []).map((record) => ({ ...record, __type: type.key }))];
    })
  );
  return Object.fromEntries(entries);
}

export function buildLinkIndex(recordsByType) {
  const byId = new Map();
  const groups = new Map();

  LINK_TYPES.forEach((type) => {
    (recordsByType[type.key] || []).forEach((record) => {
      const node = { id: `${type.key}:${record.id}`, type: type.key, record };
      byId.set(node.id, node);

      const identifiers = [...(type.identifiers(record) || []), { kind: 'target', value: record.id, label: '' }];
      identifiers.filter(Boolean).forEach((identifier) => {
        const bucket = identifier.kind === 'reference' || identifier.kind === 'target' ? 'reference' : identifier.kind;
        const token = `${bucket}|${identifier.value}`;
        if (!groups.has(token)) groups.set(token, { kind: bucket, label: identifier.label, nodes: [] });
        groups.get(token).nodes.push(node.id);
      });
    });
  });

  const links = new Map();

  groups.forEach(({ kind, label, nodes }) => {
    const unique = [...new Set(nodes)];
    if (unique.length < 2) return;
    if (kind === 'topic' && unique.length > 8) return;

    for (let first = 0; first < unique.length; first += 1) {
      for (let second = first + 1; second < unique.length; second += 1) {
        const a = byId.get(unique[first]);
        const b = byId.get(unique[second]);
        if (!a || !b) continue;

        const key = a.id < b.id ? `${a.id}~${b.id}` : `${b.id}~${a.id}`;
        const priority = KIND_PRIORITY[kind] || 0;
        const existing = links.get(key);
        const reason = KIND_REASON[kind] ? KIND_REASON[kind](label) : 'Linked';
        if (!existing) {
          links.set(key, { a: a.id, b: b.id, priority, reason, kinds: [kind] });
        } else {
          if (!existing.kinds.includes(kind)) existing.kinds.push(kind);
          if (priority > existing.priority) {
            existing.priority = priority;
            existing.reason = reason;
          }
        }
      }
    }
  });

  return { byId, links: [...links.values()] };
}

export function linkHealth(recordsByType, index) {
  const linked = new Set();
  index.links.forEach((link) => {
    linked.add(link.a);
    linked.add(link.b);
  });

  const rows = LINK_TYPES.map((type) => {
    const records = recordsByType[type.key] || [];
    const linkedCount = records.filter((record) => linked.has(`${type.key}:${record.id}`)).length;
    return {
      key: type.key,
      label: type.label,
      path: type.path,
      total: records.length,
      linked: linkedCount,
      orphans: records.length - linkedCount,
    };
  });

  const totals = rows.reduce(
    (accumulator, row) => ({
      total: accumulator.total + row.total,
      linked: accumulator.linked + row.linked,
      orphans: accumulator.orphans + row.orphans,
    }),
    { total: 0, linked: 0, orphans: 0 }
  );

  return { rows, totals };
}

export function linksFor(index, nodeId) {
  return index.links
    .filter((link) => link.a === nodeId || link.b === nodeId)
    .map((link) => {
      const otherId = link.a === nodeId ? link.b : link.a;
      return { node: index.byId.get(otherId), reason: link.reason, kinds: link.kinds };
    })
    .filter((entry) => entry.node);
}