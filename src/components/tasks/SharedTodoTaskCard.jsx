import React from 'react';
import SharedTodoTaskMeta from '@/components/tasks/SharedTodoTaskMeta';

export default function SharedTodoTaskCard({ task, stage, canSign, onFinalise, onSign, onReopen }) {
  return <article className={`tcb-task ${stage === 'done' ? 'tcb-finaltask' : ''}`}>
    <div className="tcb-row"><p className="tcb-taskname">{task.title}</p><span className="tcb-badge">{stage === 'await' ? 'Awaiting sign-off' : task.status}</span></div>
    <SharedTodoTaskMeta task={task} stage={stage} />
    <div className="tcb-taskfoot">
      {stage === 'pending' && <button type="button" className="tcb-btn tcb-smallbtn" onClick={() => onFinalise(task)}>Finalise</button>}
      {stage === 'await' && canSign && <button type="button" className="tcb-btn tcb-smallbtn" onClick={() => onSign(task)}>Review &amp; sign off</button>}
      {stage === 'done' && <><span className="tcb-signed">{task.signed_off_by ? 'Signed off' : 'Finalised'}</span><button type="button" className="tcb-btn tcb-smallbtn" onClick={() => onReopen(task)}>Reopen</button></>}
    </div>
  </article>;
}