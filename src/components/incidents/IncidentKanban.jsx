import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { key: 'Reported', accent: 'border-t-safe', dot: 'bg-safe' },
  { key: 'Under Investigation', accent: 'border-t-warning', dot: 'bg-warning' },
  { key: 'Action Required', accent: 'border-t-orange-500', dot: 'bg-orange-500' },
  { key: 'Resolved', accent: 'border-t-teal', dot: 'bg-teal' },
  { key: 'Closed', accent: 'border-t-foreground/30', dot: 'bg-foreground/30' },
];

const sevColor = {
  Low: 'bg-safe/15 text-safe',
  Medium: 'bg-warning/15 text-warning',
  High: 'bg-orange-500/15 text-orange-600 dark:text-orange-300',
  Critical: 'bg-danger/15 text-danger',
};

export default function IncidentKanban({ incidents, onMove }) {
  const [dragId, setDragId] = useState(null);

  const onDragEnd = (result) => {
    setDragId(null);
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    onMove(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragStart={(s) => setDragId(s.draggableId)} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {COLUMNS.map((col) => {
          const colItems = incidents.filter((i) => (i.status || 'Reported') === col.key);
          return (
            <div key={col.key} className="flex w-72 shrink-0 flex-col rounded-xl border border-border/60 bg-muted/30">
              <div className={`flex items-center justify-between rounded-t-xl border-t-2 ${col.accent} bg-card px-3 py-2.5`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <h3 className="text-xs font-semibold text-foreground/80">{col.key}</h3>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground/50">{colItems.length}</span>
              </div>
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2 p-2 min-h-[120px] transition-colors ${snapshot.isDraggingOver ? 'bg-brand/5' : ''}`}
                  >
                    {colItems.map((inc, idx) => (
                      <Draggable key={inc.id} draggableId={inc.id} index={idx}>
                        {(p, s) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            className={`rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-shadow ${s.isDragging ? 'shadow-md ring-2 ring-brand/30' : ''} ${dragId === inc.id ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <Link to={`/incidents/${inc.id}`} className="text-sm font-semibold text-foreground hover:underline line-clamp-2" onClick={(e) => e.stopPropagation()}>{inc.title || 'Untitled'}</Link>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sevColor[inc.severity] || sevColor.Medium}`}>{inc.severity || 'Med'}</span>
                            </div>
                            {inc.incident_id && <div className="mt-1 text-[10px] text-foreground/40">{inc.incident_id}</div>}
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-foreground/50">
                              {inc.date_occurred && <span>{inc.date_occurred}</span>}
                              {inc.category && <span className="rounded bg-muted px-1.5 py-0.5">{inc.category}</span>}
                            </div>
                            {(inc.reported_by || inc.location) && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-foreground/40">
                                {inc.reported_by && <span>👤 {inc.reported_by}</span>}
                                {inc.location && <span>📍 {inc.location}</span>}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {colItems.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-[11px] text-foreground/30">
                        <AlertTriangle className="mb-1 h-4 w-4" />
                        Drop here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}