import React from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function TaskSummaryCards({ totals, metrics, loading }) {
  const counts = Object.fromEntries((totals || []).map((row) => [row.status, row.count]));
  const cards = [
    ['Open', counts.Open || 0, ListTodo, 'border-primary bg-gradient-to-br from-primary/75 to-primary/40 text-foreground'],
    ['In progress', counts['In Progress'] || 0, Clock, 'border-teal bg-gradient-to-br from-teal/75 to-teal/40 text-foreground'],
    ['Due today', metrics.dueToday, CalendarClock, 'border-warning bg-gradient-to-br from-warning/75 to-warning/40 text-foreground'],
    ['Overdue', metrics.overdue, AlertTriangle, 'border-danger bg-gradient-to-br from-danger/75 to-danger/40 text-foreground'],
    ['Completed', (counts.Completed || 0) + (counts.Finalised || 0), CheckCircle2, 'border-safe bg-gradient-to-br from-safe/75 to-safe/40 text-foreground'],
    ['Avg finish', metrics.averageMinutes ? `${metrics.averageMinutes}m` : '-', TrendingUp, 'border-chart-5 bg-gradient-to-br from-chart-5/75 to-chart-5/40 text-foreground'],
  ];
  return <div className="task-summary-grid grid grid-cols-3 gap-3 xl:grid-cols-6" aria-label="Task summaries">
    {cards.map(([label, count, Icon, tone]) => <div key={label} className={`task-summary-card min-w-0 rounded-xl border px-3 py-3 shadow-sm ${tone}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold"><Icon className="h-3 w-3 shrink-0" />{label}</div>
      <p className="task-summary-value mt-2 text-2xl font-bold leading-none">{loading ? '…' : count}</p>
    </div>)}
  </div>;
}