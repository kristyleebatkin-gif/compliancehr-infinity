import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const INTAKE_COMPLETED = ['Approved', 'Converted to Profile'];
const INTAKE_PENDING = ['Draft', 'Information Required', 'Ready for Review'];
const TASK_COMPLETED = ['Completed', 'Finalised'];
const TASK_PENDING = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];

const tickStyle = { fontSize: 12, fontWeight: 600 };

function ProgressChart({ title, data, pendingLabel }) {
  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Completed versus {pendingLabel.toLowerCase()} for each staff member</p>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div style={{ height: Math.max(220, data.length * 44 + 60) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name={pendingLabel} stackId="a" fill="#ca8a04" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StaffProgressDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [intakeDone, intakePending, tasksDone, tasksPending] = await Promise.all([
        base44.entities.IntakeCase.aggregate({ query: { status: { $in: INTAKE_COMPLETED } }, groupBy: 'assigned_to' }),
        base44.entities.IntakeCase.aggregate({ query: { status: { $in: INTAKE_PENDING } }, groupBy: 'assigned_to' }),
        base44.entities.TodoTask.aggregate({ query: { status: { $in: TASK_COMPLETED } }, groupBy: 'assigned_to' }),
        base44.entities.TodoTask.aggregate({ query: { status: { $in: TASK_PENDING } }, groupBy: 'assigned_to' }),
      ]);
      const toMap = (result) => Object.fromEntries((result.rows || [])
        .filter((r) => String(r.assigned_to || '').trim())
        .map((r) => [r.assigned_to, Number(r.count || 0)]));
      const intakeDoneMap = toMap(intakeDone);
      const intakePendingMap = toMap(intakePending);
      const tasksDoneMap = toMap(tasksDone);
      const tasksPendingMap = toMap(tasksPending);
      const names = Array.from(new Set([
        ...Object.keys(intakeDoneMap), ...Object.keys(intakePendingMap),
        ...Object.keys(tasksDoneMap), ...Object.keys(tasksPendingMap),
      ])).sort((a, b) => a.localeCompare(b));
      setRows(names.map((name) => ({
        name,
        intakeCompleted: intakeDoneMap[name] || 0,
        intakePending: intakePendingMap[name] || 0,
        tasksCompleted: tasksDoneMap[name] || 0,
        tasksPending: tasksPendingMap[name] || 0,
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = rows.reduce((acc, r) => ({
    intakeCompleted: acc.intakeCompleted + r.intakeCompleted,
    intakePending: acc.intakePending + r.intakePending,
    tasksCompleted: acc.tasksCompleted + r.tasksCompleted,
    tasksPending: acc.tasksPending + r.tasksPending,
  }), { intakeCompleted: 0, intakePending: 0, tasksCompleted: 0, tasksPending: 0 });

  const statCards = [
    { label: 'Intake forms completed', value: totals.intakeCompleted, colour: '#16a34a' },
    { label: 'Intake forms pending', value: totals.intakePending, colour: '#ca8a04' },
    { label: 'Compliance tasks completed', value: totals.tasksCompleted, colour: '#16a34a' },
    { label: 'Compliance tasks pending', value: totals.tasksPending, colour: '#ca8a04' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <PageHeader
        title="Staff Progress"
        subtitle="How many intake forms and compliance tasks each staff member has completed versus pending."
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading staff progress…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.label} className="shadow-panel">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: card.colour }}>{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ProgressChart
              title="Intake forms"
              pendingLabel="Pending"
              data={rows.map((r) => ({ name: r.name, completed: r.intakeCompleted, pending: r.intakePending }))}
            />
            <ProgressChart
              title="Compliance tasks"
              pendingLabel="Pending"
              data={rows.map((r) => ({ name: r.name, completed: r.tasksCompleted, pending: r.tasksPending }))}
            />
          </div>

          {rows.length === 0 && (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No staff assignments found yet.</CardContent></Card>
          )}
        </>
      )}
    </div>
  );
}