import { STUDIO_KINDS, studioScope, sameStudioScope, sanitizeStudioHtml } from './studioSecurity.js';

export function createStudioRepository(client, getContext) {
  const entity = () => client.entities.StudioItem;
  const scope = () => studioScope(getContext());
  const check = (expected) => {
    if (!sameStudioScope(expected, scope())) throw new Error('Your account or business changed. Reopen the studio.');
  };
  const rows = (page) => {
    const result = Array.isArray(page) ? page : page?.items;
    if (!Array.isArray(result)) throw new Error('Studio returned an invalid response. Please retry.');
    return result;
  };
  const decode = (record, expected) => {
    if (!record?.id || record.tenant_id !== expected.tenant_id || record.created_by_id !== expected.created_by_id) {
      throw new Error('A studio record was outside your personal business scope.');
    }
    let payload;
    try { payload = record.payload ? JSON.parse(record.payload) : {}; }
    catch { throw new Error('This saved studio item contains unreadable content.'); }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid saved studio content.');
    if (record.kind === 'document') payload.html = sanitizeStudioHtml(payload.html);
    return { id: record.id, kind: record.kind, title: record.title || '', payload,
      fileUri: record.file_uri || '', fileName: record.file_name || '',
      retentionUntil: record.retention_until || '', updated: record.updated_date || record.created_date || '' };
  };
  const encode = (payload) => {
    const value = { ...(payload || {}) };
    if ('html' in value) value.html = sanitizeStudioHtml(value.html);
    const result = JSON.stringify(value);
    if (result.length > 500000) throw new Error('This studio item is too large to save. Export it and reduce its size.');
    return result;
  };
  const find = async (id, expected) => {
    if (!id || typeof id !== 'string') throw new Error('A saved studio item is required.');
    const result = rows(await entity().filter({ ...expected, id, archived: false }, { limit: 2 }));
    check(expected);
    if (result.length !== 1) throw new Error('That studio item is unavailable or archived.');
    decode(result[0], expected);
    return result[0];
  };
  return {
    async list(kind) {
      if (!STUDIO_KINDS.includes(kind)) throw new Error('Unknown studio item type.');
      const expected = scope();
      const result = rows(await entity().filter({ ...expected, kind, archived: false }, { sort: '-updated_date', limit: 200 }));
      check(expected);
      if (result.length >= 200) throw new Error('The saved-item display limit was reached. A filtered view is required to show all items.');
      return result.map(record => decode(record, expected));
    },
    async create(kind, title, payload, extra = {}) {
      if (!STUDIO_KINDS.includes(kind)) throw new Error('Unknown studio item type.');
      const expected = scope();
      if (Object.keys(extra).some(key => !['file_uri', 'file_name'].includes(key))) throw new Error('Unsupported studio save fields.');
      const record = await entity().create({ ...expected, kind, title: String(title || 'Untitled').slice(0, 200),
        payload: encode(payload), archived: false, ...extra });
      check(expected);
      return decode(record, expected);
    },
    async update(id, { title, payload }) {
      const expected = scope();
      await find(id, expected);
      check(expected);
      const data = { payload: encode(payload) };
      if (title !== undefined) data.title = String(title || 'Untitled').slice(0, 200);
      const result = await entity().update(id, data);
      check(expected);
      return decode(result, expected);
    },
    async archive(id) {
      const expected = scope();
      await find(id, expected);
      check(expected);
      await entity().update(id, { archived: true });
      check(expected);
    }
  };
}
