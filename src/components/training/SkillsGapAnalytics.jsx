import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { LMS_MODULES } from '@/lib/lmsCurriculum';

// Skills-gap analytics (Docebo skills intelligence): coverage of the required curriculum per learner.
export default function SkillsGapAnalytics({ completions = [] }) {
  const rows = useMemo(() => {
    const byLearner = {};
    completions.forEach((c) => {
      const name = c.learner_name || c.employee_name || 'Unknown';
      (byLearner[name] = byLearner[name] || new Set()).add(c.module_title);
    });
    const total = LMS_MODULES.length;
    return Object.entries(byLearner).map(([name, done]) => {
      const covered = LMS_MODULES.filter((m) => done.has(m.title)).length;
      const missingGroups = {};
      LMS_MODULES.filter((m) => !done.has(m.title)).forEach((m) => {
        missingGroups[m.group] = (missingGroups[m.group] || 0) + 1;
      });
      const weakest = Object.entries(missingGroups).sort((a, b) => b[1] - a[1])[0];
      return {
        name,
        covered,
        total,
        pct: Math.round((covered / total) * 100),
        missing: total - covered,
        weakest: weakest ? `${weakest[0]} (${weakest[1]})` : '',
      };
    }).sort((a, b) => a.pct - b.pct);
  }, [completions]);

  if (!rows.length) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          Skills gaps appear once training completions are recorded for your team.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-teal-500/10 p-2"><Target className="h-4 w-4 text-teal-600" /></div>
          <div>
            <p className="text-sm font-bold">Skills-gap analytics</p>
            <p className="text-xs text-muted-foreground">Curriculum coverage per learner against the {LMS_MODULES.length}-module program, biggest gaps first</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {rows.map((r) => (
            <div key={r.name} className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs font-semibold tabular-nums text-muted-foreground">{r.covered}/{r.total} · {r.pct}%</p>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${r.pct >= 80 ? 'bg-emerald-500' : r.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {r.missing === 0 ? 'Full curriculum covered' : `${r.missing} module${r.missing === 1 ? '' : 's'} to go${r.weakest ? ` · biggest gap: ${r.weakest}` : ''}`}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}