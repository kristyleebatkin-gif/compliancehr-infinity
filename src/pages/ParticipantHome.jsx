import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import {
  UserRound, CalendarClock, Target, AlertTriangle, ShieldAlert, MessageSquareWarning,
  ThumbsUp, FolderOpen, Users, Siren, ArrowRight, Phone, Megaphone,
} from 'lucide-react';
import { format } from 'date-fns';

const fmt = (d) => d ? format(new Date(d), 'EEE d MMM') : '';

function StatusPill({ status }) {
  const tone = ['Completed', 'Achieved', 'Received', 'Verified', 'Resolved', 'Closed', 'Approved'].includes(status) ? 'bg-safe/10 text-safe'
    : ['Overdue', 'Expired', 'Rejected'].includes(status) ? 'bg-danger/10 text-danger'
    : ['In Progress', 'Under Investigation', 'Treating', 'Pending Review'].includes(status) ? 'bg-teal/10 text-teal'
    : 'bg-muted text-foreground/60';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>;
}

function Section({ icon: Icon, title, linkTo, linkLabel, emptyIcon, emptyTitle, emptyMessage, loading, count, children }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {linkTo && <Link to={linkTo} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">{linkLabel}<ArrowRight className="h-3 w-3" /></Link>}
      </div>
      {loading ? (
        <div className="py-8 text-center text-sm text-foreground/40">Loading...</div>
      ) : count === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />
      ) : children}
    </section>
  );
}

export default function ParticipantHome({ me }) {
  const [profile, setProfile] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [risks, setRisks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [profilePage, shiftPage, incidentPage, riskPage, issuePage, feedbackPage, contactPage] = await Promise.allSettled([
        base44.entities.ParticipantProfile.filter({ email: me.email }, { limit: 1 }),
        base44.entities.ParticipantShiftDetail.filter({ participant_user_id: me.id }, { sort: '-shift_date', limit: 20 }),
        base44.entities.Incident.filter({ created_by_id: me.id }, { sort: '-created_date', limit: 10 }),
        base44.entities.Risk.filter({ created_by_id: me.id }, { sort: '-created_date', limit: 10 }),
        base44.entities.IssueConcernBarrier.filter({ created_by_id: me.id }, { sort: '-created_date', limit: 10 }),
        base44.entities.Feedback.filter({ created_by_id: me.id }, { sort: '-created_date', limit: 10 }),
        base44.entities.KeyBusinessContact.filter({ archived: { $ne: true } }, { sort: 'slot_number', limit: 10 }),
      ]);
      if (shiftPage.status === 'fulfilled') setShifts(shiftPage.value.items || []);
      if (incidentPage.status === 'fulfilled') setIncidents(incidentPage.value.items || []);
      if (riskPage.status === 'fulfilled') setRisks(riskPage.value.items || []);
      if (issuePage.status === 'fulfilled') setIssues(issuePage.value.items || []);
      if (feedbackPage.status === 'fulfilled') setFeedbacks(feedbackPage.value.items || []);
      if (contactPage.status === 'fulfilled') setContacts(contactPage.value.items || []);
      const prof = profilePage.status === 'fulfilled' ? (profilePage.value.items || [])[0] || null : null;
      setProfile(prof);
      if (prof) {
        const [goalPage, docPage] = await Promise.allSettled([
          base44.entities.Goal.filter({ participant_name: prof.full_name }, { sort: '-created_date', limit: 20 }),
          base44.entities.ParticipantDocument.filter({ participant_user_id: me.id }, { sort: '-created_date', limit: 20 }),
        ]);
        if (goalPage.status === 'fulfilled') setGoals(goalPage.value.items || []);
        if (docPage.status === 'fulfilled') setDocuments(docPage.value.items || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [me?.id, me?.email]);

  useEffect(() => { if (me) load(); }, [me, load]);

  const firstName = (me?.full_name || '').split(' ')[0];

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-6">
      <PageHeader
        title={firstName ? `Hi ${firstName}` : 'My Work'}
        subtitle="Your personal view: your profile, shifts, goals, documents and your reports."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/incidents/submit" className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand/90"><AlertTriangle className="h-4 w-4" />Report an Incident</Link>
            <Link to="/risks/submit" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"><ShieldAlert className="h-4 w-4" />Report a Risk</Link>
            <Link to="/issues/submit" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"><MessageSquareWarning className="h-4 w-4" />Report an Issue</Link>
          </div>
        }
      />

      <Section icon={UserRound} title="My profile" linkTo={null} emptyIcon={UserRound} emptyTitle="Profile not set up yet" emptyMessage="Your support team will set up your profile, then it will appear here." loading={loading} count={profile ? 1 : 0}>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-sm font-semibold">{profile.full_name}</div>
              <div className="text-xs text-foreground/50">{profile.phone || ''}{profile.address ? ` · ${profile.address}` : ''}</div>
              <div className="text-xs text-foreground/50">NDIS number: {profile.ndis_number || '—'}{profile.support_type ? ` · Support: ${profile.support_type}` : ''}</div>
              {profile.about_me && <div className="text-xs text-foreground/60">{profile.about_me}</div>}
            </div>
            <StatusPill status={profile.status || 'Active'} />
          </div>
        </div>
      </Section>

      <Section icon={CalendarClock} title="My rostered shifts" emptyIcon={CalendarClock} emptyTitle="No shifts yet" emptyMessage="Your rostered shifts will appear here with times and your support worker." loading={loading} count={shifts.length}>
        <div className="space-y-2">
          {shifts.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
              <CalendarClock className="h-5 w-5 shrink-0 text-teal" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{fmt(s.shift_date)} · {s.start_time} – {s.end_time}</div>
                <div className="truncate text-xs text-foreground/50">{s.shift_type || ''}{s.location ? ` · ${s.location}` : ''}{s.staff_name ? ` · With ${s.staff_name}` : ''}</div>
              </div>
              <StatusPill status={s.status} />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Target} title="My goals" emptyIcon={Target} emptyTitle="No goals yet" emptyMessage="Goals set with your support team will appear here with progress." loading={loading} count={goals.length}>
        <div className="space-y-2">
          {goals.map((g) => (
            <div key={g.id} className="rounded-xl border border-border/60 bg-card p-3.5">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{g.goal}</div>
                  <div className="text-xs text-foreground/50">{g.category || ''}{g.target_date ? ` · Target ${fmt(g.target_date)}` : ''}</div>
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
      </Section>

      <Section icon={FolderOpen} title="My document vault" emptyIcon={FolderOpen} emptyTitle="No documents yet" emptyMessage="Documents shared with you will appear here to view or download." loading={loading} count={documents.length}>
        <div className="space-y-2">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
              <FolderOpen className="h-5 w-5 shrink-0 text-brand" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{d.title || d.document_type}</div>
                <div className="text-xs text-foreground/50">{d.document_type}{d.uploaded_date ? ` · Uploaded ${fmt(d.uploaded_date)}` : ''}</div>
              </div>
              {d.file_url ? (
                <a href={d.file_url} target="_blank" rel="noreferrer" className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-brand hover:bg-muted">Open</a>
              ) : null}
              <StatusPill status={d.status} />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={AlertTriangle} title="My incident reports" linkTo="/incidents/submit" linkLabel="Submit new" emptyIcon={AlertTriangle} emptyTitle="No incidents reported" emptyMessage="When you report an incident it will appear here with its status." loading={loading} count={incidents.length}>
        <div className="space-y-2">
          {incidents.map((i) => (
            <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
              <AlertTriangle className={`h-5 w-5 shrink-0 ${i.severity === 'Critical' || i.severity === 'High' ? 'text-danger' : 'text-warning'}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{i.title}</div>
                <div className="text-xs text-foreground/50">{i.date_occurred ? fmt(i.date_occurred) : ''}</div>
              </div>
              <StatusPill status={i.status} />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={ShieldAlert} title="My risk reports" linkTo="/risks/submit" linkLabel="Submit new" emptyIcon={ShieldAlert} emptyTitle="No risks reported" emptyMessage="When you report a risk, hazard or near miss it will appear here with its status." loading={loading} count={risks.length}>
        <div className="space-y-2">
          {risks.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
              <ShieldAlert className={`h-5 w-5 shrink-0 ${r.rating === 'Critical' || r.rating === 'High' ? 'text-danger' : 'text-warning'}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="text-xs text-foreground/50">{r.identified_date ? fmt(r.identified_date) : ''}{r.report_type ? ` · ${r.report_type}` : ''}</div>
              </div>
              <StatusPill status={r.status} />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={MessageSquareWarning} title="My issues &amp; concerns" linkTo="/issues/submit" linkLabel="Submit new" emptyIcon={MessageSquareWarning} emptyTitle="No issues raised" emptyMessage="When you raise an issue, concern or barrier it will appear here with management's follow-up." loading={loading} count={issues.length}>
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
      </Section>

      <Section icon={ThumbsUp} title="My feedback" linkTo="/feedback/submit" linkLabel="Submit new" emptyIcon={ThumbsUp} emptyTitle="No feedback yet" emptyMessage="When you share feedback or a complaint it will appear here with its status." loading={loading} count={feedbacks.length}>
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
      </Section>

      <Section icon={Siren} title="Emergency" emptyIcon={Siren} emptyTitle="No emergency contacts recorded" emptyMessage="Your emergency contact will appear here once your support team records it." loading={loading} count={profile && (profile.emergency_contact || profile.emergency_contact_phone) ? 1 : 0}>
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <div className="flex items-start gap-3">
            <Siren className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-danger">In an emergency call 000</div>
              <div className="mt-1 text-sm">Emergency contact: <span className="font-medium">{profile.emergency_contact || '—'}</span></div>
              {profile.emergency_contact_phone && (
                <a href={`tel:${profile.emergency_contact_phone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"><Phone className="h-3 w-3" />{profile.emergency_contact_phone}</a>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Users} title="Key contacts" emptyIcon={Users} emptyTitle="No contacts yet" emptyMessage="Key personnel contacts will appear here." loading={loading} count={contacts.length}>
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
      </Section>

      <Link to="/communications" className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:bg-muted/30">
        <Megaphone className="h-5 w-5 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">Communication Centre</div>
          <div className="text-xs text-foreground/50">Messages, diary and announcements from your support team.</div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30" />
      </Link>
    </div>
  );
}