import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import IncidentAnalyticsGuidance from '@/components/incidents/IncidentAnalyticsGuidance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';

const CATEGORY_COLORS = ['#0072FF', '#5A00D6', '#A100FF', '#FF2E9A', '#00C6FF', '#0A2B6D'];

const MONTHS_BACK = 6;

export default function IncidentAnalytics({ embedded = false } = {}) {
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

  const kpiCards = [
    ['Total Incidents Logged', data.total, 'Constructive safety visibility'],
    ['High / Critical Priority', data.bySeverity.filter((s) => s.name === 'High' || s.name === 'Critical').reduce((a, b) => a + b.value, 0), 'Prioritised for immediate support'],
    ['Active & In-Progress', data.byStatus.filter((s) => /open|investigat|progress/i.test(s.name)).reduce((a, b) => a + b.value, 0), 'Guided follow-up underway'],
    ['Locations Monitored', data.byLocation.length, 'Safe environment tracking'],
  ];

  return (
    <div className={embedded ? 'space-y-3' : 'compact-module mx-auto max-w-6xl p-3 space-y-3'}>
      <ModuleShell
        embedded={embedded}
        moduleKey="incident-analytics"
        title="Friendly Incident & Safety Support Analytics"
        subtitle="Supportive, blame-free safety insights showing where extra care, training, or environmental adjustments can help our participants and staff thrive."
        icon={Activity}
        small={loading ? null : kpiCards.map(([label, value, sub]) => (
          <div key={label} className="border-2 border-[#0A2B6D] bg-white">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">{label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0A2B6D]">{value}</p>
            <p className="text-[10px] font-semibold text-[#0072FF]">{sub}</p>
          </div>
        ))}
      />

      {/* Friendly & Supportive Safety Culture Banner */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-sm">
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-4 py-2 text-white"
          style={{ background: 'var(--header-gradient)' }}
        >
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[#00C6FF]" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Positive &amp; Supportive Reporting Culture</span>
              <h3 className="text-sm font-extrabold text-white">Friendly Incident Analytics — Turning Reports into Care &amp; Prevention</h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0072FF]" /> No-Blame Learning View
          </span>
        </div>
        {embedded && !loading && (
          <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-4 bg-[#F5F0FF]/40">
            {kpiCards.map(([label, value, sub]) => (
              <div key={label} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">{label}</p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums text-[#0A2B6D]">{value}</p>
                <p className="text-[10px] font-semibold text-[#0072FF]">{sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm font-bold text-[#0A2B6D]">Loading friendly analytics...</div>
      ) : (
        <>
          <IncidentAnalyticsGuidance />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="p-2.5"><CardTitle className="text-base">By severity</CardTitle></CardHeader>
              <CardContent className="h-52 px-2.5 pb-2.5">
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
              <CardHeader className="p-2.5"><CardTitle className="text-base">By status</CardTitle></CardHeader>
              <CardContent className="h-52 px-2.5 pb-2.5">
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
            <CardHeader className="p-2.5"><CardTitle className="text-base">Incident hotspots (by location)</CardTitle></CardHeader>
            <CardContent className="h-52 px-2.5 pb-2.5">
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
              <CardHeader className="p-2.5"><CardTitle className="text-base">Incidents over the last {MONTHS_BACK} months</CardTitle></CardHeader>
              <CardContent className="h-52 px-2.5 pb-2.5">
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
              <CardHeader className="p-2.5"><CardTitle className="text-base">Incidents by category</CardTitle></CardHeader>
              <CardContent className="h-52 px-2.5 pb-2.5">
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
            <CardHeader className="p-2.5">
              <CardTitle className="text-base">Incidents by staff member</CardTitle>
              <p className="text-xs text-foreground/50">{topStaff ? `${topStaff} reports the most — a sign of strong reporting culture, not necessarily poor practice.` : ''}</p>
            </CardHeader>
            <CardContent className="h-60 px-2.5 pb-2.5">
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