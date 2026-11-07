import React from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function TaskSummaryCards({ totals, metrics, loading }) {
  const counts = Object.fromEntries((totals || []).map((row) => [row.status, row.count]));
  const cards = [
    ['Open', counts.Open || 0, ListTodo, 'border-[#0072FF] bg-white text-[#0A2B6D]'],
    ['In progress', counts['In Progress'] || 0, Clock, 'border-[#5A00D6] bg-white text-[#0A2B6D]'],
    ['Due today', metrics.dueToday, CalendarClock, 'border-[#00C6FF] bg-white text-[#0A2B6D]'],
    ['Overdue', metrics.overdue, AlertTriangle, 'border-[#FF2E9A] bg-white text-[#0A2B6D]'],
    ['Completed', (counts.Completed || 0) + (counts.Finalised || 0), CheckCircle2, 'border-[#0A2B6D] bg-white text-[#0A2B6D]'],
    ['Avg finish', metrics.averageMinutes ? `${metrics.averageMinutes}m` : '-', TrendingUp, 'border-[#5A00D6] bg-white text-[#0A2B6D]'],
  ];
  return <div className="task-summary-grid grid grid-cols-3 gap-3 xl:grid-cols-6" aria-label="Task summaries">
    {cards.map(([label, count, Icon, tone]) => <div key={label} className={`task-summary-card min-w-0 rounded-xl border px-3 py-3 shadow-sm ${tone}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold"><Icon className="h-3 w-3 shrink-0" />{label}</div>
      <p className="task-summary-value mt-2 text-2xl font-bold leading-none">{loading ? '…' : count}</p>
    </div>)}
  </div>;
}