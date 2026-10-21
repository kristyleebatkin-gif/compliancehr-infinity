import React from 'react';
import TaskAssistantCard from '@/components/tasks/TaskAssistantCard';
import TaskOverviewPanel from '@/components/tasks/TaskOverviewPanel';
import TaskWorkloadStrip from '@/components/tasks/TaskWorkloadStrip';
import TaskCompletionInsights from '@/components/tasks/TaskCompletionInsights';
import { CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function TaskDashboard({ tasks, onOpen }) {
  const todayStr = today();
  const scheduledDate = (t) => t.due_date || t.task_date;
  const open = tasks.filter((t) => ['Pending', 'Open', 'In Progress', 'Overdue'].includes(t.status));
  const current = open.filter((t) => !scheduledDate(t) || scheduledDate(t) <= todayStr).sort((a, b) => (scheduledDate(a) || todayStr).localeCompare(scheduledDate(b) || todayStr));
  const future = open.filter((t) => scheduledDate(t) > todayStr).sort((a, b) => scheduledDate(a).localeCompare(scheduledDate(b)));
  const past = tasks.filter((t) => ['Completed', 'Finalised', 'Cancelled'].includes(t.status) || (scheduledDate(t) && scheduledDate(t) < todayStr));
  const timed = tasks.filter((t) => ['Completed', 'Finalised'].includes(t.status) && Number(t.time_taken_minutes) > 0);
  const avgMin = timed.length ? Math.round(timed.reduce((s, t) => s + Number(t.time_taken_minutes), 0) / timed.length) : 0;

  return (
    <div className="space-y-3">
      <TaskAssistantCard compact inline />
      <div className="task-overview-grid grid items-stretch gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <TaskOverviewPanel title="Current" icon={Clock} tone="primary" tasks={current} onOpen={onOpen} emptyText="No current tasks." />
        <TaskOverviewPanel title="Future" icon={CalendarClock} tone="teal" tasks={future} onOpen={onOpen} emptyText="No future tasks scheduled." />
        <TaskOverviewPanel title="Past" icon={CheckCircle2} tone="safe" tasks={past} onOpen={onOpen} emptyText="No past tasks." />
        <TaskCompletionInsights tasks={tasks} avgMin={avgMin} onOpen={onOpen} />
      </div>
      <TaskWorkloadStrip tasks={tasks} />

    </div>
  );
}