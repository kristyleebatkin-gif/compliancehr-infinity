import React from 'react';

export default function ParticipantRecordDetails({ record }) {
  let model = {};
  try { model = JSON.parse(record.answers || record.data || '{}'); } catch { model = { Content: record.answers || record.data }; }
  const answers = model.answers || model;
  const rows = model.tableRows || answers.__rows || [];
  return <div className="space-y-3 text-sm">
    {record.notes && <p className="whitespace-pre-wrap break-words">{record.notes}</p>}
    <dl className="space-y-2">{Object.entries(answers).filter(([key]) => !['__rows', 'signature', 'confirmed', 'tableRows'].includes(key)).map(([key, value]) => <div key={key}>
      <dt className="font-semibold">{key}</dt><dd className="whitespace-pre-wrap break-words text-muted-foreground">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')}</dd>
    </div>)}</dl>
    {rows.length > 0 && <div className="overflow-x-auto"><table className="w-full text-xs"><tbody>{rows.map((row, i) => <tr key={i}>{(Array.isArray(row) ? row : Object.values(row)).map((value, j) => <td key={j} className="border p-2 align-top whitespace-pre-wrap">{String(value ?? '')}</td>)}</tr>)}</tbody></table></div>}
    {record.review_notes && <p className="whitespace-pre-wrap">Review: {record.review_notes}</p>}
  </div>;
}