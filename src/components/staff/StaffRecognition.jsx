import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { downloadCsv } from '@/lib/csvExport';
import { Trophy, Award, Download, ShieldCheck, Users, BadgeCheck, GraduationCap, Loader2 } from 'lucide-react';

const PODIUM = [
  { icon: Trophy, label: 'Champion', chip: 'from-amber-100 to-yellow-50 text-amber-800 border-amber-300' },
  { icon: Award, label: 'Runner-up', chip: 'from-slate-100 to-slate-50 text-slate-700 border-slate-300' },
  { icon: Award, label: 'Third place', chip: 'from-orange-100 to-amber-50 text-orange-800 border-orange-300' },
];

// Employee leaderboard and recognition: certificates, training completions,
// points and every recorded consent, exportable in one click.
export default function StaffRecognition() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [staffPage, certAgg, trainAgg] = await Promise.all([
          base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name', 'employee_number', 'audit_consent', 'consents_received'] }),
          base44.entities.Certificate.aggregate({ groupBy: 'staff_name' }),
          base44.entities.TrainingCompletion.aggregate({ groupBy: 'employee_name', query: { learner_type: 'Employee' } }),
        ]);
        if (cancelled) return;
        const certMap = Object.fromEntries((certAgg.rows || []).map((r) => [r.staff_name, r.count]));
        const trainMap = Object.fromEntries((trainAgg.rows || []).map((r) => [r.employee_name, r.count]));
        const entries = staffPage.items.map((s) => {
          const certs = certMap[s.full_name] || 0;
          const modules = trainMap[s.full_name] || 0;
          return { ...s, certs, modules, points: certs * 3 + modules * 2 };
        }).sort((a, b) => b.points - a.points);
        const consents = staffPage.items.filter((s) => s.audit_consent === 'Audit consent received').length;
        setRows({ entries, consents, certsTotal: entries.reduce((t, e) => t + e.certs, 0), modulesTotal: entries.reduce((t, e) => t + e.modules, 0) });
      } catch {
        if (!cancelled) setRows({ entries: [], consents: 0, certsTotal: 0, modulesTotal: 0 });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!rows) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  const stats = [
    { icon: Users, label: 'Employees on the board', value: rows.entries.length },
    { icon: BadgeCheck, label: 'Certificates earned', value: rows.certsTotal },
    { icon: GraduationCap, label: 'Training modules completed', value: rows.modulesTotal },
    { icon: ShieldCheck, label: 'Audit consents received', value: rows.consents },
  ];

  const exportBoard = () => {
    downloadCsv('employee-recognition-board.csv', [
      { key: 'rank', label: 'Rank' }, { key: 'full_name', label: 'Employee' }, { key: 'employee_number', label: 'Employee Number' },
      { key: 'certs', label: 'Certificates' }, { key: 'modules', label: 'Training Modules' },
      { key: 'points', label: 'Recognition Points' }, { key: 'audit_consent', label: 'Audit Consent' },
      { key: 'consents_received', label: 'Consents & Logs' },
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
            <div key={p.label} className={`overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${e ? p.chip : 'from-muted/40 to-transparent border-border opacity-50'}`}>
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
            <Button variant="outline" size="sm" onClick={exportBoard}><Download className="mr-2 h-4 w-4" />Export board</Button>
          </div>
          {rows.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees on the board yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Employee</th><th className="py-2 pr-3">Certificates</th>
                    <th className="py-2 pr-3">Modules</th><th className="py-2 pr-3">Points</th>
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