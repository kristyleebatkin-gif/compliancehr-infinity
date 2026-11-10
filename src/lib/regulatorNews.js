import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';

const CACHE_KEY = 'chr-regulator-posters';
const CACHE_MS = 45 * 60 * 1000;

export function readPosterCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.fetched_at || Date.now() - parsed.fetched_at > CACHE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function fetchRegulatorPosters() {
  let data;
  try {
    ({ data } = await base44.functions.invoke('regulatorNewsFeed', {}));
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || 'The regulator updates could not be loaded.');
  }
  if (data?.error) throw new Error(data.error);
  const posters = (data?.posters || [])
    .map((poster) => ({ ...poster, url: safeUrl(poster.url) }))
    .filter((poster) => poster.url);
  const payload = { posters, fetched_at: Date.now() };
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Caching is best-effort; a full storage quota must not block the posters.
  }
  return payload;
}