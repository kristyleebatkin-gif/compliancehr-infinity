import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const BAR_COLOR = '#7c3aed';

export default function IssueCategoryChart() {
  const [byCategory, setByCategory] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      base44.entities.ComplianceIssue.aggregate({ groupBy: 'category', sort: '-count' }),
      base44.entities.ComplianceIssue.aggregate({ dateBucket: { field: 'date_logged', unit: 'month' } }),
    ]).then(([cats, months]) => {
      if (cancelled) return;
      setByCategory((cats.rows || []).map((r) => ({ category: r.category || 'Other', count: r.count || 0 })));
      setTrend((months.rows || []).map((r) => {
        const key = Object.keys(r).find((k) => k !== 'count');
        return { month: String(r[key] || '').slice(0, 7), count: r.count || 0 };
      }).filter((r) => r.month));
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }
  if (byCategory.length === 0 && trend.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Issues by category &amp; month</CardTitle>
        <CardDescription>Where compliance concerns are concentrated, and how they trend over time.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} margin={{ top: 4, right: 8, left: -18, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Issues" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Logged" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}