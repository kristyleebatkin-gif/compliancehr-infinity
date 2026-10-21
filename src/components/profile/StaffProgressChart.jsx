import React, { useId } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LabelList } from 'recharts';

export default function StaffProgressChart({ title, data, pendingLabel }) {
  const id = useId().replace(/:/g, '');
  const tick = { fontSize: 11, fontWeight: 600, fill: 'hsl(var(--foreground))' };
  return <Card className="min-w-0 overflow-hidden border-primary/20 shadow-panel">
    <CardHeader className="p-4">
      <CardTitle className="text-base font-bold">{title}</CardTitle>
      <CardDescription>Completed versus {pendingLabel.toLowerCase()} for each staff member</CardDescription>
    </CardHeader>
    <CardContent className="p-4">
      {!data.length ? <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p> : <div className="overflow-x-auto">
        <div className="min-w-80" style={{ height: Math.max(240, data.length * 52 + 80) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 12, right: 20, left: 0, bottom: 8 }} barSize={24}>
              <defs>
                <linearGradient id={`${id}-done`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="hsl(var(--safe))" /><stop offset="100%" stopColor="hsl(var(--hr-evidence))" /></linearGradient>
                <linearGradient id={`${id}-pending`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="hsl(var(--warning))" /><stop offset="100%" stopColor="hsl(var(--profile-peach))" /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={120} tick={tick} tickFormatter={name => name.length > 19 ? `${name.slice(0, 18)}…` : name} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--primary) / .06)' }} contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
              <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, paddingTop: 16, color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="completed" name="Completed" stackId="a" fill={`url(#${id}-done)`} radius={[5, 0, 0, 5]}>
                <LabelList dataKey="completed" position="insideRight" formatter={value => value || ''} fill="hsl(var(--foreground))" fontSize={11} fontWeight={800} />
              </Bar>
              <Bar dataKey="pending" name={pendingLabel} stackId="a" fill={`url(#${id}-pending)`} radius={[0, 5, 5, 0]}>
                <LabelList dataKey="pending" position="insideRight" formatter={value => value || ''} fill="hsl(var(--foreground))" fontSize={11} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>}
    </CardContent>
  </Card>;
}