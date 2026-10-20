import React from 'react';
import { ClipboardList, Download, Loader2, Plus } from 'lucide-react';
import SharedTodoTaskCard from '@/components/tasks/SharedTodoTaskCard';
import '@/components/tasks/sharedTodoCommandBoard.css';

export default function SharedTodoCommandBoard({ pending, awaiting, finalised, loading, canSign, onNew, onExport, onFinalise, onSign, onReopen }) {
  const lanes = [
    { stage: 'pending', title: 'Pending', tasks: pending, empty: 'No pending to-dos.' },
    { stage: 'await', title: 'Awaiting manager sign-off', tasks: awaiting, empty: 'No tasks awaiting sign-off.' },
    { stage: 'done', title: 'Finalised task table', tasks: finalised, empty: 'No finalised to-dos yet.' },
  ];
  return <section id="shared-todo-command-board" className="team-command-board" aria-label="Shared To-do List">
    <div className="tcb-top">
      <div className="tcb-heading"><div className="tcb-mark"><ClipboardList aria-hidden="true" /></div><div><h2 className="tcb-title">Shared To-do List</h2><p className="tcb-sub">Share, complete and sign off team actions.</p></div></div>
      <div className="tcb-actions"><button type="button" className="tcb-btn" onClick={onExport}><Download aria-hidden="true" />Export</button><button type="button" className="tcb-btn tcb-primary" onClick={onNew}><Plus aria-hidden="true" />New shared to-do</button></div>
    </div>
    <div className="tcb-lanes">
      {lanes.map(({ stage, title, tasks, empty }) => <section key={stage} className={`tcb-lane ${stage === 'pending' ? '' : `tcb-${stage}`}`}>
        <div className="tcb-lanehead"><h3 className="tcb-lanetitle">{title}</h3><span className="tcb-count">{loading ? '…' : tasks.length}</span></div>
        {stage === 'done' && <div className="tcb-tableheads"><span>Task</span><span>Module</span><span>Due</span></div>}
        <div className="tcb-cards">
          {loading ? <p role="status" className="tcb-empty"><Loader2 className="h-4 w-4 animate-spin" />Loading tasks...</p> : tasks.map((task) => <SharedTodoTaskCard key={task.id} {...{ task, stage, canSign, onFinalise, onSign, onReopen }} />)}
          {!loading && !tasks.length && <p className="tcb-empty">{empty}</p>}
        </div>
        {stage === 'await' && <p className="tcb-lanefoot">Completed by</p>}
      </section>)}
    </div>
  </section>;
}