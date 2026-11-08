import React from 'react';

const ReportDocument = React.forwardRef(function ReportDocument({ report }, ref) {
  const value = (row, key) => {
    const item = row[key];
    if (item === undefined || item === null || item === '') return '—';
    return Array.isArray(item) ? item.join(', ') : String(item);
  };
  return (
    <article ref={ref} className="rounded-lg bg-white p-4 text-workspace-navy">
      <h1 className="text-lg font-bold">{report.title}</h1>
      <p className="mt-1 text-xs">Generated {report.generatedAt} · {report.records.length} records</p>
      <p className="mb-3 text-xs">Records visible to this account. They may include more than one organisation. Handle as confidential.</p>
      {report.records.length === 0 ? <p>No records were returned for this report.</p> : (
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <thead><tr>{report.columns.map(([, label]) => <th key={label} className="border border-border bg-muted p-2">{label}</th>)}</tr></thead>
          <tbody>{report.records.map((row, index) => <tr key={row.id || index}>{report.columns.map(([key]) => <td key={key} className="whitespace-pre-wrap break-words border border-border p-2 align-top">{value(row, key)}</td>)}</tr>)}</tbody>
        </table>
      )}
    </article>
  );
});
export default ReportDocument;