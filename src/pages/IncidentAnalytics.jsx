import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';

const CATEGORY_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#06b6d4'];

const MONTHS_BACK = 6;

export default function IncidentAnalytics() {
  const [data, setData] = useState({ trend: [], byCategory: [], byStaff: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const since = startOfMonth(subMonths(new Date(), MONTHS_BACK - 1)).toISOString().slice(0, 10);
    Promise.all([
      base44.entities.Incident.aggregate({
        query: { date_occurred: { $gte: since } },
        dateBucket: { field: 'created_date', unit: 'month' },
      }),
      base44.entities.Incident.aggregate({ groupBy: 'category' }),
      base44.entities.Incident.aggregate({ groupBy: 'reported_by', sort: '-count', limit: 10 }),
    ]).then(([trend, byCategory, byStaff]) => {
      const monthMap = {};
      for (let i = MONTHS_BACK - 1; i >= 0; i--) {
        monthMap[format(subMonths(new Date(), i), 'yyyy-MM')] = 0;
      }
      (trend.rows || []).forEach((r) => {
        const key = (r.dateBucket || r.month || '').slice(0, 7);
        if (key in monthMap) monthMap[key] = r.count;
      });
      setData({
        trend: Object.entries(monthMap).map(([m, count]) => ({ month: format(new Date(`${m}-01`), 'MMM'), count })),
        byCategory: (byCategory.rows || []).map((r) => ({ name: r.category || 'Other', value: r.count })),
        byStaff: (byStaff.rows || []).filter((r) => r.staff_name).map((r) => ({ name: r.staff_name, count: r.count })),
        total: (byCategory.rows || []).reduce((s, r) => s + r.count, 0),
      });
      setLoading(false);
    }).catch((e) => { console.error(e); setLoading(false); });
  }, []);

  const topStaff = data.byStaff[0]?.name;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      <PageHeader
        title="Incident Analytics"
        subtitle="Where incidents are happening and who is reporting them, so support can be directed where it is needed."
        icon={Activity}
      />

      {loading ? (
        <div className="py-20 text-center text-sm text-foreground/40">Loading analytics...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Incidents over the last {MONTHS_BACK} months</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" name="Incidents" stroke="#ef4444" strokeWidth={2} fill="url(#trendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Incidents by category</CardTitle></CardHeader>
              <CardContent className="h-64">
                {data.byCategory.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-foreground/40">No incidents yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                        {data.byCategory.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incidents by staff member</CardTitle>
              <p className="text-xs text-foreground/50">{topStaff ? `${topStaff} reports the most — a sign of strong reporting culture, not necessarily poor practice.` : ''}</p>
            </CardHeader>
            <CardContent className="h-80">
              {data.byStaff.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-foreground/40">No staff-reported incidents yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byStaff} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={70} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Incidents reported" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-foreground/50">Total incidents logged: <span className="font-semibold tabular-nums text-foreground">{data.total}</span></p>
        </>
      )}
    </div>
  );
}