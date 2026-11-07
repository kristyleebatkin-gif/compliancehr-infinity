import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Award } from 'lucide-react';
import { characterFor } from '@/lib/commTypes';
import { format } from 'date-fns';
import useTaskCompetitionSettings from '@/components/tasks/useTaskCompetitionSettings';
import CompetitionSettingsDialog from '@/components/tasks/CompetitionSettingsDialog';
import { generateTaskCertificate } from '@/lib/taskCertificatePdf';

export default function TaskLeaderboard({ compact = true }) {
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [now, setNow] = useState(new Date());
  const { settings, loading: settingsLoading, save: saveSettings } = useTaskCompetitionSettings();
  const [revision, setRevision] = useState(0);

  useEffect(() => base44.entities.TodoTask.subscribe(() => setRevision((value) => value + 1)), []);

  useEffect(() => {
    (async () => {
      const seasonStart = settings.season_start;
      const seasonEnd = format(new Date(settings.season_end), 'yyyy-MM-dd');
      const taskPage = await base44.entities.TodoTask.filter(
        { status: { $in: ['Completed', 'Finalised'] }, completed_date: { $gte: seasonStart, $lte: seasonEnd } },
        { limit: 500, fields: ['responsible', 'completed_date', 'time_taken_minutes', 'title', 'module'] }
      );
      setTasks(taskPage.items || []);
    })();
  }, [settings.season_start, settings.season_end, revision]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
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
        scores.set(name, entry);
      });
    });
    return { year, board: [...scores.values()].sort((a, b) => b.points - a.points) };
  }, [tasks, settings.season_start, settings.season_end]);

  const endAt = new Date(settings.season_end);
  const diff = Math.max(0, endAt - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  const certificate = (entry, rank) => {
    const voucher = settings.vouchers.find((v) => v.rank === rank);
    generateTaskCertificate({
      staffName: entry.name,
      rank,
      points: entry.points,
      totalTasks: entry.tasks.length,
      seasonLabel: season.year,
      voucherText: voucher?.label,
    });
  };

  return (
    <section
      className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#FF2E9A]/60 bg-[#081018] p-2.5 text-white shadow-md"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#FF2E9A] text-white">
            <Trophy className="h-3 w-3 text-white" />
          </span>
          <span className="truncate text-xs font-extrabold text-white">
            Staff Leaderboard · {season.year} ({days}d {hours}h left)
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!compact && <CompetitionSettingsDialog settings={settings} onSave={saveSettings} loading={settingsLoading} />}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded bg-[#162235] border border-white/20 px-2 py-0.5 text-[10px] font-bold text-white"
          >
            {expanded ? 'Compact' : 'Prizes'}
          </button>
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        {season.board.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-[#162235] px-2.5 py-1.5 text-[11px] text-slate-300">
            Complete a shared task to claim 1st place on the Staff Leaderboard.
          </p>
        ) : (
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {season.board.slice(0, expanded ? 8 : 3).map((entry, idx) => {
              const rank = idx + 1;
              const character = characterFor(entry.name);
              return (
                <div
                  key={entry.name}
                  className="flex items-center justify-between rounded-lg border border-white/15 bg-[#162235] px-2.5 py-1 text-[11px] text-white"
                >
                  <span className="truncate font-bold text-white">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`} {character.emoji} {entry.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-extrabold text-[#39E6FF]">{entry.points} pts</span>
                    {expanded && (
                      <button
                        type="button"
                        onClick={() => certificate(entry, rank)}
                        className="rounded bg-[#0072FF] px-1.5 py-0.5 text-[9px] font-bold text-white"
                      >
                        Cert
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {expanded && (
          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10">
            {settings.vouchers.slice(0, 3).map((v) => (
              <div key={v.rank} className="rounded bg-[#162235] border border-white/15 px-2 py-1 text-[10px] text-white">
                <Award className="inline h-3 w-3 text-[#FF2E9A] mr-1" />
                <span className="font-bold">{v.rank === 1 ? '1st:' : v.rank === 2 ? '2nd:' : '3rd:'} {v.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}