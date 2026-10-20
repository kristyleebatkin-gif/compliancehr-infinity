import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Plus } from 'lucide-react';
import ReviewTodoCard from '@/components/tasks/ReviewTodoCard';
import ReviewTodoLedger from '@/components/tasks/ReviewTodoLedger';
import '@/components/tasks/reviewTodoDashboard.css';

export default function ReviewTodoBoard({ pending, awaiting, finalised, loading, canSign, onNew, onExport, onFinalise, onSign, onReopen }) {
  return <div className="review-todo-page">
    <header className="rt-mast">
      <div><h1>Shared To-do Dashboard</h1><p>Share team actions, track completion and review manager sign-off.</p></div>
      <div className="rt-stack">
        <Link className="rt-btn" to="/tasks"><ArrowLeft strokeWidth={2.4} />Task dashboard</Link>
        <button className="rt-btn" type="button" onClick={onExport}><Download strokeWidth={2.4} />Export</button>
        <button className="rt-btn rt-pri" type="button" onClick={onNew}><Plus strokeWidth={2.6} />New shared to-do</button>
      </div>
    </header>
    <section className="rt-sec rt-first" aria-label="Awaiting manager sign-off">
      <div className="rt-sh"><h2>Shared To-do List</h2></div><p className="rt-note rt-intro">Share, complete and sign off team actions.</p>
      <div className="rt-sh"><h2>Awaiting manager sign-off</h2><span className="rt-cnt">{loading ? '…' : awaiting.length}</span></div>
      {loading ? <p role="status" className="rt-note">Loading tasks...</p> : awaiting.length ? awaiting.map((task) => <ReviewTodoCard key={task.id} {...{ task, canSign, onFinalise, onSign }} awaiting />) : <p className="rt-note">No tasks awaiting sign-off.</p>}
    </section>
    <section className="rt-sec rt-s2" aria-label="Pending">
      <div className="rt-sh"><h2>Pending</h2><span className="rt-cnt rt-q">{loading ? '…' : pending.length}</span></div>
      {loading ? <p role="status" className="rt-note">Loading tasks...</p> : pending.length ? <div className="rt-grid">{pending.map((task) => <ReviewTodoCard key={task.id} {...{ task, canSign, onFinalise, onSign }} />)}</div> : <p className="rt-note">No pending to-dos.</p>}
    </section>
    <section className="rt-sec rt-s3" aria-label="Finalised task table">
      <div className="rt-sh"><h2>Finalised task table</h2><span className="rt-cnt rt-q">{loading ? '…' : finalised.length}</span></div>
      {loading ? <p role="status" className="rt-note">Loading tasks...</p> : finalised.length ? <ReviewTodoLedger tasks={finalised} onReopen={onReopen} /> : <p className="rt-note">No finalised to-dos yet.</p>}
    </section>
  </div>;
}