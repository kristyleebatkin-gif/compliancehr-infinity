import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, TrendingUp, UserRound } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StaffHome from '@/pages/StaffHome';
import ProgressChart from '@/components/profile/StaffProgressChart';
import StaffComplianceFlags from '@/components/dashboard/StaffComplianceFlags';

const INTAKE_COMPLETED = ['Approved', 'Converted to Profile'];
const INTAKE_PENDING = ['Draft', 'Information Required', 'Ready for Review'];
const TASK_COMPLETED = ['Completed', 'Finalised'];
const TASK_PENDING = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];

export default function StaffProgressDashboard({ embedded = false, search = '' }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const ownerQuery = term ? { assigned_to: { $regex: term, $options: 'i' } } : {};
      const [intakeDone, intakePending, tasksDone, tasksPending] = await Promise.all([
        base44.entities.IntakeCase.aggregate({ query: { ...ownerQuery, status: { $in: INTAKE_COMPLETED } }, groupBy: 'assigned_to' }),
        base44.entities.IntakeCase.aggregate({ query: { ...ownerQuery, status: { $in: INTAKE_PENDING } }, groupBy: 'assigned_to' }),
        base44.entities.TodoTask.aggregate({ query: { ...ownerQuery, status: { $in: TASK_COMPLETED } }, groupBy: 'assigned_to' }),
        base44.entities.TodoTask.aggregate({ query: { ...ownerQuery, status: { $in: TASK_PENDING } }, groupBy: 'assigned_to' }),
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
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const totals = rows.reduce((acc, r) => ({
    intakeCompleted: acc.intakeCompleted + r.intakeCompleted,
    intakePending: acc.intakePending + r.intakePending,
    tasksCompleted: acc.tasksCompleted + r.tasksCompleted,
    tasksPending: acc.tasksPending + r.tasksPending,
  }), { intakeCompleted: 0, intakePending: 0, tasksCompleted: 0, tasksPending: 0 });

  const statCards = [
    { label: 'Intake forms completed', value: totals.intakeCompleted, colour: 'hsl(var(--safe))' },
    { label: 'Intake forms pending', value: totals.intakePending, colour: 'hsl(var(--warning))' },
    { label: 'Compliance tasks completed', value: totals.tasksCompleted, colour: 'hsl(var(--safe))' },
    { label: 'Compliance tasks pending', value: totals.tasksPending, colour: 'hsl(var(--warning))' },
  ];

  return (
    <div className={embedded ? 'min-w-0 space-y-3' : 'mx-auto max-w-6xl space-y-4 p-3 md:p-5'}>
      {!embedded && <PageHeader
        title="Staff Profile"
        subtitle="Your staff profile, plus how many intake forms and compliance tasks each staff member has completed versus pending."
      />}

      <Tabs defaultValue="progress">
        {!embedded && <TabsList>
          <TabsTrigger value="progress"><TrendingUp className="mr-1.5 h-4 w-4" />Staff progress</TabsTrigger>
          <TabsTrigger value="profile"><UserRound className="mr-1.5 h-4 w-4" />My profile</TabsTrigger>
        </TabsList>}
        <TabsContent value="progress" className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading staff progress…
        </div>
      ) : (
        <>
          <StaffComplianceFlags />

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

          <ProgressChart
            title="Overall summary — intake + compliance tasks"
            pendingLabel="Pending"
            data={rows.map((r) => ({ name: r.name, completed: r.intakeCompleted + r.tasksCompleted, pending: r.intakePending + r.tasksPending }))}
          />

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
        </TabsContent>
        {!embedded && <TabsContent value="profile">
          <StaffHome embedded />
        </TabsContent>}
      </Tabs>
    </div>
  );
}