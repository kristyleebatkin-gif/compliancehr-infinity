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
    <div className="mx-auto max-w-6xl p-3 md:p-5 space-y-4">
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
            {[{ label: 'Total incidents logged', value: data.total, grad: 'from-violet-500 via-purple-500 to-fuchsia-500' },
              { label: 'High / Critical', value: data.bySeverity.filter((s) => s.name === 'High' || s.name === 'Critical').reduce((a, b) => a + b.value, 0), grad: 'from-red-500 via-rose-500 to-orange-500' },
              { label: 'Open / investigating', value: data.byStatus.filter((s) => /open|investigat|progress/i.test(s.name)).reduce((a, b) => a + b.value, 0), grad: 'from-amber-500 via-orange-500 to-yellow-500' },
              { label: 'Locations involved', value: data.byLocation.length, grad: 'from-cyan-500 via-teal-500 to-emerald-500' },
            ].map((card) => (
              <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.grad} p-4 text-white shadow-md`}>
                <div className="w-fit rounded-xl bg-white/20 p-2.5"><Activity className="h-5 w-5" /></div>
                <p className="mt-3 text-3xl font-bold tabular-nums">{card.value}</p>
                <p className="text-sm font-medium text-white/85">{card.label}</p>
              </div>
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
                {[
                  { href: '/incidents', label: 'Incident Clinic — log and manage incidents', tone: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' },
                  { href: '/incidents/submit', label: 'Staff incident reporting portal', tone: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100' },
                  { href: '/risks', label: 'Risk management — assessments and registers', tone: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' },
                  { href: '/quality', label: 'Quality & improvement — turn findings into actions', tone: 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100' },
                  { href: '/user-guides', label: 'User guides — incident management how-tos', tone: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100' },
                ].map((l) => (
                  <a key={l.href} href={l.href} className={`block rounded-xl border px-3.5 py-2.5 font-semibold shadow-sm transition-colors ${l.tone}`}>{l.label}</a>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">What good looks like</CardTitle></CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                {[
                  ['Report early, report everything.', 'Low-severity near misses are the cheapest lessons you will ever get.'],
                  ['Watch the trend, not the single event.', 'A rising monthly line signals workload, environment or communication pressures.'],
                  ['Close the loop.', 'Every incident should end with an investigation outcome and, where needed, a change to practice.'],
                  ['Feed the register.', 'The incident register and analytics together are your evidence base for audits and board reporting.'],
                ].map(([head, body], i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[11px] font-bold text-white">{i + 1}</span>
                    <p className="text-muted-foreground"><span className="font-semibold text-foreground">{head}</span> {body}</p>
                  </div>
                ))}
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