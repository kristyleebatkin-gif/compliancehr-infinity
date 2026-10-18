/**
 * Small CSV export helper for register downloads.
 */
export function buildCsv(columns, rows) {
  const escape = (value) => {
    const text = value === undefined || value === null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    columns.map((c) => escape(c.label ?? c)).join(','),
    ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(',')),
  ].join('\n');
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