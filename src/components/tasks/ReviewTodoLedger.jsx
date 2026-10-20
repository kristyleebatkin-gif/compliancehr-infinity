import React from 'react';
import ReviewTodoMeta from '@/components/tasks/ReviewTodoMeta';

export default function ReviewTodoLedger({ tasks, onReopen }) {
  return <div className="rt-ledger">
    <div className="rt-lh"><span>Task</span><span>Module</span><span>Due</span><span>Completed</span><span>Signed off</span></div>
    {tasks.map((task) => <article key={task.id}>
      <div className="rt-lr"><b>{task.title}</b><span>{task.module || 'General'}</span><span>{task.due_date || '–'}</span><span>{task.completed_date || '–'}</span><span>{task.signed_off_date || '–'}</span></div>
      <div className="rt-ld"><ReviewTodoMeta task={task} ledger /></div>
      <div className="rt-lf"><button type="button" className="rt-btn" onClick={() => onReopen(task)}>Reopen</button></div>
    </article>)}
  </div>;
}