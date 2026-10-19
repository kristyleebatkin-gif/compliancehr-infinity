import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersRound, Plus, Trash2, Check, X, CalendarClock, ClipboardCheck } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import HrPaperworkPanel from '@/components/hr/HrPaperworkPanel';
import AppraisalComplianceDashboard from '@/components/hr/AppraisalComplianceDashboard';
import StaffFileCompletenessWidget from '@/components/hr/StaffFileCompletenessWidget';
import HrTemplatesLibrary from '@/components/hr/HrTemplatesLibrary';
import RegisterInsights from '@/components/RegisterInsights';

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => (d ? String(d).slice(0, 10) : '');
const MANAGER_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager', 'Rostering Coordinator'];

export default function HrHub({ profile, embedded = false } = {}) {
  const [tab, setTab] = useState('leave');
  const [leaves, setLeaves] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const user = await base44.auth.me().catch(() => null);
    setMe(user);
    const scoped = !!user && !MANAGER_ROLES.includes(user.role);
    const [l, r] = await Promise.all([
      base44.entities.LeaveRequest.filter(profile ? { staff_name: profile.full_name } : scoped ? { created_by_id: user.id } : {}, { sort: '-created_date', limit: 100 }),
      base44.entities.PerformanceReview.filter(profile ? { staff_name: profile.full_name } : scoped ? { created_by_id: user.id } : {}, { sort: '-review_date', limit: 100 }),
    ]);
    setLeaves(l.items || []);
    setReviews(r.items || []);
    setLoading(false);
  }, [profile?.full_name]);

  useEffect(() => { load(); }, [load]);

  const saveLeave = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setSaving(true);
    await base44.entities.LeaveRequest.create({
      staff_name: f.get('staff_name'),
      leave_type: f.get('leave_type'),
      start_date: f.get('start_date'),
      end_date: f.get('end_date'),
      reason: f.get('reason'),
      coverage_arranged: f.get('coverage_arranged'),
      status: 'Pending',
    });
    setSaving(false);
    setShowLeaveForm(false);
    load();
  };

  const decide = async (leave, status) => {
    await base44.entities.LeaveRequest.update(leave.id, { status, decided_date: today() });
    load();
  };

  const saveReview = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setSaving(true);
    await base44.entities.PerformanceReview.create({
      staff_name: f.get('staff_name'),
      review_type: f.get('review_type'),
      review_date: f.get('review_date'),
      reviewer: f.get('reviewer'),
      status: 'Scheduled',
    });
    setSaving(false);
    setShowReviewForm(false);
    load();
  };

  const completeReview = async (review) => {
    await base44.entities.PerformanceReview.update(review.id, { status: 'Completed', next_review_date: fmt(review.next_review_date) });
    load();
  };

  const remove = async (entity, id) => { await entity.delete(id); load(); };

  const isManager = !profile && !!me && MANAGER_ROLES.includes(me.role);
  const pending = leaves.filter((l) => l.status === 'Pending');
  const scheduledReviews = reviews.filter((r) => r.status === 'Scheduled');
  const upcomingLeave = leaves.filter((l) => l.status === 'Approved' && l.end_date >= today());

  return (
    <div className={embedded ? 'min-w-0 space-y-6' : 'mx-auto min-w-0 max-w-6xl space-y-6 p-3 sm:p-4 md:p-8'}>
      {!embedded && <PageHeader
        title="HR Hub"
        subtitle="Leave management, performance reviews and workforce records in one place."
        icon={UsersRound}
        accent={['#2563eb', '#0891b2']}
      />}

      {!embedded && <RegisterInsights module="hr" />}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pending leave requests', value: pending.length, icon: CalendarClock },
          { label: 'Currently on leave / approved', value: upcomingLeave.length, icon: UsersRound },
          { label: 'Reviews scheduled', value: scheduledReviews.length, icon: ClipboardCheck },
          { label: 'Reviews completed', value: reviews.filter((r) => r.status === 'Completed').length, icon: Check },
        ].map((s) => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"><s.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="leave">Leave requests</TabsTrigger>
          <TabsTrigger value="reviews">Performance reviews</TabsTrigger>
          {isManager && <TabsTrigger value="performance">Appraisal dashboard</TabsTrigger>}
          {isManager && <TabsTrigger value="paperwork">Contracts &amp; PDs</TabsTrigger>}
          {isManager && <TabsTrigger value="file-completeness">File completeness</TabsTrigger>}
          {isManager && <TabsTrigger value="templates">Templates library</TabsTrigger>}
        </TabsList>

        <TabsContent value="leave" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowLeaveForm(!showLeaveForm)}><Plus className="mr-2 h-4 w-4" />Log leave request</Button>
            <Button size="sm" variant="outline" onClick={() => downloadCsv('leave-register.csv', [
              { label: 'Staff', key: 'staff_name' }, { label: 'Type', key: 'leave_type' }, { label: 'Start', key: 'start_date' },
              { label: 'End', key: 'end_date' }, { label: 'Status', key: 'status' }, { label: 'Coverage', key: 'coverage_arranged' },
            ], leaves)}>Export CSV</Button>
          </div>
          {showLeaveForm && (
            <Card><CardContent className="p-4">
              <form className="grid gap-3 md:grid-cols-2" onSubmit={saveLeave}>
                <div className="grid gap-1.5"><Label>Staff member *</Label><Input name="staff_name" required defaultValue={profile?.full_name || (isManager ? undefined : me?.full_name || '')} readOnly={!isManager} /></div>
                <div className="grid gap-1.5"><Label>Leave type</Label>
                  <select name="leave_type" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    {['Annual', 'Personal / Sick', "Carer's", 'Unpaid', 'Long Service', 'Study', 'Other'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid gap-1.5"><Label>Start date</Label><Input name="start_date" type="date" defaultValue={today()} /></div>
                <div className="grid gap-1.5"><Label>End date</Label><Input name="end_date" type="date" /></div>
                <div className="grid gap-1.5 md:col-span-2"><Label>Reason</Label><Input name="reason" /></div>
                <div className="grid gap-1.5 md:col-span-2"><Label>Coverage arranged</Label><Input name="coverage_arranged" placeholder="Who covers the shifts" /></div>
                <div className="flex gap-2 md:col-span-2">
                  <Button size="sm" type="submit" disabled={saving}>Save request</Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => setShowLeaveForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent></Card>
          )}
          {loading ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading...</CardContent></Card> : leaves.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No leave requests yet.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {leaves.map((l) => (
                <Card key={l.id}><CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{l.staff_name}</p>
                      <p className="text-xs text-muted-foreground">{l.leave_type} - {fmt(l.start_date)} to {fmt(l.end_date)}</p>
                      {l.coverage_arranged && <p className="mt-1 text-xs text-muted-foreground">Coverage: {l.coverage_arranged}</p>}
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${l.status === 'Approved' ? 'bg-safe/10 text-safe' : l.status === 'Declined' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{l.status}</span>
                  </div>
                  {isManager && l.status === 'Pending' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-safe text-white hover:bg-safe/90" onClick={() => decide(l, 'Approved')}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button>
                      <Button size="sm" variant="outline" className="text-danger" onClick={() => decide(l, 'Declined')}><X className="mr-1 h-3.5 w-3.5" />Decline</Button>
                    </div>
                  )}
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-3">
          <div className="flex gap-2">
            {isManager && <Button size="sm" onClick={() => setShowReviewForm(!showReviewForm)}><Plus className="mr-2 h-4 w-4" />Schedule review</Button>}
            <Button size="sm" variant="outline" onClick={() => downloadCsv('performance-reviews.csv', [
              { label: 'Staff', key: 'staff_name' }, { label: 'Type', key: 'review_type' }, { label: 'Date', key: 'review_date' },
              { label: 'Reviewer', key: 'reviewer' }, { label: 'Rating', key: 'overall_rating' }, { label: 'Outcome', key: 'outcome' }, { label: 'Status', key: 'status' },
            ], reviews)}>Export CSV</Button>
          </div>
          {showReviewForm && (
            <Card><CardContent className="p-4">
              <form className="grid gap-3 md:grid-cols-2" onSubmit={saveReview}>
                <div className="grid gap-1.5"><Label>Staff member *</Label><Input name="staff_name" required /></div>
                <div className="grid gap-1.5"><Label>Review type</Label>
                  <select name="review_type" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    {['Probation', '6-Month Review', 'Annual Review', 'Return from Leave', 'Other'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid gap-1.5"><Label>Review date</Label><Input name="review_date" type="date" defaultValue={today()} /></div>
                <div className="grid gap-1.5"><Label>Reviewer</Label><Input name="reviewer" /></div>
                <div className="flex gap-2 md:col-span-2">
                  <Button size="sm" type="submit" disabled={saving}>Schedule</Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent></Card>
          )}
          {loading ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading...</CardContent></Card> : reviews.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No reviews scheduled yet.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {reviews.map((r) => (
                <Card key={r.id}><CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{r.staff_name}</p>
                      <p className="text-xs text-muted-foreground">{r.review_type} - {fmt(r.review_date)}{r.reviewer ? ` - by ${r.reviewer}` : ''}</p>
                      {r.overall_rating ? <p className="mt-1 text-xs">Rating: {r.overall_rating}/5 {r.outcome ? `- ${r.outcome}` : ''}</p> : null}
                      {r.goals && <p className="mt-1 text-xs text-muted-foreground">Goals: {r.goals}</p>}
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${r.status === 'Completed' ? 'bg-safe/10 text-safe' : r.status === 'Cancelled' ? 'bg-muted text-muted-foreground' : 'bg-warning/10 text-warning'}`}>{r.status}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {isManager && r.status !== 'Completed' && <Button size="sm" variant="outline" onClick={() => completeReview(r)}>Mark completed</Button>}
                    {isManager && <Button size="sm" variant="ghost" className="text-danger" onClick={() => remove(base44.entities.PerformanceReview, r.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isManager && <TabsContent value="performance" className="mt-4"><AppraisalComplianceDashboard /></TabsContent>}
        {isManager && <TabsContent value="paperwork" className="mt-4"><HrPaperworkPanel /></TabsContent>}
        {isManager && <TabsContent value="file-completeness" className="mt-4"><StaffFileCompletenessWidget /></TabsContent>}
        {isManager && <TabsContent value="templates" className="mt-4"><HrTemplatesLibrary /></TabsContent>}
      </Tabs>
    </div>
  );
}