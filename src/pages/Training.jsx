import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import SectionCard from '@/components/SectionCard';
import ScoreRing from '@/components/ScoreRing';
import { LMS_ACADEMY_NAME, LMS_PROGRAM_NAME, LMS_MODULES, LMS_GROUPS } from '@/lib/lmsCurriculum';
import LmsLearner from '@/components/training/LmsLearner';
import TrainingCalendar from '@/components/training/TrainingCalendar';
import TrainingTemplates from '@/components/training/TrainingTemplates';
import TrainingLadder from '@/components/training/TrainingLadder';
import TrainingInsights from '@/components/training/TrainingInsights';
import TrainingStreaks from '@/components/training/TrainingStreaks';
import SkillsGapAnalytics from '@/components/training/SkillsGapAnalytics';
import AiQuizDrill from '@/components/training/AiQuizDrill';
import { Clock, AlertTriangle, CheckCircle2, BookOpen, CalendarDays, LayoutGrid, GraduationCap, Award, Sparkles, TrendingUp, Play, Download, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';

function statusFor(title, completions) {
  const recs = completions.filter((c) => c.module_title === title && c.status === 'Completed');
  if (recs.length === 0) return { status: 'Not Started' };
  const latest = recs.sort((a, b) => (b.completed_date || '').localeCompare(a.completed_date || ''))[0];
  const today = new Date();
  const exp = latest.expiry_date ? new Date(latest.expiry_date) : null;
  if (exp && exp < today) return { status: 'Expired', completion: latest };
  if (exp && (exp - today) / 86400000 <= 30) return { status: 'Expiring Soon', completion: latest };
  return { status: 'Current', completion: latest };
}

export default function Training({ profile, embedded = false } = {}) {
  const { user } = useAuth();
  const completionQuery = profile ? { $or: [{ employee_id: profile.id }, { learner_id: profile.id }, { employee_name: profile.full_name }, { learner_name: profile.full_name }] } : {};
  const ownLearning = !profile || profile.email === user?.email;
  const [completions, setCompletions] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('All');
  const [learnerNumber, setLearnerNumber] = useState(null);
  const [view, setView] = useState('modules');
  const [progressOpen, setProgressOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const allPage = await base44.entities.TrainingCompletion.filter(
        completionQuery,
        { sort: '-completed_date', limit: 200, fields: ['learner_name', 'learner_type', 'module_title', 'completed_date', 'expiry_date', 'score', 'status'] },
      );
      setAllCompletions(allPage.items || []);
      const identity = user?.id || '';
      const name = user?.full_name || '';
      const minePage = await base44.entities.TrainingCompletion.filter(
        profile ? completionQuery : { $or: [{ learner_id: identity }, { created_by_id: identity }, ...(name ? [{ employee_name: name }] : [])] },
        { sort: '-completed_date', limit: 200 },
      );
      setCompletions(minePage.items || []);
    } catch (e) { console.error(e); }
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
    let completed = 0, current = 0, expiring = 0, expired = 0;
    LMS_MODULES.forEach((m) => {
      const { status } = statusFor(m.title, completions);
      if (status === 'Current') { completed++; current++; }
      else if (status === 'Expiring Soon') { completed++; expiring++; }
      else if (status === 'Expired') { completed++; expired++; }
    });
    return { completed, current, expiring, expired, total: LMS_MODULES.length, notStarted: LMS_MODULES.length - completed };
  }, [completions]);

  const progressPct = Math.round((stats.completed / stats.total) * 100);

  const visible = activeGroup === 'All' ? LMS_MODULES : LMS_MODULES.filter((m) => m.group === activeGroup);

  const grouped = useMemo(() => {
    const map = {};
    visible.forEach((m) => { (map[m.group] = map[m.group] || []).push(m); });
    return map;
  }, [visible]);

  return (
    <div className="mx-auto max-w-6xl p-3 md:p-5 space-y-4">
      {!embedded && <PageHeader
        title="Training Hub"
        subtitle={`${LMS_ACADEMY_NAME} · ${LMS_PROGRAM_NAME} — 50 Module LMS`}
        action={<Button variant="outline" onClick={exportTrainingRegister} disabled={loading || allCompletions.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>}
      />}

      <RegisterInsights module="training" />

      <TrainingStreaks completions={completions} meName={profile?.full_name || user?.full_name || ''} />

      <div className="flex flex-wrap rounded-lg border border-border/60 bg-card p-0.5">
        <button onClick={() => setView('modules')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'modules' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><LayoutGrid className="h-3.5 w-3.5" />Modules</button>
        <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'calendar' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><CalendarDays className="h-3.5 w-3.5" />Calendar</button>
        <button onClick={() => setView('templates')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'templates' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><GraduationCap className="h-3.5 w-3.5" />Role templates</button>
        <button onClick={() => setView('ladder')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'ladder' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><Award className="h-3.5 w-3.5" />Ladder</button>
        <button onClick={() => setView('drills')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'drills' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><Sparkles className="h-3.5 w-3.5" />AI Drills</button>
        <button onClick={() => setView('insights')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'insights' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><TrendingUp className="h-3.5 w-3.5" />Insights</button>
        <button onClick={() => setView('skills')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'skills' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><Target className="h-3.5 w-3.5" />Skills</button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-r from-violet-100/70 via-white to-cyan-100/70 shadow-sm dark:border-violet-900 dark:from-violet-950/30 dark:via-card dark:to-cyan-950/30">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500" />
        <button onClick={() => setProgressOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold font-display text-foreground">
            <TrendingUp className="h-4 w-4 text-brand" />Your progress
            <span className="text-xs font-medium text-foreground/50">· {stats.completed} of {stats.total} modules completed</span>
          </span>
          <span className="text-xs font-semibold text-brand">{progressOpen ? 'Minimise' : 'Expand'}</span>
        </button>
        {progressOpen && (
          <div className="border-t border-border/60 p-4">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex shrink-0 items-center justify-center">
                <ScoreRing value={progressPct} size={120} label="complete" />
              </div>
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat icon={CheckCircle2} label="Current" value={stats.current} tone="safe" />
                <Stat icon={Clock} label="Expiring soon" value={stats.expiring} tone="warning" />
                <Stat icon={AlertTriangle} label="Expired" value={stats.expired} tone="danger" />
                <Stat icon={BookOpen} label="Not started" value={stats.notStarted} tone="muted" />
              </div>
            </div>
          </div>
        )}
      </div>

      {view === 'skills' ? (
        loading ? (
          <div className="py-12 text-center text-sm text-foreground/40">Loading skills gaps...</div>
        ) : (
          <SkillsGapAnalytics completions={allCompletions} />
        )
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
          <div className="flex flex-wrap gap-2">
            <Chip active={activeGroup === 'All'} tone="brand" onClick={() => setActiveGroup('All')}>All ({LMS_MODULES.length})</Chip>
            {LMS_GROUPS.map((g) => {
              const count = LMS_MODULES.filter((m) => m.group === g.name).length;
              return <Chip key={g.name} tone={g.color} active={activeGroup === g.name} onClick={() => setActiveGroup(g.name)}>{g.name} ({count})</Chip>;
            })}
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-foreground/40">Loading curriculum...</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([group, mods]) => {
                return (
                  <div key={group}>
                    <div className="mb-3 flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground/70">{group}</h2>
                      <span className="text-xs text-foreground/40">{mods.length} modules</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {mods.map((m) => {
                        const { status, completion } = statusFor(m.title, completions);
                        return (
                          <ModuleCard key={m.number} module={m} status={status} completion={completion} onOpen={() => { if (ownLearning) setLearnerNumber(m.number); }} readOnly={!ownLearning} />
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

      {learnerNumber && (
        <LmsLearner moduleNumber={learnerNumber} user={user} onCompleted={() => { setLearnerNumber(null); load(); }} onClose={() => setLearnerNumber(null)} />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    safe: 'bg-safe/10 text-safe',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    muted: 'bg-muted text-foreground/60',
  };
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-4 w-4" /></div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-foreground/50">{label}</div>
    </div>
  );
}

const GROUP_TONES = {
  brand: { active: 'bg-brand text-white', number: 'bg-gradient-to-br from-blue-600 to-violet-600', button: 'bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90', label: 'text-brand' },
  teal: { active: 'bg-teal text-white', number: 'bg-gradient-to-br from-teal-500 to-cyan-500', button: 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90', label: 'text-teal' },
  danger: { active: 'bg-danger text-white', number: 'bg-gradient-to-br from-rose-500 to-red-500', button: 'bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90', label: 'text-danger' },
  safe: { active: 'bg-safe text-white', number: 'bg-gradient-to-br from-emerald-500 to-teal-500', button: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90', label: 'text-safe' },
  warning: { active: 'bg-warning text-slate-900', number: 'bg-gradient-to-br from-amber-400 to-orange-500', button: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:opacity-90', label: 'text-warning' },
};

function Chip({ active, tone = 'brand', onClick, children }) {
  const colors = GROUP_TONES[tone] || GROUP_TONES.brand;
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? colors.active : 'bg-muted text-foreground/60 hover:bg-muted/70'}`}>{children}</button>
  );
}

function ModuleCard({ module, status, completion, onOpen, readOnly = false }) {
  const group = LMS_GROUPS.find((item) => item.name === module.group);
  const colors = GROUP_TONES[group?.color] || GROUP_TONES.brand;
  const badge = {
    'Not Started': { cls: 'bg-muted text-foreground/60', label: 'Not started' },
    'Current': { cls: 'bg-safe/10 text-safe', label: 'Current' },
    'Expiring Soon': { cls: 'bg-warning/10 text-warning', label: 'Expiring soon' },
    'Expired': { cls: 'bg-danger/10 text-danger', label: 'Expired' },
  }[status];
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`h-1.5 w-full ${colors.number}`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${colors.number}`}>
            <span className="text-sm font-bold">{module.number}</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge.cls}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />{badge.label}
          </span>
        </div>
        <div className={`text-[11px] font-bold uppercase tracking-wide ${colors.label}`}>{module.group}</div>
        <div className="mt-1 text-[15px] font-semibold leading-snug">{module.title}</div>
        <div className="mt-1 line-clamp-2 text-xs text-foreground/50">{module.description}</div>
        <div className="mt-3 flex items-center gap-3 text-xs text-foreground/50">
          <span>{module.duration_hours}h</span><span>·</span>
          <span>Valid {module.validity_months}m</span>
          {completion?.expiry_date && <><span>·</span><span>Exp {completion.expiry_date}</span></>}
        </div>
        <button onClick={onOpen} disabled={readOnly} className={`mt-auto w-full rounded-xl px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 ${colors.button}`}>{readOnly ? 'Learner access only' : 'Open Module'}</button>
      </div>
    </div>
  );
}