/**
 * Small CSV export helper for register downloads.
 */
export function buildCsv(columns, rows) {
  const escape = (value) => {
    let text = value === undefined || value === null ? '' : String(value);
    // Spreadsheet applications execute formula-looking text even in quoted CSV.
    // Keep actual numeric values numeric, including negative amounts.
    if (typeof value === 'string' && (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text))) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    columns.map((c) => escape(c.label ?? c)).join(','),
    ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(',')),
  ].join('\n');
}

// Pulls every matching record across pages (cursor loop) so register exports
// are never silently capped at a fixed limit.
export async function fetchAllRecords(entity, query = {}, sort = '-created_date', pageSize = 500) {
  const rows = [];
  let cursor;
  const seenCursors = new Set();
  do {
    const page = await entity.filter(query, { sort, limit: pageSize, ...(cursor ? { cursor } : {}) });
    if (!page || !Array.isArray(page.items)) throw new Error('Invalid export page; no complete export was produced.');
    rows.push(...page.items);
    cursor = page.next_cursor;
    if (cursor) {
      if (typeof cursor !== 'string' || seenCursors.has(cursor)) throw new Error('Invalid or repeated export page cursor.');
      seenCursors.add(cursor);
    }
  } while (cursor);
  return rows;
}

export function downloadCsv(filename, columns, rows) {
  const csv = buildCsv(columns, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}