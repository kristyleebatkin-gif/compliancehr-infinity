import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, ListChecks, Lightbulb, ShieldAlert } from 'lucide-react';

export default function GoalCoach({ goals }) {
  const [selected, setSelected] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    const goal = goals.find((g) => g.id === selected);
    if (!goal) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('goalCoach', {
        participant_name: goal.participant_name,
        goal: goal.goal,
        category: goal.category,
        progress: goal.progress,
        target_date: goal.target_date,
        support_needed: goal.support_needed,
      });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'The goal coach could not run. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-brand" />AI goal coach</p>
          <p className="mb-3 text-xs text-muted-foreground">Pick a goal and the coach drafts measurable milestones, day-to-day support strategies and barrier mitigations you can fold into progress notes and plans.</p>
          <div className="flex flex-wrap gap-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="max-w-sm"><SelectValue placeholder="Select a goal" /></SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.participant_name} - {g.goal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={run} disabled={!selected || running}>
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {running ? 'Coaching...' : 'Run coach'}
            </Button>
          </div>
          {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardContent className="p-4"><p className="text-sm">{result.summary}</p></CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><ListChecks className="h-4 w-4 text-brand" />Milestones &amp; action steps</p>
              <ol className="space-y-2">
                {(result.milestones || []).map((m, i) => (
                  <li key={i} className="rounded-xl border border-border/60 p-3">
                    <p className="text-sm font-semibold">{i + 1}. {m.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.detail}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Lightbulb className="h-4 w-4 text-warning" />Support strategies</p>
                <ul className="space-y-2">
                  {(result.strategies || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><Badge className="mt-0.5 bg-brand/10 text-brand">{i + 1}</Badge><span>{s}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold"><ShieldAlert className="h-4 w-4 text-danger" />Barriers &amp; mitigations</p>
                <ul className="space-y-2">
                  {(result.risks || []).map((r, i) => (
                    <li key={i} className="rounded-xl border border-border/60 p-3">
                      <p className="text-sm font-semibold">{r.barrier}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Mitigation: {r.mitigation}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}