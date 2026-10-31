import React, { useState, useEffect, useMemo } from 'react';
import EmployeePersonalRecords from '@/components/employee/EmployeePersonalRecords';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import SectionCard from '@/components/SectionCard';
import ScoreRing from '@/components/ScoreRing';
import { LMS_ACADEMY_NAME, LMS_PROGRAM_NAME, LMS_MODULES } from '@/lib/lmsCurriculum';
import LmsLearner from '@/components/training/LmsLearner';
import TrainingModuleCard from '@/components/training/TrainingModuleCard';
import TrainingSubjectHeading from '@/components/training/TrainingSubjectHeading';
import TrainingCategoryFilter from '@/components/training/TrainingCategoryFilter';
import TrainingNavigation from '@/components/training/TrainingNavigation';
import TrainingCalendar from '@/components/training/TrainingCalendar';
import TrainingTemplates from '@/components/training/TrainingTemplates';
import TrainingLadder from '@/components/training/TrainingLadder';
import TrainingInsights from '@/components/training/TrainingInsights';
import TrainingStreaks from '@/components/training/TrainingStreaks';
import SkillsGapAnalytics from '@/components/training/SkillsGapAnalytics';
import AiQuizDrill from '@/components/training/AiQuizDrill';
import MasterSkillsAndInstructionsStudio from '@/components/training/MasterSkillsAndInstructionsStudio';
import LivingOrganisationalEcosystemSuite from '@/components/enterprise/LivingOrganisationalEcosystemSuite';
import { Clock, AlertTriangle, CheckCircle2, BookOpen, CalendarDays, LayoutGrid, GraduationCap, Award, Sparkles, TrendingUp, Play, Download, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';

function statusFor(title, completions) {
  const recs = completions.filter((c) => c.module_title === title && c.status === 'Completed');
  if (recs.length === 0) return { status: 'Not Started' };
  const latest = recs.sort((a, b) => (b.completed_date || '').localeCompare(a.completed_date || ''))[0];
  const today = new Date();
  const exp = latest.expiry_date ? new Date(latest.expiry_date) : null;
  if (!exp) return { status: 'Validity Unconfirmed', completion: latest };
  if (exp < today) return { status: 'Expired', completion: latest };
  if ((exp - today) / 86400000 <= 30) return { status: 'Expiring Soon', completion: latest };
  return { status: 'Current', completion: latest };
}

export default function Training({ profile, embedded = false } = {}) {
  const { user } = useAuth();
  const employee = user?.role === 'Employee';
  const completionQuery = employee ? { $or: [{ learner_id: user.id }, { created_by_id: user.id }] } : profile ? { $or: [{ employee_id: profile.id }, { learner_id: profile.id }, { employee_name: profile.full_name }, { learner_name: profile.full_name }] } : {};
  const ownLearning = !profile || profile.email === user?.email;
  const [completions, setCompletions] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [learnerNumber, setLearnerNumber] = useState(null);
  const [view, setView] = useState('modules');
  const [progressOpen, setProgressOpen] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true); setLoadError('');
    try {
      const allPage = employee ? (await base44.functions.invoke('employeePersonalRecords', { action: 'list', view: 'training' })).data : { items: await fetchAllRecords(base44.entities.TrainingCompletion, completionQuery, '-completed_date') };
      setAllCompletions(allPage.items || []);
      const identity = user?.id || '';
      const name = user?.full_name || '';
      const minePage = employee ? allPage : { items: await fetchAllRecords(base44.entities.TrainingCompletion, profile ? completionQuery : { $or: [{ learner_id: identity }, { created_by_id: identity }, ...(name ? [{ employee_name: name }] : [])] }, '-completed_date') };
      setCompletions(minePage.items || []);
    } catch (e) { setLoadError(e.response?.data?.error || e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id, profile?.id, profile?.full_name]);

  const exportTrainingRegister = async () => {
    const all = await fetchAllRecords(base44.entities.TrainingCompletion, completionQuery, '-completed_date');
    downloadCsv('Training-Register.csv', [
      { key: 'learner_name', label: 'Learner' }, { key: 'learner_type', label: 'Learner Type' },
      { key: 'module_title', label: 'Module' }, { key: 'completed_date', label: 'Completed Date' },
      { key: 'expiry_date', label: 'Expiry Date' }, { key: 'score', label: 'Score' },
      { key: 'status', label: 'Status' }, { key: 'certificate_number', label: 'Certificate Number' },
      { key: 'training_notes', label: 'Notes' },
    ], all);
  };

  const stats = useMemo(() => {
    let completed = 0, current = 0, expiring = 0, expired = 0, validityUnconfirmed = 0;
    LMS_MODULES.forEach((m) => {
      const { status } = statusFor(m.title, completions);
      if (status === 'Current') { completed++; current++; }
      else if (status === 'Expiring Soon') { completed++; expiring++; }
      else if (status === 'Expired') { completed++; expired++; }
      else if (status === 'Validity Unconfirmed') { completed++; validityUnconfirmed++; }
    });
    return { completed, current, expiring, expired, validityUnconfirmed, total: LMS_MODULES.length, notStarted: LMS_MODULES.length - completed };
  }, [completions]);

  const progressPct = Math.round((stats.completed / stats.total) * 100);

  const visible = (activeGroup === 'All' ? LMS_MODULES : LMS_MODULES.filter((m) => m.group === activeGroup))
    .filter((m) => !query.trim() || m.title.toLowerCase().includes(query.trim().toLowerCase()));

  const grouped = useMemo(() => {
    const map = {};
    visible.forEach((m) => { (map[m.group] = map[m.group] || []).push(m); });
    return map;
  }, [visible]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-teal/15 p-3 md:p-5">
      <ModuleShell
        embedded={embedded}
        title="Skills Assessment & Capability Centre"
        subtitle={`${LMS_ACADEMY_NAME} · Skills Assessments, Competency Assessments, Qualifications, Certifications, Licences, Registrations, Workplace Assessments & 50-Module LMS (14d/7d/3d/1d/Overdue Alerts)`}
        moduleKey="training"
        tabs={<TrainingNavigation view={view} onChange={setView} personalOnly={employee} />}
        actions={!employee && <Button variant="outline" onClick={exportTrainingRegister} disabled={loading || allCompletions.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>}
        search={<ModuleSearchBar value={query} onChange={(q) => { setQuery(q); if (q.trim()) setView('modules'); }} placeholder="Search training modules..." />}
        insightModule={employee ? undefined : 'training'}
      >


      <LivingOrganisationalEcosystemSuite initialTab="training-competency" />
      <TrainingStreaks completions={completions} meName={profile?.full_name || user?.full_name || ''} />

      <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/25 via-card to-teal/25 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500" />
        <button onClick={() => setProgressOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold font-display text-foreground">
            <TrendingUp className="h-4 w-4 text-brand" />Your progress
            <span className="text-xs font-medium text-foreground/50">· {loadError ? 'Progress unavailable' : stats.completed + ' of ' + stats.total + ' modules completed'}</span>
          </span>
          <span className="text-xs font-semibold text-brand">{progressOpen ? 'Minimise' : 'Expand'}</span>
        </button>
        {progressOpen && (
          <div className="border-t border-border/60 p-4">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex shrink-0 items-center justify-center">
                {loadError ? <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border text-center text-xs text-muted-foreground">Unavailable</div> : <ScoreRing value={progressPct} size={120} label="complete" />
              </div>
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Stat icon={CheckCircle2} label="Current" value={loadError ? '—' : stats.current} tone="safe" />
                <Stat icon={Clock} label="Expiring soon" value={loadError ? '—' : stats.expiring} tone="warning" />
                <Stat icon={AlertTriangle} label="Expired" value={loadError ? '—' : stats.expired} tone="danger" />
                <Stat icon={Clock} label="Expiry unconfirmed" value={loadError ? '—' : stats.validityUnconfirmed} tone="warning" />
                <Stat icon={BookOpen} label="Not started" value={loadError ? '—' : stats.notStarted} tone="muted" />
              </div>
            </div>
          </div>
        )}
      </div>

      {loadError ? (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Training records could not be confirmed. Progress, insights, and competency summaries are unavailable until the load succeeds. <Button variant="outline" onClick={load}>Retry</Button></div>
      ) : view === 'skills' ? (
        <div className="space-y-4">
          <MasterSkillsAndInstructionsStudio onChanged={load} />
          {loading ? (
            <div className="py-12 text-center text-sm text-foreground/40">Loading skills gaps...</div>
          ) : (
            <SkillsGapAnalytics completions={allCompletions} />
          )}
        </div>
      ) : view === 'insights' ? (
        loading ? (
          <div className="py-12 text-center text-sm text-foreground/40">Loading insights...</div>
        ) : (
          <TrainingInsights completions={allCompletions} />
        )
      ) : view === 'drills' ? (
        <AiQuizDrill />
      ) : view === 'ladder' ? (
        loading ? (
          <div className="py-12 text-center text-sm text-foreground/40">Loading ladder...</div>
        ) : (
          <TrainingLadder completions={allCompletions} meName={profile?.full_name || user?.full_name || ''} />
        )
      ) : view === 'templates' ? (
        <TrainingTemplates />
      ) : view === 'calendar' ? (
        loading ? (
          <div className="py-12 text-center text-sm text-foreground/40">Loading calendar...</div>
        ) : (
          <TrainingCalendar completions={completions} />
        )
      ) : (
        <>
          <TrainingCategoryFilter activeGroup={activeGroup} onChange={setActiveGroup} />

          {loading ? (
            <div className="py-12 text-center text-sm text-foreground/40">Loading curriculum...</div>
          ) : loadError ? (
            <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Training records could not be confirmed. Retry to load learner progress.</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([group, mods]) => {
                return (
                  <div key={group}>
                    <TrainingSubjectHeading title={group} group={group} count={mods.length} />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {mods.map((m) => {
                        const { status, completion } = statusFor(m.title, completions);
                        return (
                          <TrainingModuleCard key={m.number} module={m} status={status} completion={completion} onOpen={() => { if (ownLearning) setLearnerNumber(m.number); }} readOnly={!ownLearning} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {employee && <section className="space-y-3"><h2 className="text-sm font-semibold">My certificates</h2><EmployeePersonalRecords view="certificates" /></section>}
      {learnerNumber && (
        <LmsLearner moduleNumber={learnerNumber} user={user} onCompleted={() => { setLearnerNumber(null); load(); }} onClose={() => setLearnerNumber(null)} />
      )}
      </ModuleShell>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    safe: 'border-safe/40 bg-safe/20 text-foreground',
    warning: 'border-warning/40 bg-warning/25 text-foreground',
    danger: 'border-danger/40 bg-danger/20 text-foreground',
    muted: 'border-primary/40 bg-primary/20 text-foreground',
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-card/75"><Icon className="h-4 w-4" /></div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-foreground/50">{label}</div>
    </div>
  );
}