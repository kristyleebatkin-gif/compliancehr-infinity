import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { statusTone } from '@/lib/statusStyles';
import { useToast } from '@/components/ui/use-toast';
import { logUserAction } from '@/lib/actionLog';
import { Loader2, Check, Flag, Zap, CheckSquare } from 'lucide-react';

const PENDING_STATUSES = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];
const DONE_STATUSES = ['Completed', 'Finalised'];

const today = () => format(new Date(), 'yyyy-MM-dd');

// One-click task actions for the compliance dashboard: complete or flag a
// pending task directly from the list, without opening the detail view.
export default function ComplianceTaskActions() {
  const [tasks, setTasks] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const page = await base44.entities.TodoTask.filter(
      { status: { $in: PENDING_STATUSES } },
      { sort: 'due_date', limit: 100, fields: ['title', 'status', 'priority', 'module', 'due_date', 'assigned_to'] }
    );
    setTasks(page.items || []);
  };

  useEffect(() => { load(); }, []);

  const act = async (task, action) => {
    setBusyId(task.id);
    try {
      if (action === 'complete') {
        const me = await base44.auth.me().catch(() => null);
        await base44.entities.TodoTask.update(task.id, {
          status: 'Completed',
          completed_date: today(),
          completed_by: me ? (me.full_name || me.email) : undefined,
        });
        toast({ title: 'Task completed', description: task.title });
      } else {
        if (task.priority === 'Urgent') {
          toast({ title: 'Already flagged', description: `${task.title} is already flagged as urgent.` });
          setBusyId(null);
          return;
        }
        await base44.entities.TodoTask.update(task.id, { priority: 'Urgent' });
        toast({ title: 'Task flagged', description: `${task.title} was flagged as urgent.` });
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const toggleRow = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelectedIds((prev) => (prev.length === tasks.length ? [] : tasks.map((t) => t.id)));

  const bulkComplete = async () => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      await base44.entities.TodoTask.bulkUpdate(
        selectedIds.map((id) => ({ id, status: 'Completed', completed_date: today(), completed_by: me ? (me.full_name || me.email) : undefined })),
      );
      toast({ title: `${selectedIds.length} task${selectedIds.length === 1 ? '' : 's'} marked completed` });
      logUserAction('Bulk Tasks Completed', 'Compliance Task', { details: `${selectedIds.length} task(s) marked completed in bulk` });
      setSelectedIds([]);
      await load();
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkFlag = async () => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      await base44.entities.TodoTask.bulkUpdate(
        selectedIds.map((id) => ({ id, priority: 'Urgent' })),
      );
      toast({ title: `${selectedIds.length} task${selectedIds.length === 1 ? '' : 's'} flagged as urgent` });
      logUserAction('Bulk Tasks Flagged Urgent', 'Compliance Task', { details: `${selectedIds.length} task(s) flagged urgent in bulk` });
      setSelectedIds([]);
      await load();
    } finally {
      setBulkBusy(false);
    }
  };

  if (!tasks) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
      <Loader2 className="h-4 w-4 animate-spin" />Loading pending tasks...
    </CardContent></Card>;
  }

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="mb-1 flex items-center gap-2 font-display text-base font-bold"><Zap className="h-4 w-4 text-amber-500" />Quick task actions</div>
        <p className="mb-4 text-xs font-medium text-muted-foreground">Mark a pending task as completed or flag it as urgent straight from this list — no need to open the detail view. Tick several and mark them completed, or flag them urgent, in one go.</p>
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-foreground/60">No pending tasks right now.</p>
        ) : (
          <>
          <div className="mb-2 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Checkbox checked={selectedIds.length === tasks.length && tasks.length > 0} onCheckedChange={toggleAll} aria-label="Select all tasks" />
            <span className="text-xs font-semibold text-foreground/70">Select all ({tasks.length})</span>
            <Button
              size="sm"
              disabled={selectedIds.length === 0 || bulkBusy}
              onClick={bulkComplete}
              className="ml-auto bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckSquare className="h-3.5 w-3.5" />}
              Mark {selectedIds.length || ''} completed
            </Button>
            <Button
              size="sm"
              disabled={selectedIds.length === 0 || bulkBusy}
              onClick={bulkFlag}
              className="border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <Flag className="h-3.5 w-3.5" />Flag {selectedIds.length || ''} urgent
            </Button>
          </div>
          <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {tasks.map((t) => {
              const overdue = t.due_date && t.due_date < today();
              const tone = statusTone(t.status) || '';
              return (
                <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <Checkbox checked={selectedIds.includes(t.id)} onCheckedChange={() => toggleRow(t.id)} aria-label={`Select ${t.title}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{t.title}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                      {t.assigned_to && <span>{t.assigned_to}</span>}
                      {t.due_date && (
                        <span className={`tabular-nums ${overdue ? 'font-semibold text-red-600 dark:text-red-400' : ''}`}>
                          Due {format(new Date(`${t.due_date}T00:00:00`), 'd MMM yyyy')}
                        </span>
                      )}
                      {t.module && <span>{t.module}</span>}
                    </div>
                  </div>
                  <Badge className={`border-transparent text-xs ${tone}`}>{t.status}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === t.id}
                    onClick={() => act(t, 'flag')}
                    className={t.priority === 'Urgent' ? 'text-foreground/40' : 'border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40'}
                  >
                    <Flag className="h-3.5 w-3.5" />{t.priority === 'Urgent' ? 'Flagged' : 'Flag'}
                  </Button>
                  <Button
                    size="sm"
                    disabled={busyId === t.id}
                    onClick={() => act(t, 'complete')}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {busyId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}Complete
                  </Button>
                </div>
              );
            })}
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}