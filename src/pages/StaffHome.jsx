import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { logUserAction } from '@/lib/actionLog';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import TaskEditDialog from '@/components/mywork/TaskEditDialog';
import ParticipantHome from '@/pages/ParticipantHome';
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, ArrowRight, FilePlus2, ShieldAlert, MessageSquareWarning, UserRound, Pencil, ThumbsUp, Target, GraduationCap, Users, Megaphone, ReceiptText, Phone } from 'lucide-react';
import { format } from 'date-fns';

const today = () => new Date().toISOString().slice(0, 10);

function StatusPill({ status }) {
  const tone = status === 'Completed' ? 'bg-safe/10 text-safe'
    : status === 'Overdue' ? 'bg-danger/10 text-danger'
    : status === 'In Progress' ? 'bg-teal/10 text-teal'
    : 'bg-muted text-foreground/60';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>;
}

export default function StaffHome({ embedded = false } = {}) {
  const [me, setMe] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [risks, setRisks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [goals, setGoals] = useState([]);
  const [myParticipants, setMyParticipants] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  const load = useCallback(async (user) => {
    try {
      const [taskPage, incidentPage, riskPage, issuePage, feedbackPage, trainingPage, participantPage, profilePage, contactPage, receiptPage] = await Promise.allSettled([
        base44.entities.TodoTask.filter(
          { archived: { $ne: true }, $or: [{ assigned_to: user.full_name }, { assigned_email: user.email }] },
          { sort: 'due_date', limit: 200 }
        ),
        base44.entities.Incident.filter({ reported_by: user.full_name }, { sort: '-created_date', limit: 10 }),
        base44.entities.Risk.filter({ created_by_id: user.id }, { sort: '-created_date', limit: 10 }),
        base44.entities.IssueConcernBarrier.filter({ created_by_id: user.id }, { sort: '-created_date', limit: 10 }),
        base44.entities.Feedback.filter({ created_by_id: user.id }, { sort: '-created_date', limit: 10 }),
        base44.entities.TrainingCompletion.filter(
          { $or: [{ employee_name: user.full_name }, { learner_name: user.full_name }] },
          { sort: '-completed_date', limit: 20 }
        ),
        base44.entities.ParticipantProfile.filter({ support_team: user.full_name }, { sort: 'full_name', limit: 20 }),
        base44.entities.StaffProfile.filter({ email: user.email }, { limit: 1 }),
        base44.entities.KeyBusinessContact.filter({ archived: { $ne: true } }, { sort: 'slot_number', limit: 10 }),
        base44.entities.Receipt.filter({ created_by_id: user.id }, { sort: '-created_date', limit: 10 }),
      ]);
      if (taskPage.status === 'fulfilled') setTasks(taskPage.value.items || []);
      if (incidentPage.status === 'fulfilled') setIncidents(incidentPage.value.items || []);
      if (riskPage.status === 'fulfilled') setRisks(riskPage.value.items || []);
      if (issuePage.status === 'fulfilled') setIssues(issuePage.value.items || []);
      if (feedbackPage.status === 'fulfilled') setFeedbacks(feedbackPage.value.items || []);
      if (trainingPage.status === 'fulfilled') setTrainings(trainingPage.value.items || []);
      if (participantPage.status === 'fulfilled') setMyParticipants(participantPage.value.items || []);
      if (contactPage.status === 'fulfilled') setContacts(contactPage.value.items || []);
      if (receiptPage.status === 'fulfilled') setReceipts(receiptPage.value.items || []);
      const prof = profilePage.status === 'fulfilled' ? (profilePage.value.items || [])[0] || null : null;
      setProfile(prof);
      // Participant goals for the participants this staff member supports
      if (prof && (prof.participant_team || []).length > 0) {
        const goalPage = await base44.entities.Goal.filter(
          { participant_name: { $in: prof.participant_team } },
          { sort: '-created_date', limit: 20 }
        );
        setGoals(goalPage.items || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    base44.auth.me().then((user) => { setMe(user); return load(user); }).catch(() => setLoading(false));
  }, [load]);

  // Participants get their own personal dashboard at the same My Work address.
  if (me && me.role === 'Participant') return <ParticipantHome me={me} />;

  const openTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
  const dueToday = openTasks.filter((t) => t.due_date === today());
  const overdue = openTasks.filter((t) => t.due_date && t.due_date < today());

  const toggle = async (t) => {
    const completing = t.status !== 'Completed';
    await base44.entities.TodoTask.update(t.id, {
      status: completing ? 'Completed' : 'Open',
      completed_date: completing ? today() : undefined,
    });
    logUserAction(completing ? 'Task Completed' : 'Task Reopened', 'Task', { record_id: t.id, record_title: t.title });
    if (me) load(me);
  };

  const firstName = (me?.full_name || '').split(' ')[0];
  const fmt = (d) => d ? format(new Date(d), 'EEE d MMM') : '';

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-6">
      {embedded ? (
        <div className="flex flex-wrap gap-2">
          <Link to="/incidents/submit" className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand/90"><FilePlus2 className="h-4 w-4" />Report an Incident</Link>
          <Link to="/risks/submit" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"><ShieldAlert className="h-4 w-4" />Report a Risk</Link>
          <Link to="/issues/submit" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"><MessageSquareWarning className="h-4 w-4" />Report an Issue</Link>
        </div>
      ) : (
        <PageHeader
          title={firstName ? `Hi ${firstName}` : 'My Work'}
          subtitle="Your personal view: your tasks, your incident, risk and issue reports, and your profile."
          action={
            <div className="flex flex-wrap gap-2">
              <Link to="/incidents/submit" className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand/90"><FilePlus2 className="h-4 w-4" />Report an Incident</Link>
              <Link to="/risks/submit" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"><ShieldAlert className="h-4 w-4" />Report a Risk</Link>
              <Link to="/issues/submit" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"><MessageSquareWarning className="h-4 w-4" />Report an Issue</Link>
            </div>
          }
        />
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center"><div className="text-2xl font-bold text-brand tabular-nums">{openTasks.length}</div><div className="text-xs font-medium text-foreground/50">Open tasks</div></div>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center"><div className="text-2xl font-bold text-warning tabular-nums">{dueToday.length}</div><div className="text-xs font-medium text-foreground/50">Due today</div></div>
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-center"><div className="text-2xl font-bold text-danger tabular-nums">{overdue.length}</div><div className="text-xs font-medium text-foreground/50">Overdue</div></div>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My tasks</h2>
          <Link to="/tasks" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Full task dashboard<ArrowRight className="h-3 w-3" /></Link>
        </div>
        {loading ? (
          <div className="py-10 text-center text-sm text-foreground/40">Loading...</div>
        ) : openTasks.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All clear" message="No open tasks assigned to you right now." />
        ) : (
          <div className="space-y-2">
            {openTasks.map((t) => {
              const late = t.due_date && t.due_date < today();
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <button onClick={() => toggle(t)} title="Mark complete" className="shrink-0">
                    <Circle className="h-5 w-5 text-foreground/30 hover:text-safe" />
                  </button>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditingTask(t)} title="Click to edit">
                    <div className="text-sm font-medium hover:text-brand">{t.title}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                      {t.priority === 'Urgent' || t.priority === 'High' ? <span className="rounded-full bg-danger/10 px-2 py-0.5 font-medium text-danger">{t.priority}</span> : null}
                      {t.due_date && <span className={`flex items-center gap-1 ${late ? 'font-semibold text-danger' : ''}`}><Clock className="h-3 w-3" />{late ? 'Overdue: ' : ''}{fmt(t.due_date)}</span>}
                    </div>
                  </div>
                  <StatusPill status={t.status} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My incident reports</h2>
          <Link to="/incidents/submit" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Submit new<Plus className="h-3 w-3" /></Link>
        </div>
        {incidents.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No incidents reported" message="When you report an incident it will appear here with its status." />
        ) : (
          <div className="space-y-2">
            {incidents.map((i) => (
              <Link key={i.id} to={`/incidents/${i.id}`} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/30">
                <AlertTriangle className={`h-5 w-5 shrink-0 ${i.severity === 'Critical' || i.severity === 'High' ? 'text-danger' : 'text-warning'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.title}</div>
                  <div className="text-xs text-foreground/50">{i.incident_id || ''}{i.date_occurred ? ` · ${fmt(i.date_occurred)}` : ''}</div>
                </div>
                <StatusPill status={i.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My risks</h2>
          <Link to="/risks/submit" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Submit new<Plus className="h-3 w-3" /></Link>
        </div>
        {risks.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No risks reported" message="When you report a risk, hazard or near miss it will appear here with its status." />
        ) : (
          <div className="space-y-2">
            {risks.map((r) => (
              <Link key={r.id} to="/risks" className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/30">
                <ShieldAlert className={`h-5 w-5 shrink-0 ${r.rating === 'Critical' || r.rating === 'High' ? 'text-danger' : 'text-warning'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-foreground/50">{r.risk_id || ''}{r.identified_date ? ` · ${fmt(r.identified_date)}` : ''}{r.report_type ? ` · ${r.report_type}` : ''}</div>
                </div>
                <StatusPill status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My issues &amp; concerns</h2>
          <Link to="/issues/submit" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Submit new<Plus className="h-3 w-3" /></Link>
        </div>
        {issues.length === 0 ? (
          <EmptyState icon={MessageSquareWarning} title="No issues raised" message="When you raise an issue, concern or barrier it will appear here with management's follow-up." />
        ) : (
          <div className="space-y-2">
            {issues.map((i) => (
              <div key={i.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.issue}</div>
                  <div className="text-xs text-foreground/50">{i.date ? fmt(i.date) : ''}{i.potential_solution ? ' · Your suggestion recorded' : ''}{i.management_follow_up ? ' · Management follow-up received' : ''}</div>
                  {i.management_follow_up && <div className="mt-1 text-xs text-foreground/60"><span className="font-medium">Follow-up:</span> {i.management_follow_up}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My feedback</h2>
          <Link to="/feedback/submit" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Submit new<Plus className="h-3 w-3" /></Link>
        </div>
        {feedbacks.length === 0 ? (
          <EmptyState icon={ThumbsUp} title="No feedback yet" message="When you share feedback or a complaint it will appear here with its status." />
        ) : (
          <div className="space-y-2">
            {feedbacks.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                <ThumbsUp className={`h-5 w-5 shrink-0 ${f.type === 'Complaint' ? 'text-warning' : 'text-safe'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{f.subject}</div>
                  <div className="text-xs text-foreground/50">{f.type}{f.received_date ? ` · ${fmt(f.received_date.slice(0, 10))}` : ''}</div>
                </div>
                <StatusPill status={f.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My training</h2>
          <Link to="/training" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Training centre<ArrowRight className="h-3 w-3" /></Link>
        </div>
        {trainings.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No training completed yet" message="Modules you complete will appear here with scores and expiry dates." />
        ) : (
          <div className="space-y-2">
            {trainings.map((t) => {
              const expired = t.expiry_date && t.expiry_date < today();
              const expiring = !expired && t.expiry_date && t.expiry_date <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <GraduationCap className="h-5 w-5 shrink-0 text-teal" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{t.module_title}</div>
                    <div className="text-xs text-foreground/50">
                      {t.completed_date ? `Completed ${fmt(t.completed_date)}` : ''}
                      {t.score != null ? ` · Score ${t.score}%` : ''}
                      {t.expiry_date ? ` · ${expired ? 'Expired ' : 'Expires '}${fmt(t.expiry_date)}` : ''}
                    </div>
                  </div>
                  {expired ? <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">Expired</span>
                    : expiring ? <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Expiring soon</span>
                    : <span className="rounded-full bg-safe/10 px-2 py-0.5 text-xs font-medium text-safe">Current</span>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Key contacts</h2>
          <Link to="/contacts" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Contacts module<ArrowRight className="h-3 w-3" /></Link>
        </div>
        {contacts.length === 0 ? (
          <EmptyState icon={Users} title="No contacts yet" message="Key personnel contacts will appear here." />
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                <Users className="h-5 w-5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.full_name}</div>
                  <div className="truncate text-xs text-foreground/50">{c.role_title || ''}{c.email ? ` · ${c.email}` : ''}</div>
                </div>
                {c.phone && <a href={`tel:${c.phone}`} className="shrink-0 rounded-lg border border-border p-2 text-brand hover:bg-muted" title={`Call ${c.full_name}`}><Phone className="h-4 w-4" /></a>}
              </div>
            ))}
          </div>
        )}
      </section>

      <Link to="/communications" className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/30">
        <Megaphone className="h-5 w-5 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">Communication Centre</div>
          <div className="text-xs text-foreground/50">Diary, inbox, professional email, broadcasts and team feeds.</div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30" />
      </Link>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My receipts</h2>
          <Link to="/receipts" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Receipt Hub<ArrowRight className="h-3 w-3" /></Link>
        </div>
        {receipts.length === 0 ? (
          <EmptyState icon={ReceiptText} title="No receipts yet" message="Receipts you submit for reimbursement will appear here with their status." />
        ) : (
          <div className="space-y-2">
            {receipts.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                <ReceiptText className={`h-5 w-5 shrink-0 ${r.reimbursed ? 'text-safe' : 'text-warning'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.description}</div>
                  <div className="text-xs text-foreground/50">{r.merchant || ''}{r.date ? ` · ${fmt(r.date)}` : ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">${(r.amount || 0).toFixed(2)}</div>
                  <div className="text-xs text-foreground/50">{r.reimbursed ? 'Reimbursed' : 'Awaiting reimbursement'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My participants</h2>
          <Link to="/participants" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Participants module<ArrowRight className="h-3 w-3" /></Link>
        </div>
        {myParticipants.length === 0 ? (
          <EmptyState icon={Users} title="No participants yet" message="Participants you support will appear here with links to their profiles." />
        ) : (
          <div className="space-y-2">
            {myParticipants.map((p) => (
              <Link key={p.id} to={`/participants/${p.id}`} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/30">
                <Users className="h-5 w-5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.full_name}</div>
                  <div className="truncate text-xs text-foreground/50">{p.support_type || ''}{p.status ? ` · ${p.status}` : ''}</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My participant goals</h2>
          <Link to="/goals" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Goals module<ArrowRight className="h-3 w-3" /></Link>
        </div>
        {goals.length === 0 ? (
          <EmptyState icon={Target} title="No goals yet" message="Goals for the participants you support will appear here with progress." />
        ) : (
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id} className="rounded-xl border border-border/60 bg-card p-3.5">
                <div className="flex items-start gap-3">
                  <Target className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{g.goal}</div>
                    <div className="text-xs text-foreground/50">{g.participant_name}{g.category ? ` · ${g.category}` : ''}{g.target_date ? ` · Target ${fmt(g.target_date)}` : ''}</div>
                  </div>
                  <StatusPill status={g.status} />
                </div>
                <div className="mt-2 flex items-center gap-2 pl-8">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(0, g.progress || 0))}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground/60 tabular-nums">{g.progress || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My employee profile</h2>
          <Link to="/my-profile" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Pencil className="h-3 w-3" />View &amp; edit</Link>
        </div>
        <Link to="/my-profile" className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/30">
          <UserRound className="h-5 w-5 shrink-0 text-brand" />
          {profile ? (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{profile.full_name}</div>
              <div className="truncate text-xs text-foreground/50">{profile.email}{profile.phone ? ` · ${profile.phone}` : ''}{profile.position ? ` · ${profile.position}` : ''}</div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Profile not set up yet</div>
              <div className="text-xs text-foreground/50">Ask HR to create your staff profile, then you can update it here.</div>
            </div>
          )}
        </Link>
      </section>

      <TaskEditDialog task={editingTask} open={!!editingTask} onClose={() => setEditingTask(null)} onSaved={() => me && load(me)} />
    </div>
  );
}