import React from 'react';
import { Button } from '@/components/ui/button';

export default function TakeFiveRecords({ items, onEdit }) {
  return <details className="rounded-xl border border-border bg-card p-3"><summary className="cursor-pointer text-sm font-semibold">View assessment records</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm">
    <thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="px-3 py-2">Task</th><th className="px-3 py-2">Worker</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Risk</th><th className="px-3 py-2">Safe to proceed</th>{onEdit && <th className="px-3 py-2">Response</th>}</tr></thead>
    <tbody>{items.map((item) => <tr key={item.id} className="border-b border-border/40"><td className="px-3 py-2.5 font-medium">{item.task}</td><td className="px-3 py-2.5">{item.worker_name || '—'}</td><td className="px-3 py-2.5">{item.assessment_date}</td><td className="px-3 py-2.5">{item.risk_rating}</td><td className="px-3 py-2.5">{item.safe_to_proceed ? 'Yes' : 'No'}</td>{onEdit && <td className="px-3 py-2.5"><Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>Edit responses</Button></td>}</tr>)}</tbody>
  </table></div></details>;
}