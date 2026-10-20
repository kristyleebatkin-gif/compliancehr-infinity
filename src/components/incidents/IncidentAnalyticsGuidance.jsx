import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LINKS = [
  ['/incidents', 'Incident Clinic — log and manage incidents', 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'],
  ['/incidents/submit', 'Staff incident reporting portal', 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'],
  ['/risks', 'Risk management — assessments and registers', 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'],
  ['/quality', 'Quality & improvement — turn findings into actions', 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'],
  ['/user-guides', 'User guides — incident management how-tos', 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'],
];
const TIPS = [
  ['Report early, report everything.', 'Low-severity near misses are the cheapest lessons you will ever get.'],
  ['Watch the trend, not the single event.', 'A rising monthly line signals workload, environment or communication pressures.'],
  ['Close the loop.', 'Every incident should end with an investigation outcome and, where needed, a change to practice.'],
  ['Feed the register.', 'The incident register and analytics together are your evidence base for audits and board reporting.'],
];

export default function IncidentAnalyticsGuidance() {
  return <div className="grid gap-2 md:grid-cols-2">
    <Card>
      <CardHeader className="p-2.5"><CardTitle className="text-sm">Helpful resources</CardTitle></CardHeader>
      <CardContent className="space-y-1 px-2.5 pb-2.5 text-xs">
        {LINKS.map(([href, label, tone]) => <Link key={href} to={href} className={`block rounded-lg border px-2 py-1.5 font-semibold ${tone}`}>{label}</Link>)}
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="p-2.5"><CardTitle className="text-sm">What good looks like</CardTitle></CardHeader>
      <CardContent className="space-y-1 px-2.5 pb-2.5 text-xs">
        {TIPS.map(([head, body], i) => <div key={head} className="flex gap-2 rounded-lg border border-primary/10 bg-primary/5 px-2 py-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
          <p className="text-muted-foreground"><span className="font-semibold text-foreground">{head}</span> {body}</p>
        </div>)}
      </CardContent>
    </Card>
  </div>;
}