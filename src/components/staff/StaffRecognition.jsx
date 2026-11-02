import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { downloadCsv } from '@/lib/csvExport';
import LeaderboardSettingsDialog from '@/components/staff/LeaderboardSettingsDialog';
import { Trophy, Award, Download, ShieldCheck, Users, BadgeCheck, Star } from 'lucide-react';

const PODIUM = [
  { icon: Trophy, label: 'Champion', chip: 'from-amber-100 to-yellow-50 text-amber-800 border-amber-300 dark:from-amber-500/20 dark:to-yellow-500/10 dark:text-amber-300 dark:border-amber-500/30' },
  { icon: Award, label: 'Runner-up', chip: 'from-slate-100 to-slate-50 text-slate-700 border-slate-300 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300 dark:border-slate-600' },
  { icon: Award, label: 'Third place', chip: 'from-orange-100 to-amber-50 text-orange-800 border-orange-800 dark:from-orange-500/20 dark:to-amber-500/10 dark:text-orange-300 dark:border-orange-500/30' },
];

export const DEFAULT_WEIGHTS = {
  training_completion_points: 1,
  goal_tracking_points: 1,
  goal_success_points: 1,
  business_milestone_points: 1,
  employment_anniversary_points: 1,
  kpi_achievement_points: 0,
};



const yearsOfService = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
};

// Employee leaderboard and recognition: points weighted by the configurable
// Employee Leaderboard settings, across training, KPIs, milestones and
// anniversaries, plus the consent register, exportable in one click.
export default function StaffRecognition() {
  const [rows, setRows] = useState(null);
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    base44.auth.me()      .then(setUser).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    const [staffPage, settingsPage, certAgg, trainAgg, kpiAgg] = await Promise.all([
      base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name', 'employee_number', 'start_date', 'audit_consent', 'consents_received'] }),
      base44.entities.EmployeeLeaderboardSettings.filter({}, { limit: 1 }),
      base44.entities.Certificate.aggregate({ groupBy: 'staff_name' }),
      base44.entities.TrainingCompletion.aggregate({ groupBy: 'employee_name', query: { learner_type: 'Employee' } }),
      base44.entities.KPI.aggregate({ groupBy: 'employee_name' }),
    ]);
    const certMap = Object.fromEntries((certAgg.rows || []).map((r) => [r.staff_name, r.count]));
    const trainMap = Object.fromEntries((trainAgg.rows || []).map((r) => [r.employee_name, r.count]));
    const kpiMap = Object.fromEntries((kpiAgg.rows || []).map((r) => [r.employee_name, r.count]));
    const weights = { ...DEFAULT_WEIGHTS, ...(settingsPage.items[0] || {}) };
    const kpiNames = Object.keys(kpiMap);
    const milestoneNames = [...new Set([...kpiNames, ...staffPage.items.map((s) => s.full_name)])];
    const milestoneRecords = await base44.entities.EmployeeMilestone.filter({ employee_name: { $in: milestoneNames }, milestone_type: { $in: ['Business Achievement', 'Promotion'] } }, { limit: 1000, fields: ['employee_name'] });
    const milestoneMap = {};
    for (const m of milestoneRecords.items) milestoneMap[m.employee_name] = (milestoneMap[m.employee_name] || 0) + 1;
    const kpiRecords = kpiNames.length ? await base44.entities.KPI.filter({ employee_name: { $in: kpiNames } }, { limit: 500, fields: ['employee_name', 'target_value', 'current_value'] }) : { items: [] };
    const kpiAchievedMap = {};
    for (const k of kpiRecords.items) {
      if (k.current_value != null && k.target_value != null && k.current_value >= k.target_value) {
        kpiAchievedMap[k.employee_name] = (kpiAchievedMap[k.employee_name] || 0) + 1;
      }
    }
    const entries = staffPage.items.map((s) => {
      const certs = certMap[s.full_name] || 0;
      const modules = trainMap[s.full_name] || 0;
      const milestones = milestoneMap[s.full_name] || 0;
      const kpis = kpiMap[s.full_name] || 0;
      const kpiAchieved = kpiAchievedMap[s.full_name] || 0;
      const anniversaries = yearsOfService(s.start_date);
      const points =
        modules * weights.training_completion_points +
        kpis * weights.goal_tracking_points +
        kpiAchieved * weights.kpi_achievement_points +
        milestones * weights.business_milestone_points +
        anniversaries * weights.employment_anniversary_points;
      return { ...s, certs, modules, milestones, kpis, kpiAchieved, anniversaries, points };
    }).sort((a, b) => b.points - a.points);
    const consents = staffPage.items.filter((s) => s.audit_consent === 'Audit consent received').length;
    return { entries, consents, certsTotal: entries.reduce((t, e) => t + e.certs, 0), milestoneTotal: entries.reduce((t, e) => t + e.milestones, 0), weights, settingsId: (settingsPage.items[0] || {}).id };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    load().then((r) => { if (!cancelled) { setRows(r); setSettings({ id: r.settingsId, ...r.weights }); } }).catch(() => { if (!cancelled) setRows({ entries: [], consents: 0, certsTotal: 0, milestoneTotal: 0, weights: DEFAULT_WEIGHTS }); });
    return () => { cancelled = true; };
  }, [load, reloadKey]);

  if (!rows) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  const stats = [
    { icon: Users, label: 'Employees on the board', value: rows.entries.length },
    { icon: BadgeCheck, label: 'Certificates earned', value: rows.certsTotal },
    { icon: Star, label: 'Milestones recorded', value: rows.milestoneTotal },
    { icon: ShieldCheck, label: 'Audit consents received', value: rows.consents },
  ];

  const exportBoard = () => {
    downloadCsv('employee-recognition-board.csv', [
      { key: 'rank', label: 'Rank' }, { key: 'full_name', label: 'Employee' }, { key: 'employee_number', label: 'Employee Number' },
      { key: 'certs', label: 'Certificates' }, { key: 'modules', label: 'Training Modules' }, { key: 'kpis', label: 'KPIs Tracked' },
      { key: 'kpiAchieved', label: 'KPIs Achieved' }, { key: 'milestones', label: 'Milestones' },
      { key: 'anniversaries', label: 'Service Years' }, { key: 'points', label: 'Recognition Points' },
      { key: 'audit_consent', label: 'Audit Consent' }, { key: 'consents_received', label: 'Consents & Logs' },
    ], rows.entries.map((e, i) => ({ ...e, rank: i + 1, consents_received: e.consents_received || '' })));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-700 dark:from-violet-500/20 dark:to-cyan-500/20 dark:text-violet-300"><Icon className="h-5 w-5" /></div>
            <div><p className="font-editorial text-2xl font-bold text-foreground">{value}</p><p className="text-xs font-semibold text-muted-foreground">{label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {PODIUM.map((p, i) => {
          const e = rows.entries[i];
          const Icon = p.icon;
          return (
            <div key={p.label} className={`overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${e ? 'border-border' : 'border-border opacity-50'}`}>
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">{p.label}</span>
              </div>
              <p className="mt-3 truncate font-editorial text-lg font-bold">{e ? e.full_name : 'Waiting for a champion'}</p>
              {e && <p className="text-xs font-semibold opacity-70">{e.points} points · {e.certs} certificates · {e.modules} modules</p>}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <p className="font-semibold">Recognition leaderboard &amp; consent register</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <LeaderboardSettingsDialog settings={settings} user={user} onSaved={() => { setRows(null); setReloadKey((k) => k + 1); }} />
              <Button variant="outline" size="sm" onClick={exportBoard}><Download className="mr-2 h-4 w-4" />Export board</Button>
            </div>
          </div>
          {rows.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees on the board yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Employee</th><th className="py-2 pr-3">Certificates</th>
                    <th className="py-2 pr-3">Modules</th><th className="py-2 pr-3">KPIs</th><th className="py-2 pr-3">Milestones</th>
                    <th className="py-2 pr-3">Service yrs</th><th className="py-2 pr-3">Points</th>
                    <th className="py-2 pr-3">Audit consent</th><th className="py-2">Consents &amp; logs</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.entries.map((e, i) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-bold">{i + 1}</td>
                      <td className="py-2 pr-3 font-medium">{e.full_name}{e.employee_number ? ` · ${e.employee_number}` : ''}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.certs}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.modules}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.kpis}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.milestones}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.anniversaries}</td>
                      <td className="py-2 pr-3 font-semibold">{e.points}</td>
                      <td className="py-2 pr-3"><Badge className={statusTone(e.audit_consent === 'Audit consent received' ? 'Complete' : 'Pending')}>{e.audit_consent || 'Not recorded'}</Badge></td>
                      <td className="max-w-64 py-2 truncate text-muted-foreground" title={e.consents_received || ''}>{e.consents_received || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}