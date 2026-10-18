import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Send } from 'lucide-react';
import { characterFor, VOUCHERS, JOKES, FUN_FACTS, TEAM_STRATEGIES, COMPETITION_HISTORY } from '@/lib/commTypes';
import { generateTaskCertificate } from '@/lib/taskCertificatePdf';

const SEASON_END_MONTH = 11; // December (0-based)
const SEASON_END_DAY = 1;

export default function TaskLeaderboard() {
  const [tasks, setTasks] = useState([]);
  const [banter, setBanter] = useState([]);
  const [banterText, setBanterText] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    (async () => {
      // Season window is applied on the server so only this season's tasks transfer.
      const year = new Date().getFullYear();
      const seasonStart = `${year}-01-01`;
      const seasonEnd = `${year}-12-01`;
      const taskPage = await base44.entities.TodoTask.filter(
        { status: 'Finalised', completed_date: { $gte: seasonStart, $lte: seasonEnd } },
        { limit: 1000, fields: ['responsible', 'completed_date', 'time_taken_minutes', 'title'] }
      );
      setTasks(taskPage.items || []);
      try {
        const banterPage = await base44.entities.CommunicationEntry.filter({ entry_kind: 'Team Banter' }, { sort: '-created_date', limit: 20 });
        setBanter(banterPage.items || []);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const season = useMemo(() => {
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, SEASON_END_MONTH, SEASON_END_DAY, 12, 0, 0);
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
  }, [tasks]);

  const endAt = new Date(season.year, SEASON_END_MONTH, SEASON_END_DAY, 12, 0, 0);
  const diff = Math.max(0, endAt - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const week = Math.floor(((now - new Date(season.year, 0, 1)) / 86400000) / 7);
  const joke = JOKES[week % JOKES.length];
  const funFact = FUN_FACTS[week % FUN_FACTS.length];

  const fastestOverall = season.seasonTasks.filter((t) => Number(t.time_taken_minutes) > 0)
    .sort((a, b) => a.time_taken_minutes - b.time_taken_minutes)[0];
  const slowestOverall = season.seasonTasks.filter((t) => Number(t.time_taken_minutes) > 0)
    .sort((a, b) => b.time_taken_minutes - a.time_taken_minutes)[0];

  const certificate = (entry, rank) => {
    const voucher = VOUCHERS.find((v) => v.rank === rank);
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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Season {season.year} ends 1 Dec, 12pm</p>
          <p className="mt-1 font-mono text-3xl font-bold text-brand" suppressHydrationWarning>
            {days}d {hours}h {minutes}m {seconds}s
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Points reset fresh on 1 January each year and the competition finishes on 1 December at midday.</p>
          <div className="mt-3 grid gap-2 text-left text-xs text-muted-foreground">
            <p><span className="font-semibold text-foreground/70">Weekly joke:</span> {joke}</p>
            <p><span className="font-semibold text-foreground/70">Fun fact:</span> {funFact}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4 text-brand" />Prizes &amp; certificate</p>
          <ul className="space-y-1.5 text-sm">
            {VOUCHERS.map((v) => (
              <li key={v.rank} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span>{v.rank === 1 ? '🥇 1st place' : v.rank === 2 ? '🥈 2nd place' : '🥉 3rd place'}</span>
                <span className="font-semibold">{v.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Leaders get their voucher plus a company certificate showing total tasks completed and their fastest and slowest task, module and time.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-warning" />Employee task completion leaderboard - Season {season.year}</p>
        {season.board.length === 0 ? (
          <p className="text-sm text-muted-foreground">No points yet this season - finalise a shared to-do with people responsible to put them on the board.</p>
        ) : (
          <div className="space-y-2">
            {season.board.map((entry, index) => {
              const rank = index + 1;
              const voucher = VOUCHERS.find((v) => v.rank === rank);
              const character = characterFor(entry.name);
              return (
                <div key={entry.name} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${rank <= 3 ? 'border-warning/40 bg-warning/5' : 'border-border/60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center text-lg font-bold">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</span>
                    <span className="text-2xl" title={character.name}>{character.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{character.name} · {entry.points} point{entry.points === 1 ? '' : 's'} · {entry.tasks.length} task{entry.tasks.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {voucher && <Badge className="bg-warning text-warning-foreground">{voucher.label}</Badge>}
                    <Button variant="outline" size="sm" onClick={() => certificate(entry, rank)}>Certificate</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-3 grid gap-1.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <p><span className="font-semibold text-foreground/70">Fastest task this season:</span> {fastestOverall ? `"${fastestOverall.title}" (${fastestOverall.module || 'General'}, ${fastestOverall.time_taken_minutes} min)` : 'No timed tasks yet'}</p>
          <p><span className="font-semibold text-foreground/70">Slowest task this season:</span> {slowestOverall ? `"${slowestOverall.title}" (${slowestOverall.module || 'General'}, ${slowestOverall.time_taken_minutes} min)` : 'No timed tasks yet'}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Send className="h-4 w-4 text-brand" />Sledge board (keep it kind!)</p>
          <div className="flex gap-2">
            <Input placeholder="A friendly sledge for the team..." value={banterText} onChange={(e) => setBanterText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendBanter()} />
            <Button size="sm" onClick={sendBanter} disabled={!banterText.trim()}>Post</Button>
          </div>
          <div className="mt-3 space-y-1.5">
            {banter.length === 0 ? <p className="text-xs text-muted-foreground">No banter yet - be the first.</p> : banter.map((b) => (
              <p key={b.id} className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                <span className="font-semibold">{b.sender_name || 'Anon'}:</span> {b.body}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="mb-2 text-sm font-semibold">Team building strategies</p>
          <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {TEAM_STRATEGIES.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mb-2 text-sm font-semibold">History of past competitions</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {COMPETITION_HISTORY.map((h) => (
              <p key={h.season} className="rounded-lg bg-muted/40 px-3 py-2"><span className="font-semibold text-foreground/70">{h.season}:</span> {h.note}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}