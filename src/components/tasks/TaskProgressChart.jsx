import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

const today = () => format(new Date(), 'yyyy-MM-dd');

function classify(tasks, users) {
  const participantNames = new Set((users || []).filter((u) => u.role === 'Participant').map((u) => u.full_name).filter(Boolean));
  const buckets = {
    staff: { total: 0, completed: 0, onTrack: 0, overdue: 0 },
    participant: { total: 0, completed: 0, onTrack: 0, overdue: 0 },
  };
  const t = today();
  for (const task of tasks) {
    const bucket = participantNames.has(task.assigned_to) ? buckets.participant : buckets.staff;
    if (task.status === 'Cancelled') continue;
    bucket.total += 1;
    if (task.status === 'Completed') { bucket.completed += 1; continue; }
    const pastDue = task.due_date && task.due_date < t;
    if (pastDue || task.status === 'Overdue') bucket.overdue += 1;
    else bucket.onTrack += 1;
  }
  return buckets;
}

function RateBar({ label, done, total, colour }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground/70">{label}</span>
        <span className="text-foreground/50">{done}/{total} done · {pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colour }} />
      </div>
    </div>
  );
}

export default function TaskProgressChart({ tasks, users }) {
  const { staff, participant, chart } = useMemo(() => {
    const b = classify(tasks || [], users);
    return {
      staff: b.staff,
      participant: b.participant,
      chart: [
        { name: 'On track', value: b.staff.onTrack + b.participant.onTrack, fill: '#0d9488' },
        { name: 'Overdue', value: b.staff.overdue + b.participant.overdue, fill: '#dc2626' },
        { name: 'Completed', value: b.staff.completed + b.participant.completed, fill: '#22c55e' },
      ],
    };
  }, [tasks, users]);

  const overall = { total: staff.total + participant.total, completed: staff.completed + participant.completed };
  const overallPct = overall.total ? Math.round((overall.completed / overall.total) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10"><TrendingUp className="h-4 w-4 text-brand" /></span>
          <div>
            <h3 className="text-sm font-semibold">Task Progress</h3>
            <p className="text-xs text-muted-foreground">Completion rates and task health at a glance</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold leading-none text-brand">{overallPct}%</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/50">Overall complete</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">Staff tasks</p>
              <div className="space-y-3">
                <RateBar label="Completion rate" done={staff.completed} total={staff.total} colour="#4f46e5" />
                <div className="flex gap-2 text-xs">
                  <span className="rounded-full bg-teal-600/10 px-2.5 py-1 font-medium text-teal-700 dark:text-teal-300">{staff.onTrack} on track</span>
                  <span className="rounded-full bg-danger/10 px-2.5 py-1 font-medium text-danger">{staff.overdue} overdue</span>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">Participant tasks</p>
              <div className="space-y-3">
                <RateBar label="Completion rate" done={participant.completed} total={participant.total} colour="#0ea5e9" />
                <div className="flex gap-2 text-xs">
                  <span className="rounded-full bg-teal-600/10 px-2.5 py-1 font-medium text-teal-700 dark:text-teal-300">{participant.onTrack} on track</span>
                  <span className="rounded-full bg-danger/10 px-2.5 py-1 font-medium text-danger">{participant.overdue} overdue</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={74} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {chart.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}