import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { downloadCsv } from '@/lib/csvExport';
import { Trophy, Award, Download, Medal, Sparkles } from 'lucide-react';

const LEVELS = [
  { min: 15, name: 'Platinum', tone: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { min: 10, name: 'Gold', tone: 'bg-amber-100 text-amber-800 border-amber-200' },
  { min: 6, name: 'Silver', tone: 'bg-slate-100 text-slate-700 border-slate-300' },
  { min: 3, name: 'Bronze', tone: 'bg-orange-100 text-orange-800 border-orange-200' },
  { min: 1, name: 'New Starter', tone: 'bg-violet-100 text-violet-800 border-violet-200' },
];

const levelFor = (count) => LEVELS.find((l) => count >= l.min) || { name: 'Not started', tone: 'bg-muted text-muted-foreground border-border' };

export default function TrainingLadder({ completions = [], meName = '' }) {
  const board = useMemo(() => {
    const scores = new Map();
    completions.forEach((c) => {
      if (c.status !== 'Completed') return;
      const name = (c.learner_type === 'Participant' ? c.learner_name : c.employee_name) || '';
      if (!name || c.learner_type === 'Participant') return;
      const entry = scores.get(name) || { name, count: 0, scores: [], last: '' };
      entry.count += 1;
      if (c.score) entry.scores.push(Number(c.score));
      if ((c.completed_date || '') > entry.last) entry.last = c.completed_date;
      scores.set(name, entry);
    });
    return [...scores.values()]
      .map((e) => ({ ...e, avg: e.scores.length ? Math.round(e.scores.reduce((a, b) => a + b, 0) / e.scores.length) : null, level: levelFor(e.count) }))
      .sort((a, b) => b.count - a.count);
  }, [completions]);

  const leader = board[0];
  const isMeLeader = leader && meName && leader.name === meName;
  const mine = board.find((e) => e.name === meName);
  const medalTone = ['from-amber-300 to-yellow-500', 'from-slate-300 to-slate-400', 'from-orange-300 to-orange-500'];

  const exportCsv = () => {
    downloadCsv('training-ladder.csv', ['Rank', 'Name', 'Level', 'Modules Completed', 'Average Score', 'Last Completed'], board.map((e, i) => ({
      Rank: i + 1, Name: e.name, Level: e.level.name, 'Modules Completed': e.count, 'Average Score': e.avg != null ? `${e.avg}%` : '', 'Last Completed': e.last,
    })));
  };

  return (
    <div className="space-y-4">
      {isMeLeader && (
        <div className="gradient-brand-soft flex items-center gap-3 rounded-xl border border-brand/20 p-4">
          <Trophy className="h-6 w-6 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-brand">Congratulations, {meName} - you lead the training ladder!</p>
            <p className="text-xs text-foreground/60">You have completed {leader.count} modules, more than anyone on the team. Keep climbing.</p>
          </div>
          <Sparkles className="ml-auto hidden h-5 w-5 text-brand sm:block" />
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Award className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <h3 className="text-base font-bold">Employee Training Ladder</h3>
            <p className="text-xs text-muted-foreground">Ranks every employee by modules completed. Reach 3 modules for Bronze, 6 for Silver, 10 for Gold and 15 for Platinum. Updates as soon as a module is completed.</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4" />Export</Button>
        </div>

        {board.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No training completions yet - finish a module to appear on the ladder.</p>
        ) : (
          <div className="space-y-2">
            {board.map((e, i) => (
              <div key={e.name} className={`flex items-center gap-3 rounded-lg border p-3 ${i === 0 ? 'border-amber-300 bg-amber-50/60' : 'border-border/60 bg-background'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${i < 3 ? medalTone[i] : 'from-muted to-muted text-foreground/60'}`}>
                  {i < 3 ? <Medal className="h-4 w-4" /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {e.name}{i === 0 && <Trophy className="ml-1.5 inline h-4 w-4 text-amber-500" />}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {e.count} module{e.count === 1 ? '' : 's'} · {e.avg != null ? `${e.avg}% avg` : 'no score recorded'}{e.last ? ` · last ${e.last}` : ''}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${e.level.tone}`}>{e.level.name}</span>
                {mine && e.name === mine.name && <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">You</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}