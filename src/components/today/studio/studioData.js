import { base44, getClientTenantContext } from '@/api/base44Client';
import { createStudioRepository } from './studioPersistence.js';
export { sanitizeStudioHtml } from './studioSecurity.js';

const repository = createStudioRepository(base44, getClientTenantContext);
export const itemWhen = (item) => item.payload?.savedAt || item.updated;
export const listStudioItems = (kind) => repository.list(kind);
export const createStudioItem = (kind, title, payload, extra) => repository.create(kind, title, payload, extra);
export const updateStudioItem = (id, data) => repository.update(id, data);
// Existing callers keep their API; removal archives the saved item, never hard deletes.
export const deleteStudioItem = (id) => repository.archive(id);

// Legacy device data has no trustworthy account/business attribution.
// Never upload, erase or mark it migrated automatically on opening a studio.
export async function migrateLocalStudio() { return { moved: 0, requiresReviewedImport: true }; }
