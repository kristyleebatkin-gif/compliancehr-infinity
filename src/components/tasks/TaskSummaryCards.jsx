import React from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function TaskSummaryCards({ totals, metrics, loading }) {
  const counts = Object.fromEntries((totals || []).map((row) => [row.status, row.count]));
  const cards = [
    ['Open', counts.Open || 0, ListTodo, 'border-primary/30 bg-gradient-to-br from-primary/25 to-primary/5 text-primary'],
    ['In progress', counts['In Progress'] || 0, Clock, 'border-teal/30 bg-gradient-to-br from-teal/25 to-teal/5 text-teal'],
    ['Due today', metrics.dueToday, CalendarClock, 'border-warning/30 bg-gradient-to-br from-warning/25 to-warning/5 text-warning'],
    ['Overdue', metrics.overdue, AlertTriangle, 'border-danger/30 bg-gradient-to-br from-danger/25 to-danger/5 text-danger'],
    ['Completed', (counts.Completed || 0) + (counts.Finalised || 0), CheckCircle2, 'border-safe/30 bg-gradient-to-br from-safe/25 to-safe/5 text-safe'],
    ['Avg finish', metrics.averageMinutes ? `${metrics.averageMinutes}m` : '-', TrendingUp, 'border-accent-foreground/30 bg-gradient-to-br from-accent-foreground/25 to-accent text-accent-foreground'],
  ];
  return <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6" aria-label="Task summaries">
    {cards.map(([label, count, Icon, tone]) => <div key={label} className={`min-w-0 rounded-lg border px-2 py-1.5 ${tone}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold"><Icon className="h-3 w-3 shrink-0" />{label}</div>
      <p className="mt-1 text-lg font-bold leading-none">{loading ? '…' : count}</p>
    </div>)}
  </div>;
}