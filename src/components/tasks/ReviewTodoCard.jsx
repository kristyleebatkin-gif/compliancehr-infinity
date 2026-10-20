import React from 'react';
import ReviewTodoMeta from '@/components/tasks/ReviewTodoMeta';

export default function ReviewTodoCard({ task, awaiting = false, canSign, onFinalise, onSign }) {
  return <article className={`rt-card${awaiting ? ' rt-wide' : ''}`}>
    <div className="rt-row"><p className="rt-tn">{task.title}</p><span className={`rt-bd${awaiting ? '' : ' rt-outline'}`}>{awaiting ? 'Awaiting sign-off' : task.status}</span></div>
    <ReviewTodoMeta task={task} />
    <div className="rt-foot">
      {awaiting ? canSign && <button type="button" className="rt-btn rt-pri" onClick={() => onSign(task)}>Review &amp; sign off</button> : <button type="button" className="rt-btn" onClick={() => onFinalise(task)}>Finalise</button>}
    </div>
  </article>;
}