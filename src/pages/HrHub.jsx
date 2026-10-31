import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { UsersRound, Plus, Trash2, Check, X, CalendarClock, ClipboardCheck, Download } from 'lucide-react';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import HrPaperworkPanel from '@/components/hr/HrPaperworkPanel';
import AppraisalComplianceDashboard from '@/components/hr/AppraisalComplianceDashboard';
import StaffFileCompletenessWidget from '@/components/hr/StaffFileCompletenessWidget';
import HrTemplatesLibrary from '@/components/hr/HrTemplatesLibrary';
import PayrollHub from '@/components/payroll/PayrollHub';
import HrDashboardNavigation from '@/components/hr/HrDashboardNavigation';
import HrEmployeeFiles from '@/components/hr/HrEmployeeFiles';
import MyPayroll from '@/components/payroll/MyPayroll';
import MasterSkillsAndInstructionsStudio from '@/components/training/MasterSkillsAndInstructionsStudio';
import Volunteers from '@/pages/Volunteers';
import HrMediaGoalsHobbiesHub from '@/components/hr/HrMediaGoalsHobbiesHub';
import ShorelineCommandCenter from '@/components/hr/ShorelineCommandCenter';

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => (d ? String(d).slice(0, 10) : '');
const MANAGER_ROLES = ['admin', 'Provider Administrator', 'Management', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager', 'Rostering Coordinator'];

export default function HrHub({ profile, embedded = false } = {}) {
  const [tab, setTab] = useState('leave');
  const [leaves, setLeaves] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, scheduled: 0, completed: 0 });
  const [leavePage, setLeavePage] = useState({});
  const [reviewPage, setReviewPage] = useState({});
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('Sign-in is required to load HR records.');
      setMe(user);
      const scoped = !MANAGER_ROLES.includes(user.role);
      const leaveQuery = profile ? { staff_name: profile.full_name } : scoped ? { created_by_id: user.id } : {};
      const personalReviews = !!profile || scoped;
      const [leaveRows, reviewsResult, pendingCount, approvedCount, reviewStats] = await Promise.all([
        fetchAllRecords(base44.entities.LeaveRequest, leaveQuery, '-created_date'),
        personalReviews ? base44.functions.invoke('hrPaperwork', { action: 'list', kind: 'review', ...(profile?.id ? { staff_profile_id: profile.id } : {}) }).then((res) => res.data) : fetchAllRecords(base44.entities.PerformanceReview, {}, '-review_date'),
        base44.entities.LeaveRequest.count({ ...leaveQuery, status: 'Pending' }),
        base44.entities.LeaveRequest.count({ ...leaveQuery, status: 'Approved', end_date: { $gte: today() } }),
        personalReviews ? Promise.resolve(null) : base44.entities.PerformanceReview.aggregate({ groupBy: 'status' }),
      ]);
      const reviewRows = reviewsResult.items || [];
      setLeaves(leaveRows);
      setReviews(reviewRows);
      setLeavePage({ has_more: false });
      setReviewPage(reviewsResult);
      const rows = reviewsResult.status_counts || reviewStats?.rows || [];
      setSummary({ pending: pendingCount, approved: approvedCount, scheduled: rows.find((row) => row.status === 'Scheduled')?.count || reviewRows.filter((row) => row.status === 'Scheduled').length, completed: rows.find((row) => row.status === 'Completed')?.count || reviewRows.filter((row) => row.status === 'Completed').length });
    } catch (error) {
      console.error(error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.full_name]);

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
  const payrollVisible = !profile || profile.email?.toLowerCase() === me?.email?.toLowerCase();
  const loadMore = async (kind) => {
    setLoading(true);
    const personalReviews = !!profile || (!!me && !MANAGER_ROLES.includes(me.role));
    const page = kind === 'leave'
      ? await base44.entities.LeaveRequest.filter(profile ? { staff_name: profile.full_name } : !isManager ? { created_by_id: me.id } : {}, { sort: '-created_date', limit: 100, cursor: leavePage.next_cursor })
      : personalReviews ? (await base44.functions.invoke('hrPaperwork', { action: 'list', kind: 'review', ...(profile?.id ? { staff_profile_id: profile.id } : {}), cursor: reviewPage.next_cursor })).data
      : await base44.entities.PerformanceReview.filter({}, { sort: '-review_date', limit: 100, cursor: reviewPage.next_cursor });
    if (kind === 'leave') { setLeaves((old) => [...old, ...page.items]); setLeavePage(page); }
    else { setReviews((old) => [...old, ...page.items]); setReviewPage(page); }
    setLoading(false);
  };

  const needle = query.trim().toLowerCase();
  const matches = (row) => !needle || [row.staff_name, row.leave_type, row.review_type, row.status, row.reviewer].some((f) => (f || '').toLowerCase().includes(needle));
  const shownLeaves = leaves.filter(matches);
  const shownReviews = reviews.filter(matches);
  const tiles = [
    ['Pending leave requests', summary.pending],
    ['Currently on leave / approved', summary.approved],
    ['Reviews scheduled', summary.scheduled],
    ['Reviews completed', summary.completed],
  ].map(([label, value]) => (
    <div key={label}>
      <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{loading ? '…' : value}</p>
    </div>
  ));

  return (
    <div className={embedded ? 'min-w-0 space-y-3' : 'mx-auto w-full max-w-[1440px] min-w-0 space-y-3 bg-white px-4 py-4 sm:px-6 lg:px-8'}>
      <Tabs value={tab} onValueChange={setTab}>
      <ModuleShell
        embedded={embedded}
        title="HR Hub & Volunteering"
        subtitle="Leave management, performance reviews, Volunteering & Placements, and the TV · Radio · Phone · Computer Goals, Doors & Hobbies Hub."
        icon={UsersRound}
        moduleKey="human-resources"
        insightModule="hr"
        tabs={<HrDashboardNavigation isManager={isManager} payrollVisible={payrollVisible} />}
        actions={
          <>
            <Button
              size="sm"
              className="border-2 border-[#0A2B6D] shadow-sm font-extrabold"
              onClick={() => { setTab('leave'); setShowLeaveForm((open) => !open); }}
            >
              <Plus className="mr-1.5 h-4 w-4" />Log Leave Request
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-[#0A2B6D] bg-white font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
              onClick={() => downloadCsv('leave-register.csv', [
                { label: 'Staff', key: 'staff_name' }, { label: 'Type', key: 'leave_type' }, { label: 'Start', key: 'start_date' },
                { label: 'End', key: 'end_date' }, { label: 'Status', key: 'status' }, { label: 'Coverage', key: 'coverage_arranged' },
              ], leaves)}
            >
              <Download className="mr-1.5 h-4 w-4" />Export Leave Register (CSV)
            </Button>
          </>
        }
        search={<ModuleSearchBar value={query} onChange={setQuery} placeholder="Search leave, volunteering and reviews…" />}
        small={tiles}
      >
        {loadError && <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">HR records could not be confirmed; leave and review totals and lists are unavailable.<Button size="sm" variant="outline" onClick={load}>Retry</Button></div>}
        <TabsContent value="shoreline" className="mt-4">
          <ShorelineCommandCenter />
        </TabsContent>

        <TabsContent value="leave" className="mt-4 space-y-2">
          {embedded && <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowLeaveForm(!showLeaveForm)}><Plus className="mr-2 h-4 w-4" />Log leave request</Button>
            <Button size="sm" variant="outline" onClick={() => downloadCsv('leave-register.csv', [
              { label: 'Staff', key: 'staff_name' }, { label: 'Type', key: 'leave_type' }, { label: 'Start', key: 'start_date' },
              { label: 'End', key: 'end_date' }, { label: 'Status', key: 'status' }, { label: 'Coverage', key: 'coverage_arranged' },
            ], leaves)}>Export CSV</Button>
          </div>}
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
          {loading ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading...</CardContent></Card> : loadError ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Leave register unavailable. Retry after confirming access or connectivity.</CardContent></Card> : leaves.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No leave requests yet.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {shownLeaves.map((l) => (
                <Card key={l.id}><CardContent className="p-2.5 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{l.staff_name}</p>
                      <p className="text-xs text-muted-foreground">{l.leave_type} - {fmt(l.start_date)} to {fmt(l.end_date)}</p>
                      {l.coverage_arranged && <p className="mt-2 text-xs text-muted-foreground">Coverage: {l.coverage_arranged}</p>}
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${l.status === 'Approved' ? 'bg-safe/10 text-safe' : l.status === 'Declined' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{l.status}</span>
                  </div>
                  {isManager && l.status === 'Pending' && (
                    <div className="module-action-bar mt-1.5 flex gap-1">
                      <Button size="sm" className="bg-safe text-white hover:bg-safe/90" onClick={() => decide(l, 'Approved')}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button>
                      <Button size="sm" variant="outline" className="text-danger" onClick={() => decide(l, 'Declined')}><X className="mr-1 h-3.5 w-3.5" />Decline</Button>
                    </div>
                  )}
                </CardContent></Card>
              ))}
            </div>
          )}
          {leavePage.has_more && <Button size="sm" variant="outline" disabled={loading} onClick={() => loadMore('leave')}>Load more leave requests</Button>}
        </TabsContent>

        <TabsContent value="reviews" className="mt-2 space-y-3">
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
          {loading ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading...</CardContent></Card> : loadError ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Review register unavailable. Retry after confirming access or connectivity.</CardContent></Card> : reviews.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No reviews scheduled yet.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {shownReviews.map((r) => (
                <Card key={r.id}><CardContent className="p-2.5 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{r.staff_name}</p>
                      <p className="text-xs text-muted-foreground">{r.review_type} - {fmt(r.review_date)}{r.reviewer ? ` - by ${r.reviewer}` : ''}</p>
                      {r.overall_rating ? <p className="mt-2 text-xs">Rating: {r.overall_rating}/5 {r.outcome ? `- ${r.outcome}` : ''}</p> : null}
                      {r.goals && <p className="mt-2 text-xs text-muted-foreground">Goals: {r.goals}</p>}
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${r.status === 'Completed' ? 'bg-safe/10 text-safe' : r.status === 'Cancelled' ? 'bg-muted text-muted-foreground' : 'bg-warning/10 text-warning'}`}>{r.status}</span>
                  </div>
                  <div className="module-action-bar mt-1.5 flex gap-1">
                    {isManager && r.status !== 'Completed' && <Button size="sm" variant="outline" onClick={() => completeReview(r)}>Mark completed</Button>}
                    {isManager && <Button size="sm" variant="ghost" className="text-danger" onClick={() => remove(base44.entities.PerformanceReview, r.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
          {reviewPage.has_more && <Button size="sm" variant="outline" disabled={loading} onClick={() => loadMore('reviews')}>Load more reviews</Button>}
        </TabsContent>

        <TabsContent value="volunteering" className="mt-2"><Volunteers embedded /></TabsContent>
        <TabsContent value="media-goals" className="mt-2"><HrMediaGoalsHobbiesHub /></TabsContent>
        {isManager && <TabsContent value="performance" className="mt-2"><AppraisalComplianceDashboard /></TabsContent>}
        <TabsContent value="paperwork" className="mt-2">{isManager ? <HrPaperworkPanel /> : <HrEmployeeFiles profile={profile} />}</TabsContent>
        {isManager && <TabsContent value="file-completeness" className="mt-2"><StaffFileCompletenessWidget /></TabsContent>}
        {isManager && <TabsContent value="templates" className="mt-2"><HrTemplatesLibrary /></TabsContent>}
        {isManager && <TabsContent value="skills" className="mt-2"><MasterSkillsAndInstructionsStudio onChanged={load} /></TabsContent>}
        {(isManager || payrollVisible) && <TabsContent value="payroll" className="mt-2">{isManager ? <PayrollHub embedded /> : <MyPayroll />}</TabsContent>}
      </ModuleShell>
      </Tabs>
    </div>
  );
}