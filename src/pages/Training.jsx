import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import ScoreRing from '@/components/ScoreRing';
import { LMS_ACADEMY_NAME, LMS_PROGRAM_NAME, LMS_MODULES, LMS_GROUPS } from '@/lib/lmsCurriculum';
import LmsLearner from '@/components/training/LmsLearner';
import TrainingCalendar from '@/components/training/TrainingCalendar';
import TrainingTemplates from '@/components/training/TrainingTemplates';
import TrainingLadder from '@/components/training/TrainingLadder';
import TrainingInsights from '@/components/training/TrainingInsights';
import AiQuizDrill from '@/components/training/AiQuizDrill';
import { Clock, AlertTriangle, CheckCircle2, BookOpen, CalendarDays, LayoutGrid, GraduationCap, Award, Sparkles, TrendingUp, Play } from 'lucide-react';

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

export default function Training() {
  const { user } = useAuth();
  const [completions, setCompletions] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('All');
  const [learnerNumber, setLearnerNumber] = useState(null);
  const [view, setView] = useState('modules');

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.TrainingCompletion.list('-completed_date', 200);
      setAllCompletions(all);
      const mine = all.filter((c) => (c.learner_id || '') === (user?.id || '') || (c.employee_name || '') === (user?.full_name || '') || (c.created_by_id || '') === (user?.id || ''));
      setCompletions(mine);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);

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
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      <PageHeader
        title="Training Hub"
        subtitle={`${LMS_ACADEMY_NAME} · ${LMS_PROGRAM_NAME} — 50 Module LMS`}
        action={
          <div className="flex rounded-lg border border-border/60 bg-card p-0.5">
            <button onClick={() => setView('modules')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'modules' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><LayoutGrid className="h-3.5 w-3.5" />Modules</button>
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'calendar' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><CalendarDays className="h-3.5 w-3.5" />Calendar</button>
            <button onClick={() => setView('templates')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'templates' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><GraduationCap className="h-3.5 w-3.5" />Role templates</button>
            <button onClick={() => setView('ladder')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'ladder' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><Award className="h-3.5 w-3.5" />Ladder</button>
            <button onClick={() => setView('drills')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'drills' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><Sparkles className="h-3.5 w-3.5" />AI Drills</button>
            <button onClick={() => setView('insights')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'insights' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><TrendingUp className="h-3.5 w-3.5" />Insights</button>
          </div>
        }
      />

      <SectionCard title="Your progress" description={`${stats.completed} of ${stats.total} modules completed`}>
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
      </SectionCard>

      {view === 'insights' ? (
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
          <TrainingLadder completions={allCompletions} meName={user?.full_name || ''} />
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
            <div className="space-y-6">
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
                          <ModuleCard key={m.number} module={m} status={status} completion={completion} onOpen={() => setLearnerNumber(m.number)} />
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
  brand: { active: 'bg-brand text-white', number: 'bg-brand text-white', button: 'bg-brand text-white hover:bg-brand/90', label: 'text-brand' },
  teal: { active: 'bg-teal text-white', number: 'bg-teal text-white', button: 'bg-teal text-white hover:bg-teal/90', label: 'text-teal' },
  danger: { active: 'bg-danger text-white', number: 'bg-danger text-white', button: 'bg-danger text-white hover:bg-danger/90', label: 'text-danger' },
  safe: { active: 'bg-safe text-white', number: 'bg-safe text-white', button: 'bg-safe text-white hover:bg-safe/90', label: 'text-safe' },
  warning: { active: 'bg-warning text-slate-900', number: 'bg-warning text-slate-900', button: 'bg-warning text-slate-900 hover:bg-warning/90', label: 'text-warning' },
};

function Chip({ active, tone = 'brand', onClick, children }) {
  const colors = GROUP_TONES[tone] || GROUP_TONES.brand;
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? colors.active : 'bg-muted text-foreground/60 hover:bg-muted/70'}`}>{children}</button>
  );
}

function ModuleCard({ module, status, completion, onOpen }) {
  const group = LMS_GROUPS.find((item) => item.name === module.group);
  const colors = GROUP_TONES[group?.color] || GROUP_TONES.brand;
  const badge = {
    'Not Started': { cls: 'bg-muted text-foreground/60', label: 'Not started' },
    'Current': { cls: 'bg-safe/10 text-safe', label: 'Current' },
    'Expiring Soon': { cls: 'bg-warning/10 text-warning', label: 'Expiring soon' },
    'Expired': { cls: 'bg-danger/10 text-danger', label: 'Expired' },
  }[status];
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.number}`}>
          <span className="text-sm font-bold">{module.number}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>{badge.label}</span>
      </div>
      <div className={`text-xs font-medium ${colors.label}`}>{module.group}</div>
      <div className="mt-1 text-sm font-semibold leading-snug">{module.title}</div>
      <div className="mt-1 line-clamp-2 text-xs text-foreground/50">{module.description}</div>
      <div className="mt-3 flex items-center gap-3 text-xs text-foreground/50">
        <span>{module.duration_hours}h</span><span>·</span>
        <span>Valid {module.validity_months}m</span>
        {completion?.expiry_date && <><span>·</span><span>Exp {completion.expiry_date}</span></>}
      </div>
      <button onClick={onOpen} className={`mt-auto w-full rounded-lg px-3 py-2.5 text-xs font-semibold text-white ${colors.button}`}>Open Module</button>
    </div>
  );
}