import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Timer } from 'lucide-react';

export default function TaskCompletionInsights({ tasks, avgMin, onOpen }) {
  const completed = tasks.filter((t) => ['Completed', 'Finalised'].includes(t.status));
  const timed = completed.filter((t) => Number(t.time_taken_minutes) > 0);
  const totalMin = timed.reduce((s, t) => s + Number(t.time_taken_minutes), 0);
  const fastest = [...timed].sort((a, b) => a.time_taken_minutes - b.time_taken_minutes)[0];
  return <Card className="task-overview-panel min-w-0 overflow-hidden" data-task-tone="pink"><CardContent className="task-overview-content">
    <h3 className="task-panel-heading"><span className="task-panel-icon"><Timer className="h-4 w-4" /></span>Completion insights</h3>
    <div className="space-y-2">{[['Done', completed.length], ['Avg time', avgMin ? `${avgMin} min` : '-'], ['Total time', totalMin ? `${Math.round(totalMin / 60)} h` : '-']].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-card/80 px-3 py-2 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-bold">{value}</span></div>)}</div>
    {fastest && <button type="button" className="mt-2 text-left text-xs font-semibold text-primary underline" onClick={() => onOpen(fastest)}>Edit fastest task: {fastest.title} ({fastest.time_taken_minutes} min)</button>}
  </CardContent></Card>;
}