import React from 'react';

export default function ReviewTodoMeta({ task: t, ledger = false }) {
  return <>
    <div className="rt-meta">
      {!ledger && <span><b>Module</b> · {t.module || 'General'}</span>}
      {t.task_date && <span><b>Date</b> · {t.task_date}{t.task_time ? ` ${t.task_time}` : ''}</span>}
      {!t.task_date && t.task_time && <span><b>Time</b> · {t.task_time}</span>}
      {!ledger && t.due_date && <span><b>Due</b> · {t.due_date}</span>}
      {!!t.responsible?.length && <span><b>Responsible:</b> {t.responsible.join(', ')}</span>}
      {t.completed_by && <span><b>Completed by</b> · {t.completed_by}</span>}
      {!ledger && t.completed_date && <span><b>Completed</b> · {t.completed_date}</span>}
      {!!t.time_taken_minutes && <span><b>Time taken</b> · {t.time_taken_minutes} min</span>}
      {t.signed_off_by && <span><b>Signed off by</b> · {t.signed_off_by}</span>}
      {!ledger && t.signed_off_date && <span><b>Signed off</b> · {t.signed_off_date}</span>}
      {t.status === 'Pending' && <span><b>Shared by</b> · {t.shared_by || 'unknown'}</span>}
    </div>
    {(t.how_to_complete || t.resources_needed || t.important_info) && <div className="rt-det">
      {t.how_to_complete && <span><b>How to complete:</b> {t.how_to_complete}</span>}
      {t.resources_needed && <span><b>Resources needed:</b> {t.resources_needed}</span>}
      {t.important_info && <span><b>Important info:</b> {t.important_info}</span>}
    </div>}
  </>;
}