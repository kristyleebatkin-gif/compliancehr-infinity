import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  Open: '#A100FF',
  Investigating: '#0072FF',
  Resolved: '#00C6FF',
  Closed: '#0A2B6D',
};

const RATING_COLORS = {
  Low: '#00C6FF',
  Medium: '#0072FF',
  High: '#A100FF',
  Critical: '#FF2E9A',
};

const STATUSES = ['Open', 'Investigating', 'Resolved', 'Closed'];
const RATINGS = ['Low', 'Medium', 'High', 'Critical'];
const RISK_CATEGORIES = ['Operational', 'Clinical', 'Financial', 'Workplace Health & Safety', 'Participant', 'Compliance'];
const CATEGORY_COLORS = ['#00C6FF', '#0072FF', '#0A2B6D', '#5A00D6', '#A100FF', '#FF2E9A', '#FF6EDB', '#C084FC'];

// Derive the original rating scale from the likelihood/impact matrix when no rating field is stored.
const riskRating = (r) => {
  if (r?.rating) return r.rating;
  const impact = String(r?.impact || 'Medium');
  const likelihood = String(r?.likelihood || 'Medium');
  if (impact === 'High' && likelihood === 'High') return 'Critical';
  if (impact === 'High') return 'High';
  if (impact === 'Medium' || likelihood === 'High') return 'Medium';
  return 'Low';
};

const isOpenRisk = (r) => String(r?.status || '').trim().toLowerCase() !== 'closed';
const isOpenHighCriticalRisk = (r) => isOpenRisk(r) && ['High', 'Critical'].includes(riskRating(r));

function StatCard({ icon: Icon, label, value, tone, to }) {
  return (
    <Link
      to={to}
      className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:gap-4"
      style={{ borderColor: `${tone}55`, background: `linear-gradient(135deg, ${tone}2b, hsl(var(--card)) 72%)` }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${tone}, ${tone}99)` }} />
      <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${tone}, ${tone}bb)` }}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-3xl font-extrabold leading-none" style={{ color: tone }}>{value}</div>
        <div className="mt-1 text-sm font-semibold text-foreground/70">{label}</div>
        <div className="mt-1 text-[11px] font-medium text-foreground/45">Open matching records</div>
      </div>
    </Link>
  );
}

export default function DashboardCharts() {
  const [risks, setRisks] = useState([]);
  const [incidentByStatus, setIncidentByStatus] = useState(STATUSES.map((s) => ({ status: s, count: 0 })));
  const [openIncidents, setOpenIncidents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [statusRows, openCount, rsk] = await Promise.all([
          base44.entities.Incident.aggregate({ groupBy: 'status' }),
          base44.entities.Incident.count({ status: { $nin: ['Resolved', 'Closed'] } }),
          // Ratings can be derived from the likelihood/impact matrix, so the risk
          // page is loaded with only the fields the charts need (slim payload).
          base44.entities.Risk.filter({}, { sort: '-created_date', limit: 500, fields: ['status', 'rating', 'impact', 'likelihood', 'category'] }),
        ]);
        if (alive) {
          setIncidentByStatus(STATUSES.map((s) => ({ status: s, count: (statusRows.rows || []).find((r) => r.status === s)?.count || 0 })));
          setOpenIncidents(openCount);
          setRisks(rsk.items || []);
        }
      } catch (e) { console.error(e); }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const highRisks = risks.filter(isOpenHighCriticalRisk).length;

  const riskByRating = RATINGS.map((r) => ({
    rating: r,
    count: risks.filter((x) => riskRating(x) === r).length,
  }));

  const highRiskByCategory = RISK_CATEGORIES.map((c) => ({
    category: c.replace('Workplace Health & Safety', 'WHS'),
    count: risks.filter((x) => isOpenHighCriticalRisk(x) && x.category === c).length,
  })).filter((d) => d.count > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-10 text-sm text-foreground/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading insights…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[#F5F0FF] p-2 sm:grid-cols-2">
        <StatCard icon={AlertTriangle} label="Open incidents" value={openIncidents} tone="#FF2E9A" to="/incidents" />
        <StatCard icon={ShieldAlert} label="Open high / critical risks" value={highRisks} tone="#5A00D6" to="/risks" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 shadow-lg shadow-rose-500/5 dark:border-rose-900 dark:from-rose-950/25 dark:via-card dark:to-orange-950/20">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500" />
          <div className="mb-1 flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-orange-500 text-white shadow-md">
              <AlertTriangle className="h-4 w-4" />
            </span>
            Incidents by Status
          </div>
          <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">Distribution of all tracked incidents</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={incidentByStatus} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {incidentByStatus.map((d) => (
                  <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-4 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/25 dark:via-card dark:to-amber-950/20">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-red-500" />
          <div className="mb-1 flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md">
              <ShieldAlert className="h-4 w-4" />
            </span>
            Risks by Rating
          </div>
          <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">Breakdown of all risks by severity</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskByRating} dataKey="count" nameKey="rating" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {riskByRating.map((d) => (
                  <Cell key={d.rating} fill={RATING_COLORS[d.rating] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-fuchsia-50 p-4 shadow-lg shadow-orange-500/5 dark:border-orange-900 dark:from-orange-950/25 dark:via-card dark:to-fuchsia-950/20">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-cyan-500 via-amber-500 to-fuchsia-500" />
        <div className="mb-1 flex items-center gap-2 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-rose-500 text-white shadow-md">
            <ShieldAlert className="h-4 w-4" />
          </span>
          High-Risk Items by Category
        </div>
        <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">High &amp; Critical risks grouped by category to show where mitigation is needed most</div>
        {highRiskByCategory.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-foreground/50">
            <ShieldAlert className="h-4 w-4" /> No high-risk items recorded
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={highRiskByCategory} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="category" width={70} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="count" name="High-risk items" radius={[0, 6, 6, 0]}>
                {highRiskByCategory.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}