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
  const [data, setData] = useState({ trend: [], byCategory: [], byStaff: [], bySeverity: [], byStatus: [], byLocation: [], total: 0 });
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
      base44.entities.Incident.aggregate({ groupBy: 'severity' }),
      base44.entities.Incident.aggregate({ groupBy: 'status' }),
      base44.entities.Incident.aggregate({ groupBy: 'location', sort: '-count', limit: 8 }),
    ]).then(([trend, byCategory, byStaff, bySeverity, byStatus, byLocation]) => {
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
        byStaff: (byStaff.rows || []).filter((r) => r.reported_by).map((r) => ({ name: r.reported_by, count: r.count })),
        bySeverity: (bySeverity.rows || []).map((r) => ({ name: r.severity || 'Unrated', value: r.count })),
        byStatus: (byStatus.rows || []).map((r) => ({ name: r.status || 'Open', value: r.count })),
        byLocation: (byLocation.rows || []).filter((r) => r.location).map((r) => ({ name: r.location, count: r.count })),
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: 'Total incidents logged', value: data.total, tone: 'bg-brand/10 text-brand' },
              { label: 'High / Critical', value: data.bySeverity.filter((s) => s.name === 'High' || s.name === 'Critical').reduce((a, b) => a + b.value, 0), tone: 'bg-red-600/10 text-red-600' },
              { label: 'Open / investigating', value: data.byStatus.filter((s) => /open|investigat|progress/i.test(s.name)).reduce((a, b) => a + b.value, 0), tone: 'bg-warning/10 text-warning' },
              { label: 'Locations involved', value: data.byLocation.length, tone: 'bg-teal/10 text-teal' },
            ].map((card) => (
              <Card key={card.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`rounded-lg p-2 ${card.tone}`}><Activity className="h-5 w-5" /></div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">By severity</CardTitle></CardHeader>
              <CardContent className="h-64">
                {data.bySeverity.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-foreground/40">No incidents yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bySeverity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Incidents" fill="#f97316" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">By status</CardTitle></CardHeader>
              <CardContent className="h-64">
                {data.byStatus.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-foreground/40">No incidents yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                        {data.byStatus.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Incident hotspots (by location)</CardTitle></CardHeader>
            <CardContent className="h-64">
              {data.byLocation.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-foreground/40">No location data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byLocation} layout="vertical" margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Incidents" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Helpful resources</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <a href="/incidents" className="block rounded-lg border border-border/60 px-3 py-2 font-medium hover:bg-muted">Incident Clinic — log and manage incidents</a>
                <a href="/incidents/submit" className="block rounded-lg border border-border/60 px-3 py-2 font-medium hover:bg-muted">Staff incident reporting portal</a>
                <a href="/risks" className="block rounded-lg border border-border/60 px-3 py-2 font-medium hover:bg-muted">Risk management — assessments and registers</a>
                <a href="/quality" className="block rounded-lg border border-border/60 px-3 py-2 font-medium hover:bg-muted">Quality &amp; improvement — turn findings into actions</a>
                <a href="/user-guides" className="block rounded-lg border border-border/60 px-3 py-2 font-medium hover:bg-muted">User guides — incident management how-tos</a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">What good looks like</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Report early, report everything.</span> Low-severity near misses are the cheapest lessons you will ever get.</p>
                <p><span className="font-semibold text-foreground">Watch the trend, not the single event.</span> A rising monthly line signals workload, environment or communication pressures.</p>
                <p><span className="font-semibold text-foreground">Close the loop.</span> Every incident should end with an investigation outcome and, where needed, a change to practice.</p>
                <p><span className="font-semibold text-foreground">Feed the register.</span> The incident register and analytics together are your evidence base for audits and board reporting.</p>
              </CardContent>
            </Card>
          </div>

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