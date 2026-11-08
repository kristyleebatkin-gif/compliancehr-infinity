import React from 'react';
import { Link } from 'react-router-dom';
import { Circle } from 'lucide-react';
import { Panel, Row, Pill, Empty } from '@/components/today/todayUi';

const TONE = { Urgent: 'pink', High: 'amber', Medium: 'blue', Low: 'gray' };

export default function TodosPanel({ todos }) {
  return (
    <Panel
      title="To-dos & delegated jobs"
      subtitle={`${todos.length} open`}
      action={
        <Link to="/tasks" className="t-muted text-[11.5px] font-bold hover:underline">
          Open tasks
        </Link>
      }
    >
      {todos.length === 0 ? (
        <Empty>No open tasks — nicely done.</Empty>
      ) : (
        <div className="divide-y divide-[#0A2B6D]/6">
          {todos.slice(0, 5).map((task) => (
            <Row key={task.id}>
              <Circle className="t-muted h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
              <div className="min-w-0 flex-1">
                <p className="t-title truncate text-[12.5px] font-bold">{task.title}</p>
                <p className="t-muted mt-0.5 truncate text-[10.5px]">
                  {task.assigned_to || task.shared_by || 'Unassigned'}
                  {task.due_date ? ` · due ${task.due_date}` : ''}
                </p>
              </div>
              <Pill tone={TONE[task.priority] || 'gray'}>{task.priority || 'Medium'}</Pill>
            </Row>
          ))}
        </div>
      )}
    </Panel>
  );
}