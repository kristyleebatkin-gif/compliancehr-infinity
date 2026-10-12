import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { downloadCsv } from '@/lib/csvExport';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, BarChart3, Download } from 'lucide-react';
import { format, differenceInCalendarDays, addDays } from 'date-fns';

const PIE_COLOURS = { 'In Progress': '#4f46e5', Achieved: '#16a34a', 'On Hold': '#f59e0b' };

export default function GoalInsights({ goals }) {
  const statusData = useMemo(() => {
    const counts = { 'In Progress': 0, Achieved: 0, 'On Hold': 0 };
    goals.forEach((g) => { counts[g.status] = (counts[g.status] || 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [goals]);

  const categoryData = useMemo(() => {
    const map = new Map();
    goals.forEach((g) => {
      const cat = g.category || 'Uncategorised';
      if (!map.has(cat)) map.set(cat, { total: 0, sum: 0 });
      map.get(cat).total += 1;
      map.get(cat).sum += g.progress || 0;
    });
    return [...map.entries()].map(([name, { total, sum }]) => ({
      name: name.length > 14 ? `${name.slice(0, 13)}...` : name,
      avg: Math.round(sum / total),
      goals: total,
    })).sort((a, b) => b.avg - a.avg);
  }, [goals]);

  const attention = useMemo(() => {
    const today = new Date();
    const soon = addDays(today, 30);
    return goals
      .filter((g) => g.target_date && g.status !== 'Achieved')
      .map((g) => ({ ...g, days: differenceInCalendarDays(new Date(g.target_date), today) }))
      .filter((g) => g.days < 0 || g.target_date <= soon)
      .sort((a, b) => a.days - b.days);
  }, [goals]);

  const exportCsv = () => {
    downloadCsv(
      'goal-progress-report.csv',
      [
        { key: 'participant_name', label: 'Participant' },
        { key: 'goal', label: 'Goal' },
        { key: 'category', label: 'Category' },
        { key: 'progress', label: 'Progress %' },
        { key: 'status', label: 'Status' },
        { key: 'target_date', label: 'Target date' },
        { key: 'support_needed', label: 'Support needed' },
      ],
      goals,
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold"><BarChart3 className="h-4 w-4 text-brand" />Goal status</p>
            {statusData.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No goals yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {statusData.map((s) => <Cell key={s.name} fill={PIE_COLOURS[s.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-bold">Average progress by category</p>
            {categoryData.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No goals yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Avg progress']} />
                    <Bar dataKey="avg" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-bold"><AlertTriangle className="h-4 w-4 text-warning" />Targets needing attention (next 30 days or overdue)</p>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export report CSV</Button>
          </div>
          {attention.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No upcoming or overdue targets - all on track.</p>
          ) : (
            <ul className="space-y-2">
              {attention.map((g) => (
                <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{g.goal}</p>
                    <p className="text-xs text-muted-foreground">{g.participant_name}{g.category ? ` - ${g.category}` : ''}{g.target_date ? ` - target ${format(new Date(g.target_date), 'd MMM yyyy')}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={g.days < 0 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}>
                      {g.days < 0 ? `${Math.abs(g.days)} day${Math.abs(g.days) === 1 ? '' : 's'} overdue` : `${g.days} day${g.days === 1 ? '' : 's'} left`}
                    </Badge>
                    <Badge className={statusTone(g.status)}>{g.progress || 0}%</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}