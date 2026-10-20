import React from 'react';

export default function SharedTodoTaskMeta({ task: t, stage }) {
  return <div className="tcb-meta">
    <span><strong>Module</strong> · {t.module || 'General'}</span>
    {stage === 'pending' && t.due_date && <span><strong>Due</strong> · {t.due_date}</span>}
    {t.task_date && <span><strong>Date</strong> · {t.task_date}{t.task_time ? ` ${t.task_time}` : ''}</span>}
    {stage !== 'pending' && t.due_date && <span><strong>Due</strong> · {t.due_date}</span>}
    {t.responsible?.length > 0 && <span><strong>Responsible:</strong> {t.responsible.join(', ')}</span>}
    {t.completed_by && <span><strong>Completed by</strong> · {t.completed_by}</span>}
    {t.completed_date && <span><strong>Completed</strong> · {t.completed_date}</span>}
    {!!t.time_taken_minutes && <span><strong>Time taken</strong> · {t.time_taken_minutes} min</span>}
    {t.signed_off_by && <span><strong>Signed off by</strong> · {t.signed_off_by}</span>}
    {t.signed_off_date && <span><strong>Signed off</strong> · {t.signed_off_date}</span>}
    {stage === 'pending' && <span><strong>Shared by</strong> · {t.shared_by || 'unknown'}</span>}
    {t.how_to_complete && <span><strong>How to complete:</strong> {t.how_to_complete}</span>}
    {t.resources_needed && <span><strong>Resources needed:</strong> {t.resources_needed}</span>}
    {t.important_info && <span><strong>Important info:</strong> {t.important_info}</span>}
  </div>;
}