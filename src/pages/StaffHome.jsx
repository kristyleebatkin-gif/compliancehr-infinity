import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import TaskEditDialog from '@/components/mywork/TaskEditDialog';
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, ArrowRight, FilePlus2 } from 'lucide-react';
import { format } from 'date-fns';

const today = () => new Date().toISOString().slice(0, 10);

function StatusPill({ status }) {
  const tone = status === 'Completed' ? 'bg-safe/10 text-safe'
    : status === 'Overdue' ? 'bg-danger/10 text-danger'
    : status === 'In Progress' ? 'bg-teal/10 text-teal'
    : 'bg-muted text-foreground/60';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>;
}

export default function StaffHome() {
  const [me, setMe] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  const load = useCallback(async (user) => {
    try {
      const [taskPage, incidentPage] = await Promise.allSettled([
        base44.entities.TodoTask.filter(
          { archived: { $ne: true }, $or: [{ assigned_to: user.full_name }, { assigned_email: user.email }] },
          { sort: 'due_date', limit: 200 }
        ),
        base44.entities.Incident.filter({ reported_by: user.full_name }, { sort: '-created_date', limit: 10 }),
      ]);
      if (taskPage.status === 'fulfilled') setTasks(taskPage.value.items || []);
      if (incidentPage.status === 'fulfilled') setIncidents(incidentPage.value.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    base44.auth.me().then((user) => { setMe(user); return load(user); }).catch(() => setLoading(false));
  }, [load]);

  const openTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
  const dueToday = openTasks.filter((t) => t.due_date === today());
  const overdue = openTasks.filter((t) => t.due_date && t.due_date < today());

  const toggle = async (t) => {
    const completing = t.status !== 'Completed';
    await base44.entities.TodoTask.update(t.id, {
      status: completing ? 'Completed' : 'Open',
      completed_date: completing ? today() : undefined,
    });
    if (me) load(me);
  };

  const firstName = (me?.full_name || '').split(' ')[0];
  const fmt = (d) => d ? format(new Date(d), 'EEE d MMM') : '';

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-6">
      <PageHeader
        title={firstName ? `Hi ${firstName}` : 'My Work'}
        subtitle="Your personal view: the tasks assigned to you and your incident reports."
        action={<Link to="/incidents/submit" className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand/90"><FilePlus2 className="h-4 w-4" />Report an Incident</Link>}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center"><div className="text-2xl font-bold text-brand tabular-nums">{openTasks.length}</div><div className="text-xs font-medium text-foreground/50">Open tasks</div></div>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center"><div className="text-2xl font-bold text-warning tabular-nums">{dueToday.length}</div><div className="text-xs font-medium text-foreground/50">Due today</div></div>
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-center"><div className="text-2xl font-bold text-danger tabular-nums">{overdue.length}</div><div className="text-xs font-medium text-foreground/50">Overdue</div></div>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My tasks</h2>
          <Link to="/tasks" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Full task dashboard<ArrowRight className="h-3 w-3" /></Link>
        </div>
        {loading ? (
          <div className="py-10 text-center text-sm text-foreground/40">Loading...</div>
        ) : openTasks.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All clear" message="No open tasks assigned to you right now." />
        ) : (
          <div className="space-y-2">
            {openTasks.map((t) => {
              const late = t.due_date && t.due_date < today();
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <button onClick={() => toggle(t)} title="Mark complete" className="shrink-0">
                    <Circle className="h-5 w-5 text-foreground/30 hover:text-safe" />
                  </button>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditingTask(t)} title="Click to edit">
                    <div className="text-sm font-medium hover:text-brand">{t.title}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                      {t.priority === 'Urgent' || t.priority === 'High' ? <span className="rounded-full bg-danger/10 px-2 py-0.5 font-medium text-danger">{t.priority}</span> : null}
                      {t.due_date && <span className={`flex items-center gap-1 ${late ? 'font-semibold text-danger' : ''}`}><Clock className="h-3 w-3" />{late ? 'Overdue: ' : ''}{fmt(t.due_date)}</span>}
                    </div>
                  </div>
                  <StatusPill status={t.status} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My incident reports</h2>
          <Link to="/incidents/submit" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Submit new<Plus className="h-3 w-3" /></Link>
        </div>
        {incidents.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No incidents reported" message="When you report an incident it will appear here with its status." />
        ) : (
          <div className="space-y-2">
            {incidents.map((i) => (
              <Link key={i.id} to={`/incidents/${i.id}`} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/30">
                <AlertTriangle className={`h-5 w-5 shrink-0 ${i.severity === 'Critical' || i.severity === 'High' ? 'text-danger' : 'text-warning'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.title}</div>
                  <div className="text-xs text-foreground/50">{i.incident_id || ''}{i.date_occurred ? ` · ${fmt(i.date_occurred)}` : ''}</div>
                </div>
                <StatusPill status={i.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <TaskEditDialog task={editingTask} open={!!editingTask} onClose={() => setEditingTask(null)} onSaved={() => me && load(me)} />
    </div>
  );
}