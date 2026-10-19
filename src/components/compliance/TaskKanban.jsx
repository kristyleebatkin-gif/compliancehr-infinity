import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { useToast } from '@/components/ui/use-toast';
import { logUserAction } from '@/lib/actionLog';
import { Loader2, KanbanSquare, Clock } from 'lucide-react';

const BASE_COLUMNS = ['Pending', 'Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];

const COL_TONE = {
  Pending: { accent: 'border-t-amber-400', dot: 'bg-amber-400' },
  Open: { accent: 'border-t-brand', dot: 'bg-brand' },
  'In Progress': { accent: 'border-t-teal', dot: 'bg-teal' },
  Completed: { accent: 'border-t-safe', dot: 'bg-safe' },
  Overdue: { accent: 'border-t-danger', dot: 'bg-danger' },
  Cancelled: { accent: 'border-t-foreground/30', dot: 'bg-foreground/30' },
};

const today = () => format(new Date(), 'yyyy-MM-dd');

// Compliance task kanban: drag a task card between status columns and the
// change is saved to the task register (with a completion date when it lands
// on Completed). Any status outside the base stages gets its own column so
// no task ever disappears from the board.
export default function TaskKanban() {
  const [tasks, setTasks] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const page = await base44.entities.TodoTask.filter(
      { archived: { $ne: true } },
      { sort: 'due_date', limit: 200, fields: ['title', 'status', 'priority', 'module', 'due_date', 'assigned_to'] },
    );
    setTasks(page.items || []);
  };

  useEffect(() => { load(); }, []);

  const columns = useMemo(() => {
    const extra = [...new Set((tasks || []).map((t) => t.status).filter((s) => s && !BASE_COLUMNS.includes(s)))];
    return [...BASE_COLUMNS, ...extra];
  }, [tasks]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;
    const nextStatus = destination.droppableId;

    const snapshot = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    setMovingId(task.id);
    try {
      const patch = { status: nextStatus };
      if (nextStatus === 'Completed') {
        patch.completed_date = today();
        const me = await base44.auth.me().catch(() => null);
        if (me) patch.completed_by = me.full_name || me.email;
      } else {
        patch.completed_date = undefined;
      }
      await base44.entities.TodoTask.update(task.id, patch);
      toast({ title: `Moved to ${nextStatus}`, description: task.title });
      logUserAction('Task Status Changed', 'Compliance Task', { record_id: task.id, record_title: task.title, details: `Moved from ${task.status} to ${nextStatus} on the task kanban`, person: { profile_type: 'employee', profile_name: task.assigned_to, profile_email: task.assigned_email } });
      load();
    } catch (e) {
      setTasks(snapshot.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      toast({ title: 'Move failed', description: e.message || 'You may not have permission to update this task.', variant: 'destructive' });
    } finally {
      setMovingId(null);
    }
  };

  if (!tasks) {
    return (
      <Card className="shadow-panel">
        <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
          <Loader2 className="h-4 w-4 animate-spin" />Loading tasks...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="mb-1 flex items-center gap-2 font-display text-base font-bold">
          <KanbanSquare className="h-4 w-4 text-brand" />Task kanban
        </div>
        <p className="mb-4 text-xs font-medium text-muted-foreground">Drag a task between progress stages to update its status — the change saves instantly and lands in the activity feed.</p>
        {tasks.length === 0 ? (
          <p className="py-10 text-center text-sm text-foreground/60">No tasks on the board yet.</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {columns.map((col) => {
                const tone = COL_TONE[col] || { accent: 'border-t-primary/50', dot: 'bg-primary/50' };
                const colTasks = tasks.filter((t) => (t.status || 'Pending') === col);
                return (
                  <div key={col} className="flex w-64 shrink-0 flex-col rounded-xl border border-border/60 bg-muted/30">
                    <div className={`flex items-center justify-between rounded-t-xl border-t-2 ${tone.accent} bg-card px-3 py-2.5`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                        <h3 className="text-xs font-semibold text-foreground/80">{col}</h3>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-foreground/50">{colTasks.length}</span>
                    </div>
                    <Droppable droppableId={col}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 space-y-2 p-2 min-h-[140px] transition-colors ${snapshot.isDraggingOver ? 'bg-brand/5' : ''}`}
                        >
                          {colTasks.map((t, idx) => {
                            const overdue = t.due_date && t.due_date < today() && !['Completed', 'Cancelled'].includes(t.status);
                            return (
                              <Draggable key={t.id} draggableId={t.id} index={idx}>
                                {(p, s) => (
                                  <div
                                    ref={p.innerRef}
                                    {...p.draggableProps}
                                    {...p.dragHandleProps}
                                    className={`rounded-lg border border-border/60 bg-card p-2.5 shadow-sm transition-shadow ${s.isDragging ? 'shadow-md ring-2 ring-brand/30' : ''} ${movingId === t.id ? 'opacity-60' : ''}`}
                                  >
                                    <div className="text-xs font-semibold leading-snug line-clamp-2">{t.title}</div>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] font-medium text-foreground/55">
                                      <Badge className={`border-transparent px-1.5 py-0 text-[10px] ${t.priority === 'Urgent' || t.priority === 'High' ? 'bg-danger/10 text-danger' : 'bg-muted text-foreground/60'}`}>{t.priority}</Badge>
                                      {t.assigned_to && <span className="truncate">{t.assigned_to}</span>}
                                      {t.due_date && (
                                        <span className={`flex items-center gap-0.5 tabular-nums ${overdue ? 'font-semibold text-danger' : ''}`}>
                                          <Clock className="h-2.5 w-2.5" />{format(new Date(`${t.due_date}T00:00:00`), 'd MMM')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {colTasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-border/60 text-[10px] text-foreground/30">Drop here</div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
}