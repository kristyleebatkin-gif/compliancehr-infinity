import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Loader2, ShieldAlert, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';

const RATING_COLOURS = { Low: '#16a34a', Medium: '#ca8a04', High: '#ea580c', Critical: '#dc2626' };
const PIE_COLOURS = ['#7c3aed', '#2563eb', '#16a34a', '#ca8a04', '#ea580c', '#dc2626', '#0891b2'];
const OPEN_RISK_STATUSES = ['Identified', 'Assessed', 'Treating', 'Monitored'];
const OPEN_ISSUE_STATUSES = ['Open', 'In Progress'];

const tick = { fontSize: 12, fontWeight: 600 };

const toRows = (result, key) => (result.rows || [])
  .filter((r) => r[key])
  .map((r) => ({ name: r[key], count: Number(r.count || 0) }));

function ChartCard({ title, children }) {
  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <h3 className="mb-3 font-display text-base font-bold">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

export default function RiskStatusDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [ratingRows, categoryRows, issueStatusRows, issuePriorityRows, openRisks, openIssues] = await Promise.all([
        base44.entities.Risk.aggregate({ query: { status: { $ne: 'Closed' } }, groupBy: 'rating' }),
        base44.entities.Risk.aggregate({ query: { status: { $ne: 'Closed' } }, groupBy: 'category' }),
        base44.entities.ComplianceIssue.aggregate({ query: { status: { $in: OPEN_ISSUE_STATUSES } }, groupBy: 'status' }),
        base44.entities.ComplianceIssue.aggregate({ query: { status: { $in: OPEN_ISSUE_STATUSES } }, groupBy: 'priority' }),
        base44.entities.Risk.filter({ status: { $ne: 'Closed' } }, { sort: '-created_date', limit: 15, fields: ['title', 'category', 'rating', 'status', 'likelihood', 'consequence'] }),
        base44.entities.ComplianceIssue.filter({ status: { $in: OPEN_ISSUE_STATUSES } }, { sort: '-created_date', limit: 15, fields: ['title', 'priority', 'status', 'target_date'] }),
      ]);
      if (!cancelled) {
        setData({
          ratings: toRows(ratingRows, 'rating'),
          categories: toRows(categoryRows, 'category'),
          issueStatuses: toRows(issueStatusRows, 'status'),
          issuePriorities: toRows(issuePriorityRows, 'priority'),
          openRisks: openRisks.items || [],
          openIssues: openIssues.items || [],
        });
      }
    };
    load().catch(() => { if (!cancelled) setData({ ratings: [], categories: [], issueStatuses: [], issuePriorities: [], openRisks: [], openIssues: [] }); });
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading charts…</div>;
  }

  const totalOpenRisks = data.ratings.reduce((s, r) => s + r.count, 0);
  const highRisks = data.ratings.filter((r) => r.name === 'High' || r.name === 'Critical').reduce((s, r) => s + r.count, 0);
  const totalOpenIssues = data.issueStatuses.reduce((s, r) => s + r.count, 0);
  const urgentIssues = data.issuePriorities.filter((r) => r.name === 'High' || r.name === 'Urgent').reduce((s, r) => s + r.count, 0);

  const statCards = [
    { label: 'Open risks', value: totalOpenRisks, colour: '#2563eb', icon: ShieldAlert },
    { label: 'High & critical risks', value: highRisks, colour: '#dc2626', icon: ShieldAlert },
    { label: 'Open compliance issues', value: totalOpenIssues, colour: '#7c3aed', icon: ListChecks },
    { label: 'High & urgent issues', value: urgentIssues, colour: '#ea580c', icon: ListChecks },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="shadow-panel">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-xl p-2" style={{ background: `${card.colour}1a` }}>
                <card.icon className="h-5 w-5" style={{ color: card.colour }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: card.colour }}>{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Risks by rating (open)">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ratings} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.ratings.map((r) => <Cell key={r.name} fill={RATING_COLOURS[r.name] || '#2563eb'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risks by category (open)">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categories} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Compliance issues by status (open)">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.issueStatuses} dataKey="count" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {data.issueStatuses.map((entry, i) => <Cell key={entry.name} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Compliance issues by priority (open)">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.issuePriorities} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="shadow-panel">
          <CardContent className="p-5">
            <h3 className="mb-3 font-display text-base font-bold">Current risks</h3>
            {data.openRisks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No open risks recorded.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-2">Risk</th><th className="py-2">Category</th><th className="py-2">Rating</th><th className="py-2">Status</th>
                </tr></thead>
                <tbody>
                  {data.openRisks.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{r.title}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{r.category}</td>
                      <td className="py-2 pr-2"><Badge className={statusTone(r.rating)}>{r.rating}</Badge></td>
                      <td className="py-2"><Badge className={statusTone(r.status)}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-panel">
          <CardContent className="p-5">
            <h3 className="mb-3 font-display text-base font-bold">Open compliance issues</h3>
            {data.openIssues.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No open compliance issues.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-2">Issue</th><th className="py-2">Priority</th><th className="py-2">Status</th><th className="py-2">Target</th>
                </tr></thead>
                <tbody>
                  {data.openIssues.map((i) => (
                    <tr key={i.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{i.title}</td>
                      <td className="py-2 pr-2"><Badge className={statusTone(i.priority)}>{i.priority}</Badge></td>
                      <td className="py-2 pr-2"><Badge className={statusTone(i.status)}>{i.status}</Badge></td>
                      <td className="py-2 text-muted-foreground tabular-nums">{i.target_date ? format(new Date(i.target_date), 'd MMM yyyy') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}