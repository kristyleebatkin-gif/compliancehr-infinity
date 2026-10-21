import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import { Coffee, FileClock, FileWarning, ClipboardList, CalendarX2, ClipboardCheck, CalendarPlus, ArrowRight } from 'lucide-react';

export default function MorningBrief() {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke('dailyBrief', {})
      .then((res) => { if (!cancelled) setBrief(res.data?.brief || null); })
      .catch((error) => console.error(error))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Card className="morning-brief gradient-brand-soft">
        <CardContent className="flex items-center gap-2 p-4 text-sm text-foreground/60">
          <Coffee className="h-4 w-4 text-brand" /> Preparing your morning brief…
        </CardContent>
      </Card>
    );
  }
  if (!brief) return null;

  const metrics = [
    { icon: FileClock, label: 'Expiring in 30 days', value: brief.expiring_docs.total, to: '/documents', colour: moduleKeyColour('documents') },
    { icon: FileWarning, label: 'Expired documents', value: brief.expired_docs.total, to: '/documents', colour: moduleKeyColour('documents') },
    { icon: ClipboardList, label: 'Overdue tasks', value: brief.overdue_tasks.total, to: '/tasks', colour: moduleKeyColour('tasks') },
    { icon: CalendarX2, label: 'Unfilled shifts (7 days)', value: brief.unfilled_shifts.total, to: '/rostering', colour: moduleKeyColour('rostering') },
    { icon: ClipboardCheck, label: 'Awaiting approval', value: brief.pending_approvals, to: '/rostering', colour: moduleKeyColour('rostering') },
    { icon: CalendarPlus, label: 'Leave requests', value: brief.pending_leave, to: '/hr', colour: moduleKeyColour('human-resources') },
  ];

  const lists = [
    { title: 'Expiring soonest', items: brief.expiring_docs.lines, colour: moduleKeyColour('documents') },
    { title: 'Overdue tasks', items: brief.overdue_tasks.lines, colour: moduleKeyColour('tasks') },
    { title: 'Unfilled shifts', items: brief.unfilled_shifts.lines, colour: moduleKeyColour('rostering') },
  ];
  const colour = moduleKeyColour('dashboard');

  return (
    <Card className="morning-brief shadow-panel" style={{ borderColor: `${colour}99`, background: `linear-gradient(125deg, ${colour}40, ${colour}14)`, boxShadow: `inset 0 4px 0 ${colour}` }}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: colour }}><Coffee className="h-4 w-4" /></div>
            <div>
              <div className="font-bold font-display">Morning brief</div>
              <div className="text-[11px] text-foreground/45">{brief.date_label}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.label} to={m.to} className="morning-brief-metric rounded-xl border p-3 shadow-sm transition-transform hover:-translate-y-0.5" style={{ borderColor: `${m.colour}99`, background: `linear-gradient(125deg, ${m.colour}40, ${m.colour}14)`, boxShadow: `inset 0 3px 0 ${m.colour}` }}>
                <Icon className="h-4 w-4" style={{ color: m.colour }} />
                <div className="mt-1.5 text-xl font-bold leading-none" style={{ color: m.colour }}>{m.value}</div>
                <div className="mt-1 text-[11px] font-medium leading-tight text-foreground/55">{m.label}</div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {lists.map((list) => (
            <div key={list.title} className="morning-brief-list rounded-xl border bg-card p-3" style={{ borderColor: `${list.colour}99` }}>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: list.colour }}>{list.title}</div>
              {list.items.length ? (
                <ul className="mt-1.5 space-y-1">
                  {list.items.map((line, i) => (
                    <li key={i} className="truncate text-xs text-foreground/60" title={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-1.5 text-xs text-safe">All clear</div>
              )}
            </div>
          ))}
        </div>
        <Link to="/compliance" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
          Open the Compliance & Report Centre <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}