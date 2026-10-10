import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SquareKanban, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'open', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];
const PRIORITY_TONE = { high: 'destructive', medium: 'secondary', low: 'outline' };

export default function VisualBoards() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Task.filter({}, { sort: '-created_date', limit: 100 });
      setTasks(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const col = COLUMNS.find((c) => c.id === destination.droppableId);
    if (!col) return;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.status === col.id) return;
    setTasks((prev) => prev.map((t) => (t.id === draggableId ? { ...t, status: col.id } : t)));
    await base44.entities.Task.update(draggableId, { status: col.id });
  };

  const remove = async (id) => {
    await base44.entities.Task.delete(id);
    await load();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><SquareKanban className="h-6 w-6" /> Visual Boards</h1>
        <p className="text-sm text-muted-foreground">Drag tasks between columns to update their status.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <Card key={col.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{col.label}</p>
                    <Badge variant="secondary">{colTasks.length}</Badge>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="mt-3 min-h-[120px] space-y-2">
                        {colTasks.map((t, index) => (
                          <Draggable key={t.id} draggableId={t.id} index={index}>
                            {(p) => (
                              <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                                className="rounded-lg border bg-background p-3 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium">{t.title}</p>
                                  <Badge variant={PRIORITY_TONE[t.priority] || 'outline'}>{t.priority}</Badge>
                                </div>
                                {t.assigned_to && <p className="mt-1 text-xs text-muted-foreground">{t.assigned_to}</p>}
                                {t.due_date && <p className="text-xs text-muted-foreground">Due {format(new Date(t.due_date), 'd MMM')}</p>}
                                <div className="mt-1 flex justify-end">
                                  <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}