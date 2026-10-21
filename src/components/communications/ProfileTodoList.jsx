import React, { useEffect, useState } from 'react';
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

  const pending = tasks.filter((t) => t.status === 'Pending');
  const finalised = tasks.filter((t) => t.status === 'Finalised');

  const finalise = async () => {
    if (!finaliseTarget) return;
    try {
      await base44.entities.TodoTask.update(finaliseTarget.id, {
        status: 'Finalised',
        completed_date: new Date().toISOString().slice(0, 10),
        completed_by: staff.full_name,
        time_taken_minutes: Number(minutes) || 0,
      });
      toast({ title: 'Task finalised', description: 'A point has been added on the leaderboard.' });
      setFinaliseTarget(null);
      setMinutes('');
      await load();
    } finally { /* handled */ }
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
          <DialogHeader><DialogTitle>Finalise task</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{finaliseTarget?.title}</p>
          <Input type="number" placeholder="How long did it take? (minutes)" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFinaliseTarget(null)}>Cancel</Button>
            <Button onClick={finalise}><ListTodo className="h-4 w-4" />Finalise</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}