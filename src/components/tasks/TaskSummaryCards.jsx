import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export default function TaskSummaryCards({ totals, loading }) {
  const counts = Object.fromEntries((totals || []).map((row) => [row.status, row.count]));
  const cards = [
    ['Open', counts.Open || 0, ListTodo, 'border-primary/20 bg-primary/5 text-primary'],
    ['In progress', counts['In Progress'] || 0, Clock, 'border-teal/20 bg-teal/5 text-teal'],
    ['Overdue', counts.Overdue || 0, AlertTriangle, 'border-danger/20 bg-danger/5 text-danger'],
    ['Completed', (counts.Completed || 0) + (counts.Finalised || 0), CheckCircle2, 'border-safe/20 bg-safe/5 text-safe'],
  ];
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Task summaries">
    {cards.map(([label, count, Icon, tone]) => <div key={label} className={`min-w-0 rounded-lg border px-2.5 py-2 ${tone}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold"><Icon className="h-3 w-3 shrink-0" />{label}</div>
      <p className="mt-1 text-lg font-bold leading-none">{loading ? '…' : count}</p>
    </div>)}
  </div>;
}