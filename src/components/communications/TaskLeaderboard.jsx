import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Send } from 'lucide-react';
import { characterFor } from '@/lib/commTypes';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import useTaskCompetitionSettings from '@/components/tasks/useTaskCompetitionSettings';
import CompetitionSettingsDialog from '@/components/tasks/CompetitionSettingsDialog';
import CompetitionBanterEntry from '@/components/tasks/CompetitionBanterEntry';
import '@/components/tasks/taskCompetition.css';
import '@/components/dashboard/brightActions.css';
import { generateTaskCertificate } from '@/lib/taskCertificatePdf';


export default function TaskLeaderboard() {
  const [tasks, setTasks] = useState([]);
  const [banter, setBanter] = useState([]);
  const [banterText, setBanterText] = useState('');
  const [now, setNow] = useState(new Date());
  const { settings, loading: settingsLoading, error: settingsError, save: saveSettings } = useTaskCompetitionSettings();
  const [revision, setRevision] = useState(0);
  useEffect(() => base44.entities.TodoTask.subscribe(() => setRevision((value) => value + 1)), []);

  useEffect(() => {
    (async () => {
      // Season window is applied on the server so only this season's tasks transfer.
      const seasonStart = settings.season_start;
      const seasonEnd = format(new Date(settings.season_end), 'yyyy-MM-dd');
      // Both Completed and Finalised tasks earn leaderboard points.
      const taskPage = await base44.entities.TodoTask.filter(
        { status: { $in: ['Completed', 'Finalised'] }, completed_date: { $gte: seasonStart, $lte: seasonEnd } },
        { limit: 1000, fields: ['responsible', 'completed_date', 'time_taken_minutes', 'title', 'module'] }
      );
      setTasks(taskPage.items || []);
      try {
        const banterPage = await base44.entities.CommunicationEntry.filter({ entry_kind: 'Team Banter' }, { sort: '-created_date', limit: 20 });
        setBanter(banterPage.items || []);
      } catch { /* ignore */ }
    })();
  }, [settings.season_start, settings.season_end, revision]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const season = useMemo(() => {
    const year = new Date(`${settings.season_start}T00:00:00`).getFullYear();
    const start = new Date(`${settings.season_start}T00:00:00`);
    const end = new Date(settings.season_end);
    const seasonTasks = tasks.filter((t) => {
      const completed = t.completed_date ? new Date(`${t.completed_date}T12:00:00`) : null;
      return completed && completed >= start && completed <= end;
    });
    const scores = new Map();
    seasonTasks.forEach((task) => {
      (task.responsible || []).forEach((name) => {
        const entry = scores.get(name) || { name, points: 0, tasks: [], fastest: null, slowest: null };
        entry.points += 1;
        entry.tasks.push(task);
        if (Number(task.time_taken_minutes) > 0) {
          if (!entry.fastest || Number(task.time_taken_minutes) < Number(entry.fastest.time_taken_minutes)) entry.fastest = task;
          if (!entry.slowest || Number(task.time_taken_minutes) > Number(entry.slowest.time_taken_minutes)) entry.slowest = task;
        }
        scores.set(name, entry);
      });
    });
    return { year, seasonTasks, board: [...scores.values()].sort((a, b) => b.points - a.points) };
  }, [tasks, settings.season_start, settings.season_end]);

  const endAt = new Date(settings.season_end);
  const diff = Math.max(0, endAt - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const week = Math.max(0, Math.floor(((now - new Date(`${settings.season_start}T00:00:00`)) / 86400000) / 7));
  const joke = settings.jokes[week % settings.jokes.length] || '';
  const funFact = settings.fun_facts[week % settings.fun_facts.length] || '';

  const fastestOverall = season.seasonTasks.filter((t) => Number(t.time_taken_minutes) > 0)
    .sort((a, b) => a.time_taken_minutes - b.time_taken_minutes)[0];
  const slowestOverall = season.seasonTasks.filter((t) => Number(t.time_taken_minutes) > 0)
    .sort((a, b) => b.time_taken_minutes - a.time_taken_minutes)[0];

  const certificate = (entry, rank) => {
    const voucher = settings.vouchers.find((v) => v.rank === rank);
    generateTaskCertificate({
      staffName: entry.name,
      rank,
      points: entry.points,
      totalTasks: entry.tasks.length,
      fastestTask: entry.fastest ? `${entry.fastest.module || 'General'} - "${entry.fastest.title}" (${entry.fastest.time_taken_minutes} min)` : '',
      slowestTask: entry.slowest ? `${entry.slowest.module || 'General'} - "${entry.slowest.title}" (${entry.slowest.time_taken_minutes} min)` : '',
      seasonLabel: season.year,
      voucherText: voucher?.label,
    });
  };

  const sendBanter = async () => {
    if (!banterText.trim()) return;
    const user = await base44.auth.me();
    await base44.entities.CommunicationEntry.create({
      entry_kind: 'Team Banter',
      person_type: 'General',
      subject: 'Team banter',
      body: banterText,
      entry_date: new Date().toISOString().slice(0, 10),
      sender_name: user?.full_name || '',
      sender_email: user?.email || '',
      module: 'Tasks',
    });
    setBanterText('');
    const banterPage = await base44.entities.CommunicationEntry.filter({ entry_kind: 'Team Banter' }, { sort: '-created_date', limit: 20 });
    setBanter(banterPage.items || []);
  };

  return (
    <details className="task-competition">
      <summary>Task competition & leaderboard</summary>
      <div className="competition-content space-y-4">
      <div className="flex justify-end"><CompetitionSettingsDialog settings={settings} onSave={saveSettings} loading={settingsLoading} /></div>
      {settingsError && <p role="alert" className="text-sm text-destructive">Unable to load competition settings: {settingsError.message}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Season {season.year} ends {format(endAt, 'd MMM, h:mma')}</p>
          <p className="mt-1 font-mono text-3xl font-bold text-brand" suppressHydrationWarning>
            {days}d {hours}h {minutes}m {seconds}s
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{settings.season_note}</p>
          <div className="mt-3 grid gap-2 text-left text-xs text-muted-foreground">
            <p><span className="font-semibold text-foreground/70">Weekly joke:</span> {joke}</p>
            <p><span className="font-semibold text-foreground/70">Fun fact:</span> {funFact}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4 text-brand" />{settings.prizes_title}</p>
          <ul className="space-y-1.5 text-sm">
            {settings.vouchers.map((v) => (
              <li key={v.rank} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span>{v.rank === 1 ? '🥇 1st place' : v.rank === 2 ? '🥈 2nd place' : '🥉 3rd place'}</span>
                <span className="font-semibold">{v.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">{settings.prizes_note}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-primary" />{settings.leaderboard_title} - Season {season.year}</p>
        {season.board.length === 0 ? (
          <p className="text-sm text-muted-foreground">No points yet this season - complete or finalise a task with people responsible to put them on the board.</p>
        ) : (
          <div className="space-y-2">
            {season.board.map((entry, index) => {
              const rank = index + 1;
              const voucher = settings.vouchers.find((v) => v.rank === rank);
              const character = characterFor(entry.name);
              return (
                <div key={entry.name} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${rank <= 3 ? 'border-primary/40 bg-primary/5' : 'border-border/60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center text-lg font-bold">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</span>
                    <span className="text-2xl" title={character.name}>{character.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{character.name} · {entry.points} point{entry.points === 1 ? '' : 's'} · {entry.tasks.length} task{entry.tasks.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {voucher && <Badge className="bg-primary/20 text-foreground">{voucher.label}</Badge>}
                    <Button variant="outline" size="sm" onClick={() => certificate(entry, rank)}>Certificate</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-3 grid gap-1.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <p><span className="font-semibold text-foreground/70">Fastest task this season:</span> {fastestOverall ? <Link className="font-semibold text-primary underline" to={`/tasks?task=${fastestOverall.id}`}>{fastestOverall.title} ({fastestOverall.module || 'General'}, {fastestOverall.time_taken_minutes} min) · Edit task</Link> : 'No timed tasks yet'}</p>
          <p><span className="font-semibold text-foreground/70">Slowest task this season:</span> {slowestOverall ? <Link className="font-semibold text-primary underline" to={`/tasks?task=${slowestOverall.id}`}>{slowestOverall.title} ({slowestOverall.module || 'General'}, {slowestOverall.time_taken_minutes} min) · Edit task</Link> : 'No timed tasks yet'}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Send className="h-4 w-4 text-brand" />{settings.banter_title}</p>
          <div className="flex gap-2">
            <Input placeholder="A friendly sledge for the team..." value={banterText} onChange={(e) => setBanterText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendBanter()} />
            <Button size="sm" onClick={sendBanter} disabled={!banterText.trim()}>Post</Button>
          </div>
          <div className="mt-3 space-y-1.5">
            {banter.length === 0 ? <p className="text-xs text-muted-foreground">No banter yet - be the first.</p> : banter.map((b) => (
              <CompetitionBanterEntry key={b.id} entry={b} onSaved={async () => { const page = await base44.entities.CommunicationEntry.filter({ entry_kind: 'Team Banter' }, { sort: '-created_date', limit: 20 }); setBanter(page.items || []); }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="mb-2 text-sm font-semibold">{settings.strategies_title}</p>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {settings.team_strategies.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mb-2 text-sm font-semibold">{settings.history_title}</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {settings.history.map((h) => (
              <p key={h.season} className="rounded-lg bg-muted/40 px-3 py-2"><span className="font-semibold text-foreground/70">{h.season}:</span> {h.note}</p>
            ))}
          </div>
        </div>
      </div>
      </div>
    </details>
  );
}