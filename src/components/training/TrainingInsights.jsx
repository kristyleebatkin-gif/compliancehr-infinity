import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LMS_MODULES, LMS_GROUPS } from '@/lib/lmsCurriculum';
import { Trophy, AlertTriangle, Users } from 'lucide-react';

const GROUP_HEX = { brand: '#6366f1', teal: '#06b6d4', danger: '#ef4444', safe: '#22c55e', warning: '#f59e0b' };

export default function TrainingInsights({ completions, onOpenLearner }) {
  const data = useMemo(() => {
    const today = new Date();
    const byStaff = {};
    completions.forEach((c) => {
      const key = c.employee_name || c.learner_name || 'Unknown';
      const row = (byStaff[key] = byStaff[key] || { name: key, modules: new Set(), expired: 0, expiring: 0 });
      if (c.status !== 'Completed') return;
      const exp = c.expiry_date ? new Date(c.expiry_date) : null;
      if (exp && exp < today) { row.expired++; return; }
      if (exp && (exp - today) / 86400000 <= 30) { row.expiring++; row.modules.add(c.module_title); return; }
      row.modules.add(c.module_title);
    });
    const staff = Object.values(byStaff).map((s) => ({
      ...s,
      completed: s.modules.size,
      pct: Math.round((s.modules.size / LMS_MODULES.length) * 100),
      modules: undefined,
    })).sort((a, b) => b.pct - a.pct);

    const groups = LMS_GROUPS.map((g) => {
      const mods = LMS_MODULES.filter((m) => m.group === g.name);
      const titles = new Set(mods.map((m) => m.title));
      let done = 0;
      completions.forEach((c) => { if (c.status === 'Completed' && titles.has(c.module_title)) done++; });
      const expiryDated = completions.filter((c) => c.status === 'Completed' && titles.has(c.module_title) && c.expiry_date);
      const live = expiryDated.filter((c) => new Date(c.expiry_date) >= today).length + completions.filter((c) => c.status === 'Completed' && titles.has(c.module_title) && !c.expiry_date).length;
      const total = mods.length * (staff.length || 1);
      return { name: g.name.replace(/ & /g, ' &\u00a0'), hex: GROUP_HEX[g.color] || '#6366f1', pct: total ? Math.round((live / total) * 100) : 0, modules: mods.length };
    });

    const attention = staff.filter((s) => s.expired > 0).sort((a, b) => b.expired - a.expired);
    return { staff, groups, attention, avg: staff.length ? Math.round(staff.reduce((t, s) => t + s.pct, 0) / staff.length) : 0 };
  }, [completions]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10"><Users className="h-4 w-4 text-brand" /></div>
          <p className="mt-2 text-2xl font-bold">{data.staff.length}</p>
          <p className="text-xs text-foreground/50">Learners with completions</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-safe/10"><Trophy className="h-4 w-4 text-safe" /></div>
          <p className="mt-2 text-2xl font-bold">{data.avg}%</p>
          <p className="text-xs text-foreground/50">Average curriculum completion</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10"><AlertTriangle className="h-4 w-4 text-danger" /></div>
          <p className="mt-2 text-2xl font-bold">{data.attention.reduce((t, s) => t + s.expired, 0)}</p>
          <p className="text-xs text-foreground/50">Expired modules across the team</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="font-semibold">Live coverage by curriculum group</p>
          <p className="text-xs text-muted-foreground">In-date completions as a share of every learner&apos;s required modules.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.groups} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} />
                <YAxis type="category" dataKey="name" width={150} fontSize={11} />
                <Tooltip formatter={(v) => [`${v}%`, 'Live coverage']} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={18}>
                  {data.groups.map((g) => <Cell key={g.name} fill={g.hex} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold">Learner progress</p>
            {data.staff.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No completions recorded yet.</p> : (
              <div className="mt-3 space-y-2">
                {data.staff.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5">
                    <span className="text-xs font-bold text-foreground/30">#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.name}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${s.pct}%` }} /></div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{s.pct}%</p>
                      <p className="text-[10px] text-foreground/40">{s.completed}/{LMS_MODULES.length} done</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold">Needs attention (expired training)</p>
            {data.attention.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No expired training - the whole team is in date.</p> : (
              <div className="mt-3 space-y-2">
                {data.attention.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/5 p-2.5">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Badge className="bg-danger/10 text-danger">{s.expired} expired</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}