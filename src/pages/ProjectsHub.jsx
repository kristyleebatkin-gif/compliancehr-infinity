import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KanbanSquare, Plus, Trash2, ChevronLeft, ChevronRight, CircleAlert, CircleCheck } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

const COLUMNS = ['Planning', 'Active', 'On Hold', 'Complete'];
const COL_TONES = {
  Planning: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  Active: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'On Hold': 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Complete: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};
const today = () => new Date().toISOString().slice(0, 10);

export default function ProjectsHub() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const page = await base44.entities.BusinessProject.filter({}, { sort: '-created_date', limit: 100 });
    setProjects(page.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setSaving(true);
    await base44.entities.BusinessProject.create({
      name: f.get('name'),
      description: f.get('description'),
      owner: f.get('owner'),
      priority: f.get('priority'),
      due_date: f.get('due_date'),
      status: 'Planning',
      progress: 0,
      milestones: f.get('milestones'),
    });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const patch = async (project, data) => {
    await base44.entities.BusinessProject.update(project.id, data);
    load();
  };

  const move = (project, dir) => {
    const idx = COLUMNS.indexOf(project.status);
    const next = COLUMNS[Math.min(COLUMNS.length - 1, Math.max(0, idx + dir))];
    patch(project, { status: next, progress: next === 'Complete' ? 100 : project.progress });
  };

  const active = projects.filter((p) => p.status === 'Active');
  const overdue = projects.filter((p) => p.status !== 'Complete' && p.due_date && p.due_date < today());
  const avgProgress = projects.length ? Math.round(projects.reduce((t, p) => t + Number(p.progress || 0), 0) / projects.length) : 0;

  const priorityTone = (p) => (p === 'High' ? 'bg-danger/10 text-danger' : p === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground');

  return (
    <div className="space-y-4">
      <PageHeader
        title="Projects Hub"
        subtitle="Business improvement projects, growth initiatives and internal builds - tracked from planning to complete."
        icon={KanbanSquare}
        accent={['#6366f1', '#4f46e5']}
        showAlerts={false}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active projects', value: active.length, grad: 'from-violet-600 via-purple-600 to-fuchsia-600' },
          { label: 'Planning', value: projects.filter((p) => p.status === 'Planning').length, grad: 'from-sky-500 via-blue-600 to-indigo-600' },
          { label: 'Overdue', value: overdue.length, grad: 'from-rose-500 via-red-500 to-orange-500' },
          { label: 'Average progress', value: `${avgProgress}%`, grad: 'from-emerald-500 via-teal-500 to-cyan-600' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br p-4 text-white shadow-md ${s.grad}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/85">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New project</Button>
        <Button size="sm" variant="outline" onClick={() => downloadCsv('projects.csv', [
          { label: 'Project', key: 'name' }, { label: 'Owner', key: 'owner' }, { label: 'Status', key: 'status' },
          { label: 'Priority', key: 'priority' }, { label: 'Due', key: 'due_date' }, { label: 'Progress (%)', key: 'progress' },
        ], projects)}>Export CSV</Button>
      </div>

      {showForm && (
        <Card><CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={save}>
            <div className="grid gap-1.5"><Label>Project name *</Label><Input name="name" required /></div>
            <div className="grid gap-1.5"><Label>Owner</Label><Input name="owner" /></div>
            <div className="grid gap-1.5"><Label>Priority</Label>
              <select name="priority" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5"><Label>Due date</Label><Input name="due_date" type="date" /></div>
            <div className="grid gap-1.5 md:col-span-2"><Label>Description</Label><Input name="description" /></div>
            <div className="grid gap-1.5 md:col-span-2"><Label>Milestones (one per line)</Label>
              <textarea name="milestones" rows={3} className="rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button size="sm" type="submit" disabled={saving}>Create project</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading projects...</CardContent></Card>
      ) : projects.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No projects yet. Create your first business improvement project above.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => p.status === col);
            return (
              <div key={col} className="space-y-2">
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 font-semibold ${COL_TONES[col]}`}>
                  <p className="text-xs font-bold uppercase tracking-wide">{col}</p>
                  <span className="text-xs">{colProjects.length}</span>
                </div>
                {colProjects.map((p) => {
                  const isOverdue = p.status !== 'Complete' && p.due_date && p.due_date < today();
                  return (
                    <Card key={p.id} className={isOverdue ? 'border-danger/40' : ''}><CardContent className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${priorityTone(p.priority)}`}>{p.priority}</span>
                      </div>
                      {p.owner && <p className="text-xs text-muted-foreground">Owner: {p.owner}</p>}
                      {p.due_date && <p className={`text-xs ${isOverdue ? 'font-semibold text-danger' : 'text-muted-foreground'}`}>Due {p.due_date.slice(0, 10)}{isOverdue ? ' - OVERDUE' : ''}</p>}
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all" style={{ width: `${Number(p.progress || 0)}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{p.progress || 0}%</span>
                      </div>
                      {p.milestones && (
                        <ul className="space-y-0.5 border-t border-border/60 pt-2">
                          {String(p.milestones).split('\n').filter(Boolean).map((m, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground"><CircleCheck className="mt-0.5 h-3 w-3 shrink-0 text-safe" />{m}</li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center gap-1.5 border-t border-border/60 pt-2">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => move(p, -1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => patch(p, { progress: Math.min(100, Number(p.progress || 0) + 10) })}><Plus className="h-3.5 w-3.5" /></Button>
                        <select
                          className="h-7 flex-1 rounded-md border border-input bg-transparent px-1.5 text-xs"
                          value={p.status}
                          onChange={(e) => patch(p, { status: e.target.value, progress: e.target.value === 'Complete' ? 100 : p.progress })}
                        >
                          {COLUMNS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => move(p, 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-danger" onClick={async () => { await base44.entities.BusinessProject.delete(p.id); load(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </CardContent></Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}