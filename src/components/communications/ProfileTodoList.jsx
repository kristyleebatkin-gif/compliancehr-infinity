import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeTasks from '@/components/employee/EmployeeTasks';
export default withEmployeeView(ProfileTodoList, EmployeeTasks);
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ListTodo, Loader2 } from 'lucide-react';

function ProfileTodoList({ staff, person }) {
  staff = staff || person;
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finaliseTarget, setFinaliseTarget] = useState(null);
  const [minutes, setMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.TodoTask.filter({
        $or: [
          { responsible: staff.full_name },
          { assigned_to: staff.full_name },
          { responsible_emails: staff.email },
          { assigned_email: staff.email },
          { responsible_emails: String(staff.email || '').toLowerCase() },
          { assigned_email: String(staff.email || '').toLowerCase() },
        ],
      }, { sort: '-created_date', limit: 500 });
      setTasks(page.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [staff?.id]);

  const pending = tasks.filter((t) => !t.archived && ['Pending', 'Open', 'In Progress', 'Overdue'].includes(t.status));
  const awaiting = tasks.filter((t) => !t.archived && t.status === 'Pending Approval');
  const finalised = tasks.filter((t) => ['Finalised', 'Completed'].includes(t.status));

  const finalise = async () => {
    if (!finaliseTarget || saving) return;
    if (!Number.isFinite(Number(minutes)) || Number(minutes) < 0) { toast({ title: 'Enter valid time taken', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await base44.entities.TodoTask.update(finaliseTarget.id, {
        status: 'Pending Approval',
        completed_date: new Date().toISOString().slice(0, 10),
        completed_by: staff.full_name,
        time_taken_minutes: Number(minutes) || 0,
      });
      toast({ title: 'Submitted for manager sign-off', description: 'The task will be finalised once a manager approves it.' });
      setFinaliseTarget(null);
      setMinutes('');
      await load();
    } catch (error) { toast({ title: 'Unable to submit task', description: error.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-sm font-semibold">To-do list ({pending.length} pending)</p>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing pending - shared to-dos where {staff.full_name} is responsible appear here with their due dates.</p>
            ) : pending.map((t) => (
              <div key={t.id} className="rounded-xl border border-border/60 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{t.module || 'General'}</Badge>
                    <span className="text-sm font-semibold">{t.title}</span>
                    {t.due_date && <Badge variant="destructive">Due {t.due_date}</Badge>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setFinaliseTarget(t); setMinutes(''); }}><ListTodo className="h-3.5 w-3.5" />Finalise</Button>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {t.task_date && <span>Date: {t.task_date}{t.task_time ? ` ${t.task_time}` : ''}</span>}
                  <span>Shared by {t.shared_by || 'unknown'}</span>
                </div>
                {(t.how_to_complete || t.resources_needed || t.important_info) && (
                  <div className="mt-2 grid gap-1 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                    {t.how_to_complete && <span><span className="font-semibold text-foreground/70">How to complete:</span> {t.how_to_complete}</span>}
                    {t.resources_needed && <span><span className="font-semibold text-foreground/70">Resources needed:</span> {t.resources_needed}</span>}
                    {t.important_info && <span><span className="font-semibold text-foreground/70">Important info:</span> {t.important_info}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          {awaiting.length > 0 && <section className="space-y-2"><h3 className="text-sm font-semibold">Awaiting manager sign-off ({awaiting.length})</h3>{awaiting.map((task) => <div key={task.id} className="rounded-xl border border-border bg-card p-3 text-sm">{task.title}<Button asChild size="sm" variant="outline" className="ml-2"><Link to={`/shared-to-do?task=${encodeURIComponent(task.id)}`}>View sign-off status</Link></Button></div>)}</section>}
          {finalised.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Finalised ({finalised.length})</p>
              {finalised.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3 text-sm">
                  <span>{t.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Completed {t.completed_date || ''}{t.completed_by ? ` by ${t.completed_by}` : ''}{Number(t.time_taken_minutes) > 0 ? ` · ${t.time_taken_minutes} min` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <Dialog open={Boolean(finaliseTarget)} onOpenChange={(o) => !o && setFinaliseTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit task for manager sign-off</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{finaliseTarget?.title}</p>
          <Input type="number" min="0" placeholder="How long did it take? (minutes)" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFinaliseTarget(null)}>Cancel</Button>
            <Button onClick={finalise} disabled={saving}><ListTodo className="h-4 w-4" />{saving ? 'Submitting…' : 'Submit for sign-off'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}