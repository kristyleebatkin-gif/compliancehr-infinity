import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KanbanSquare, Siren, ListChecks, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { statusDot, statusTone } from '@/lib/statusStyles';

const TASK_ORDER = ['Pending', 'Open', 'In Progress', 'Pending Approval', 'Finalised', 'Overdue'];
const INCIDENT_ORDER = ['Reported', 'Under Investigation', 'Action Required', 'Resolved', 'Closed'];
const DONE_TASK = ['Completed'];
const IGNORED_TASK = ['Cancelled'];
const PENDING_INCIDENT = ['Reported', 'Under Investigation', 'Action Required'];

const today = () => new Date().toISOString().slice(0, 10);

// Admin visual status board: active compliance tasks + pending incident reports,
// grouped by status with the central semantic status colours (statusTone/statusDot).
export default function ComplianceStatusBoard() {
  const [taskRows, setTaskRows] = useState(null);
  const [overdue, setOverdue] = useState(0);
  const [incidentRows, setIncidentRows] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [tasks, incidents, overdueCount] = await Promise.all([
          base44.entities.TodoTask.aggregate({ query: { archived: { $ne: true } }, groupBy: 'status' }),
          base44.entities.Incident.aggregate({ groupBy: 'status' }),
          base44.entities.TodoTask.count({ status: { $nin: ['Completed', 'Cancelled'] }, archived: { $ne: true }, due_date: { $lt: today() } }),
        ]);
        if (!alive) return;
        setTaskRows(tasks.rows || []);
        setOverdue(overdueCount || 0);
        setIncidentRows(incidents.rows || []);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (failed) return null;
  if (!taskRows || !incidentRows) {
    return (
      <div className="grid gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-md md:grid-cols-2">
        <div className="h-28 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-28 animate-pulse rounded-xl bg-muted/60" />
      </div>
    );
  }

  const countFor = (rows, key) => rows.find((r) => (r.status || 'Unspecified') === key)?.count || 0;
  const taskTotal = taskRows.filter((r) => !IGNORED_TASK.includes(r.status)).reduce((a, r) => a + (r.count || 0), 0);
  const taskDone = countFor(taskRows, 'Completed');
  const activeTasks = taskTotal - taskDone;
  const overdueTotal = overdue + countFor(taskRows, 'Overdue');
  const incidentTotal = incidentRows.reduce((a, r) => a + (r.count || 0), 0);
  const pendingIncidents = PENDING_INCIDENT.reduce((a, s) => a + countFor(incidentRows, s), 0);

  const buildSegments = (order, rows, extra) => {
    const counts = order.map((s) => ({ status: s, count: countFor(rows, s) + (extra?.[s] || 0) }));
    if (rows.some((r) => !order.includes(r.status) && !IGNORED_TASK.includes(r.status) && r.count)) {
      counts.push({ status: 'Unspecified', count: rows.filter((r) => !order.includes(r.status) && !IGNORED_TASK.includes(r.status)).reduce((a, r) => a + (r.count || 0), 0) });
    }
    return counts.filter((c) => c.count > 0);
  };

  const taskSegments = buildSegments(TASK_ORDER, taskRows, { Overdue: overdue });
  const incidentSegments = buildSegments(INCIDENT_ORDER, incidentRows);
  const taskProgress = taskTotal ? Math.round((taskDone / taskTotal) * 100) : 0;
  const incidentProgress = incidentTotal ? Math.round(((incidentTotal - pendingIncidents) / incidentTotal) * 100) : 0;

  const Board = ({ title, icon: Icon, href, segments, progress, doneLabel, empty }) => (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={href} className="flex items-center gap-2 text-sm font-bold hover:underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white shadow-md"><Icon className="h-4 w-4" /></span>
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <span className="text-xs font-semibold tabular-nums text-foreground/80">{doneLabel}</span>
      </div>

      {segments.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border/60 bg-card px-3 py-4 text-xs text-foreground/80">
          <ListChecks className="h-4 w-4 text-safe" />{empty}
        </div>
      ) : (
        <>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-card shadow-inner" role="img" aria-label={`${title} status distribution`}>
            {segments.map((s) => (
              <div key={s.status} className={statusDot(s.status)} style={{ flexGrow: s.count, flexBasis: 0 }} title={`${s.status}: ${s.count}`} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {segments.map((s) => (
              <span key={s.status} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${statusTone(s.status)}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot(s.status)}`} />
                {s.status} · {s.count}
              </span>
            ))}
          </div>
        </>
      )}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card">
        <div className="h-full rounded-full bg-safe transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-md"><KanbanSquare className="h-5 w-5" /></span>
        <div>
          <h2 className="font-display text-lg font-bold leading-tight">Compliance status board</h2>
          <p className="text-xs text-muted-foreground">Live progress of active compliance tasks and pending incident reports.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Board
          title="Compliance tasks"
          icon={ListChecks}
          href="/tasks"
          segments={taskSegments}
          progress={taskProgress}
          doneLabel={`${activeTasks} active · ${overdueTotal} overdue`}
          empty="No active compliance tasks — all completed or cancelled."
        />
        <Board
          title="Incident reports"
          icon={Siren}
          href="/incidents"
          segments={incidentSegments}
          progress={incidentProgress}
          doneLabel={`${pendingIncidents} pending`}
          empty="No incident reports on record."
        />
      </div>
    </div>
  );
}