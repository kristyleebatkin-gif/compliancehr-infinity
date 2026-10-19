import React, { useMemo } from 'react';
import { Flame, Trophy } from 'lucide-react';

// Gamified training streaks (Docebo benchmark): consecutive months with at least one completed module.
const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(String(dateStr).slice(0, 10));
  return isNaN(d.getTime()) ? null : keyOf(d);
}

function longestRun(months) {
  const sorted = [...months].sort();
  let best = 0;
  let run = 0;
  sorted.forEach((m, i) => {
    if (i > 0 && sorted[i - 1] === m) return;
    const prev = sorted[i - 1];
    if (prev) {
      const [y, mo] = prev.split('-').map(Number);
      const nextKey = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`;
      run = m === nextKey ? run + 1 : 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
  });
  return best;
}

function streakFor(completions) {
  const months = [...new Set(completions.map((c) => monthKey(c.completed_date)).filter(Boolean))];
  if (!months.length) return { current: 0, longest: 0 };
  const longest = longestRun(months);
  let current = 0;
  let cursor = new Date();
  if (!months.includes(keyOf(cursor))) cursor.setMonth(cursor.getMonth() - 1);
  if (!months.includes(keyOf(cursor))) return { current: 0, longest };
  while (months.includes(keyOf(cursor))) {
    current += 1;
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return { current, longest: Math.max(current, longest) };
}

export default function TrainingStreaks({ completions = [], meName = '' }) {
  const mine = useMemo(
    () => completions.filter((c) => (c.learner_name || c.employee_name) === meName),
    [completions, meName],
  );
  const { current, longest } = useMemo(() => streakFor(mine), [mine]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
        <Flame className="h-5 w-5 text-warning" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">{current > 0 ? `${current}-month learning streak` : 'Start your learning streak'}</p>
        <p className="text-xs text-muted-foreground">
          Complete at least one module every month to keep the streak alive.
        </p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning">
        <Trophy className="h-3.5 w-3.5" />
        Longest streak: {longest} {longest === 1 ? 'month' : 'months'}
      </div>
    </div>
  );
}