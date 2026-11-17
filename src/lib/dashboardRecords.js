// Complete, bounded reads for dashboard calculations. Samples must not imply totals.
export async function readDashboardCollection(fetchPage, { pageSize = 200, maxPages = 10 } = {}) {
  try {
    const items = [], ids = new Set(), cursors = new Set();
    let cursor;
    for (let page = 0; page < maxPages; page += 1) {
      const result = await fetchPage({ limit: pageSize, ...(cursor ? { cursor } : {}) });
      const rows = Array.isArray(result) ? result : result?.items;
      if (!Array.isArray(rows)) throw new Error('Unexpected data response.');
      for (const row of rows) {
        if (!row || typeof row.id !== 'string' || !row.id || ids.has(row.id)) throw new Error('Duplicate or invalid dashboard records; refresh required.');
        ids.add(row.id); items.push(row);
      }
      const next = !Array.isArray(result) && result.next_cursor;
      if (next) {
        if (typeof next !== 'string' || !rows.length || cursors.has(next) || result.has_more === false) throw new Error('Invalid dashboard pagination.');
        cursors.add(next); cursor = next; continue;
      }
      if (result?.has_more === true || (rows.length >= pageSize && result?.has_more !== false)) throw new Error('The full dashboard dataset could not be confirmed. Open the register or retry.');
      return { items, error: null };
    }
    throw new Error('Dashboard record limit reached. Open the register to review all records.');
  } catch (error) {
    return { items: [], error: error?.message || 'Unable to load dashboard records.' };
  }
}
