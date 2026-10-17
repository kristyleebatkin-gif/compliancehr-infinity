import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Target, Users } from 'lucide-react';
import { format } from 'date-fns';
import GoalNotes from '@/components/goals/GoalNotes';
import GoalInsights from '@/components/goals/GoalInsights';
import GoalCoach from '@/components/goals/GoalCoach';

export default function GoalProgress() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ participant_name: '', goal: '', category: '', progress: '', status: 'In Progress', target_date: '', support_needed: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Goal.filter({}, { sort: '-created_date', limit: 200 });
      setGoals(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.participant_name.trim() || !form.goal.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Goal.create({ ...form, progress: Number(form.progress) || undefined });
      setForm({ participant_name: '', goal: '', category: '', progress: '', status: 'In Progress', target_date: '', support_needed: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const setProgress = async (g, value) => {
    await base44.entities.Goal.update(g.id, { progress: value, status: value >= 100 ? 'Achieved' : g.status });
    await load();
  };

  const participants = useMemo(() => {
    const map = new Map();
    goals.forEach((g) => {
      const name = g.participant_name || 'Unassigned';
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(g);
    });
    return [...map.entries()].map(([name, list]) => {
      const avg = Math.round(list.reduce((sum, g) => sum + (g.progress || 0), 0) / list.length);
      const achieved = list.filter((g) => g.status === 'Achieved').length;
      return { name, goals: list, avg, achieved };
    }).sort((a, b) => b.avg - a.avg);
  }, [goals]);

  const GoalCard = ({ g, compact }) => (
    <Card key={g.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{g.goal}</p>
            <p className="text-sm text-muted-foreground">{g.participant_name}{g.category ? ` · ${g.category}` : ''}</p>
          </div>
          <Badge className={statusTone(g.status)}>{g.status}</Badge>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(g.progress || 0, 100)}%` }} />
          </div>
          {!compact && (
            <Input type="number" min="0" max="100" value={g.progress ?? 0} onChange={(e) => setProgress(g, Number(e.target.value) || 0)} className="h-8 w-20 text-sm" />
          )}
          {compact && <span className="text-sm font-semibold">{g.progress || 0}%</span>}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{g.target_date ? `Target ${format(new Date(g.target_date), 'd MMM yyyy')}` : ''}{g.support_needed ? ` · Support: ${g.support_needed}` : ''}</span>
          {!compact && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.Goal.delete(g.id); await load(); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
        {!compact && <div className="mt-3"><GoalNotes goal={g} participantName={g.participant_name} /></div>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader icon={Target} title="Goal Progress" subtitle="Participant goals, progress notes and reports." showAlerts={false} />
      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New goal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Participant *</Label><Input value={form.participant_name} onChange={(e) => setForm({ ...form, participant_name: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Goal *</Label><Input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Progress (%)</Label><Input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['In Progress', 'Achieved', 'On Hold'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Target date</Label><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Support needed</Label><Input value={form.support_needed} onChange={(e) => setForm({ ...form, support_needed: e.target.value })} /></div>
              <Button onClick={save} disabled={saving}>Save goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All goals</TabsTrigger>
            <TabsTrigger value="participants">Progress by participant</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="coach">AI goal coach</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {goals.length === 0 ? (
              <Card><CardContent className="p-10 text-center text-muted-foreground">No goals recorded yet.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {goals.map((g) => <GoalCard key={g.id} g={g} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="participants" className="mt-4">
            {participants.length === 0 ? (
              <Card><CardContent className="p-10 text-center text-muted-foreground">No goals recorded yet.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {participants.map((p) => (
                  <Card key={p.name}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand"><Users className="h-4 w-4" /></div>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.goals.length} goal{p.goals.length === 1 ? '' : 's'} · {p.achieved} achieved</p>
                          </div>
                        </div>
                        <Badge className={statusTone(p.avg >= 100 ? 'Achieved' : p.avg >= 50 ? 'In Progress' : 'On Hold')}>{p.avg}% overall</Badge>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(p.avg, 100)}%` }} />
                      </div>
                      <div className="mt-3 space-y-2">
                        {p.goals.map((g) => <GoalCard key={g.id} g={g} compact />)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <GoalInsights goals={goals} />
          </TabsContent>

          <TabsContent value="coach" className="mt-4">
            <GoalCoach goals={goals} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}