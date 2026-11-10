import { base44 } from '@/api/base44Client';

const NS = 'cs-today-studio-v1';
const MIGRATION_FLAG = `${NS}:app-migration-v1`;
const ENTITY = 'StudioItem';
export const RETENTION_YEARS = 7;

export function retentionUntil() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + RETENTION_YEARS);
  return date.toISOString().slice(0, 10);
}

const parsePayload = (raw) => {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const toStudioItem = (record = {}) => ({
  id: record.id,
  kind: record.kind,
  title: record.title || '',
  payload: parsePayload(record.payload),
  fileUri: record.file_uri || '',
  fileName: record.file_name || '',
  retentionUntil: record.retention_until || '',
  updated: record.updated_date || record.created_date || ''
});

export const itemWhen = (item) => item.payload?.savedAt || item.updated;

export async function listStudioItems(kind) {
  const page = await base44.entities[ENTITY].filter({ kind }, { sort: '-updated_date', limit: 200 });
  return (page?.items || []).map(toStudioItem);
}

export async function createStudioItem(kind, title, payload, extra = {}) {
  const record = await base44.entities[ENTITY].create({
    kind,
    title: String(title || 'Untitled').slice(0, 200),
    payload: JSON.stringify(payload || {}),
    retention_until: retentionUntil(),
    ...extra
  });
  return toStudioItem(record);
}

export async function updateStudioItem(id, { title, payload }) {
  const data = { payload: JSON.stringify(payload || {}) };
  if (title !== undefined) data.title = String(title || 'Untitled').slice(0, 200);
  return toStudioItem(await base44.entities[ENTITY].update(id, data));
}

export async function deleteStudioItem(id) {
  await base44.entities[ENTITY].delete(id);
}

const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${NS}:${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const stamp = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

function localJobs() {
  const jobs = [];

  readLocal('designs', []).forEach((design) => {
    if (!design?.id) return;
    const fields = design.fields || {};
    jobs.push({
      kind: 'design',
      title: fields.headline || 'Design',
      sourceId: `design:${design.id}`,
      payload: {
        templateId: design.templateId,
        paletteId: design.paletteId,
        layout: design.layout,
        fields,
        savedAt: stamp(design.updated)
      }
    });
  });

  readLocal('docs', []).forEach((doc) => {
    if (!doc?.id) return;
    jobs.push({
      kind: 'document',
      title: doc.title || 'Untitled document',
      sourceId: `document:${doc.id}`,
      payload: { html: doc.html || '', savedAt: stamp(doc.updated) }
    });
  });

  readLocal('meetings', []).forEach((meeting) => {
    if (!meeting?.id) return;
    jobs.push({
      kind: 'meeting',
      title: meeting.title || 'Untitled meeting',
      sourceId: `meeting:${meeting.id}`,
      payload: {
        duration: meeting.duration || 0,
        transcript: meeting.transcript || '',
        summary: meeting.summary || null,
        savedAt: stamp(meeting.when)
      }
    });
  });

  readLocal('assistant', []).forEach((thread) => {
    if (!thread?.id) return;
    jobs.push({
      kind: 'assistant',
      title: thread.title || String(thread.messages?.[0]?.content || 'Assistant chat').slice(0, 60),
      sourceId: `assistant:${thread.id}`,
      payload: { messages: thread.messages || [], savedAt: stamp(thread.updated) }
    });
  });

  const notes = readLocal('crm-notes', {});
  Object.entries(notes || {}).forEach(([leadId, note]) => {
    if (!leadId || !String(note || '').trim()) return;
    jobs.push({
      kind: 'crm_note',
      title: String(note).slice(0, 60),
      sourceId: `crm:${leadId}`,
      payload: { leadId, note, savedAt: new Date().toISOString() }
    });
  });

  return jobs;
}

/**
 * Moves anything this browser saved before the app database was used into StudioItem.
 * Safe to run on every open: the browser flag stops repeats and migrated_source_id
 * stops duplicates if a move was interrupted.
 */
export async function migrateLocalStudio() {
  if (typeof localStorage === 'undefined') return { moved: 0 };

  const jobs = localJobs();
  let moved = 0;

  if (jobs.length) {
    const existing = await base44.entities[ENTITY].filter({ migrated_source_id: { $exists: true } }, { limit: 500 });
    const already = new Set((existing?.items || []).map((record) => record.migrated_source_id));
    const fresh = jobs.filter((job) => !already.has(job.sourceId));
    if (fresh.length) {
      await base44.entities[ENTITY].bulkCreate(
        fresh.map((job) => ({
          kind: job.kind,
          title: String(job.title || 'Untitled').slice(0, 200),
          payload: JSON.stringify(job.payload),
          retention_until: retentionUntil(),
          migrated_source_id: job.sourceId
        }))
      );
      moved = fresh.length;
    }
  }

  ['designs', 'docs', 'meetings', 'assistant', 'crm-notes'].forEach((key) => {
    try {
      localStorage.removeItem(`${NS}:${key}`);
    } catch {
      /* nothing else to do */
    }
  });
  try {
    localStorage.setItem(MIGRATION_FLAG, 'done');
  } catch {
    /* storage blocked — the app copy is still saved */
  }

  return { moved };
}